import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../prisma/client", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    session: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("@node-rs/argon2", () => ({
  hash: vi.fn(async (pw: string) => `argon2$of$${pw}`),
  verify: vi.fn(async (hash: string, pw: string) => hash === `argon2$of$${pw}`),
}));

import { prisma } from "../prisma/client";
import { verify as argon2Verify } from "@node-rs/argon2";
import { hashToken, hashPassword, login, resolveSession, logout } from "./authService";

const userFindUnique = vi.mocked(prisma.user.findUnique);
const sessionFindUnique = vi.mocked(prisma.session.findUnique);
const sessionCreate = vi.mocked(prisma.session.create);
const sessionUpdate = vi.mocked(prisma.session.update);
const sessionDeleteMany = vi.mocked(prisma.session.deleteMany);
const verifyMock = vi.mocked(argon2Verify);
const resolve = (value: unknown) => value as never;

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 7,
    email: "sharon@example.com",
    passwordHash: "argon2$of$correct-horse",
    displayName: "שרון",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("hashToken", () => {
  it("is a stable 64-char hex SHA-256 digest", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
    expect(hashToken("abc")).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken("abc")).not.toBe(hashToken("abd"));
  });
});

describe("hashPassword", () => {
  it("delegates to argon2", async () => {
    expect(await hashPassword("s3kret")).toBe("argon2$of$s3kret");
  });
});

describe("login", () => {
  it("issues a session and returns the sanitized user on correct credentials", async () => {
    userFindUnique.mockResolvedValue(resolve(makeUser()));
    sessionCreate.mockResolvedValue(resolve({}));

    const { token, user } = await login("sharon@example.com", "correct-horse");

    expect(token).toEqual(expect.any(String));
    expect(token.length).toBeGreaterThan(20);
    expect(user).toEqual({ id: 7, email: "sharon@example.com", displayName: "שרון" });

    const createArg = sessionCreate.mock.calls[0][0] as { data: Record<string, unknown> };
    expect(createArg.data.userId).toBe(7);
    expect(createArg.data.tokenHash).toBe(hashToken(token));
    expect(createArg.data.tokenHash).not.toBe(token);
    expect(createArg.data.expiresAt).toBeInstanceOf(Date);
    expect((createArg.data.expiresAt as Date).getTime()).toBeGreaterThan(Date.now());
  });

  it("rejects a wrong password with UNAUTHORIZED and creates no session", async () => {
    userFindUnique.mockResolvedValue(resolve(makeUser()));

    await expect(login("sharon@example.com", "wrong")).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      statusCode: 401,
    });
    expect(sessionCreate).not.toHaveBeenCalled();
  });

  it("still runs a verify when the email is unknown (uniform timing) and rejects", async () => {
    userFindUnique.mockResolvedValue(resolve(null));

    await expect(login("ghost@example.com", "whatever")).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(verifyMock).toHaveBeenCalledTimes(1);
    expect(sessionCreate).not.toHaveBeenCalled();
  });

  it("rejects a disabled account even with the right password", async () => {
    userFindUnique.mockResolvedValue(resolve(makeUser({ isActive: false })));

    await expect(login("sharon@example.com", "correct-horse")).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(sessionCreate).not.toHaveBeenCalled();
  });

  it("treats an argon2 error as a failed verification", async () => {
    userFindUnique.mockResolvedValue(resolve(makeUser()));
    verifyMock.mockRejectedValueOnce(new Error("corrupt hash"));

    await expect(login("sharon@example.com", "correct-horse")).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});

describe("resolveSession", () => {
  it("returns the user for a live session and does not slide a recently-used one", async () => {
    sessionFindUnique.mockResolvedValue(
      resolve({
        id: "s1",
        expiresAt: new Date(Date.now() + 1_000_000),
        lastUsedAt: new Date(),
        user: makeUser(),
      }),
    );

    const user = await resolveSession("raw-token");

    expect(user).toEqual({ id: 7, email: "sharon@example.com", displayName: "שרון" });
    expect(sessionFindUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashToken("raw-token") },
      include: { user: true },
    });
    expect(sessionUpdate).not.toHaveBeenCalled();
  });

  it("slides the expiry when the session has not been touched for over a day", async () => {
    sessionFindUnique.mockResolvedValue(
      resolve({
        id: "s1",
        expiresAt: new Date(Date.now() + 1_000_000),
        lastUsedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        user: makeUser(),
      }),
    );
    sessionUpdate.mockResolvedValue(resolve({}));

    await resolveSession("raw-token");

    const updateArg = sessionUpdate.mock.calls[0][0] as {
      where: unknown;
      data: Record<string, Date>;
    };
    expect(updateArg.where).toEqual({ id: "s1" });
    expect(updateArg.data.lastUsedAt).toBeInstanceOf(Date);
    expect(updateArg.data.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("returns null for an unknown token", async () => {
    sessionFindUnique.mockResolvedValue(resolve(null));
    expect(await resolveSession("nope")).toBeNull();
  });

  it("returns null for an expired session", async () => {
    sessionFindUnique.mockResolvedValue(
      resolve({
        id: "s1",
        expiresAt: new Date(Date.now() - 1),
        lastUsedAt: new Date(Date.now() - 1),
        user: makeUser(),
      }),
    );
    expect(await resolveSession("raw-token")).toBeNull();
  });

  it("returns null when the owning account has been disabled", async () => {
    sessionFindUnique.mockResolvedValue(
      resolve({
        id: "s1",
        expiresAt: new Date(Date.now() + 1_000_000),
        lastUsedAt: new Date(),
        user: makeUser({ isActive: false }),
      }),
    );
    expect(await resolveSession("raw-token")).toBeNull();
  });
});

describe("logout", () => {
  it("deletes the session row matching the token hash", async () => {
    sessionDeleteMany.mockResolvedValue(resolve({ count: 1 }));

    await logout("raw-token");

    expect(sessionDeleteMany).toHaveBeenCalledWith({
      where: { tokenHash: hashToken("raw-token") },
    });
  });
});
