import { createHash, randomBytes } from "crypto";
import { hash as argon2Hash, verify as argon2Verify } from "@node-rs/argon2";
import type { AuthUser } from "@sharons-kitchen/shared";
import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";

/** How long a fresh (or freshly-used) session stays valid. */
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
/** Don't rewrite `lastUsedAt` / slide the expiry more than once per this window. */
const SESSION_SLIDE_MS = 24 * 60 * 60 * 1000; // 1 day

/** SHA-256 of the raw token — only this is ever stored or queried. */
export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/** argon2id hash of a plaintext password, for storage. */
export function hashPassword(password: string): Promise<string> {
  return argon2Hash(password);
}

// A valid argon2 hash of a throwaway value. When a login names an unknown
// account we still run a verify against this, so a missing user and a wrong
// password take the same time. Computed once at module load (before the server
// starts listening) so the first unknown-email login pays no extra cost.
const decoyHashPromise: Promise<string> = argon2Hash(randomBytes(16).toString("hex"));

function toAuthUser(u: { id: number; email: string; displayName: string }): AuthUser {
  return { id: u.id, email: u.email, displayName: u.displayName };
}

/**
 * Verify credentials and open a session.
 *
 * Throws `UNAUTHORIZED` for every failure mode (unknown email, wrong password,
 * disabled account) with one identical message — callers must not be able to
 * tell which.
 */
export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  const user = await prisma.user.findUnique({ where: { email } });

  const hashToCheck = user?.passwordHash ?? (await decoyHashPromise);
  const passwordOk = await argon2Verify(hashToCheck, password).catch(() => false);

  if (!user || !user.isActive || !passwordOk) {
    throw new AppError("UNAUTHORIZED", 401, "אימייל או סיסמה שגויים");
  }

  const rawToken = randomBytes(32).toString("base64url");
  await prisma.session.create({
    data: {
      tokenHash: hashToken(rawToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });

  return { token: rawToken, user: toAuthUser(user) };
}

/**
 * Resolve a raw bearer token to its user, or `null` if the token is unknown,
 * expired, or belongs to a disabled account. Slides the expiry forward at most
 * once a day so an active operator is not logged out mid-use.
 */
export async function resolveSession(rawToken: string): Promise<AuthUser | null> {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: true },
  });

  if (!session || session.expiresAt.getTime() <= Date.now() || !session.user.isActive) {
    return null;
  }

  if (Date.now() - session.lastUsedAt.getTime() > SESSION_SLIDE_MS) {
    await prisma.session.update({
      where: { id: session.id },
      data: {
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });
  }

  return toAuthUser(session.user);
}

/** Revoke a single session. A no-op if the token is already gone. */
export async function logout(rawToken: string): Promise<void> {
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(rawToken) } });
}
