/**
 * Create an operator account.
 *
 *   Local:  npm run create-user            (loads ../.env, uses ts-node)
 *   Prod:   node dist/scripts/createUser.js (inside the container / Render shell)
 *
 * Reads CREATE_USER_EMAIL / CREATE_USER_NAME / CREATE_USER_PASSWORD from the
 * environment when set (handy in a non-interactive shell); otherwise prompts.
 */
import { createInterface } from "readline/promises";
import { stdin, stdout } from "process";
import { z } from "zod";
import { PasswordSchema } from "@sharons-kitchen/shared";
import { prisma } from "../prisma/client";
import { hashPassword } from "../services/authService";

const EmailSchema = z.string().trim().toLowerCase().email();

async function prompt(question: string, opts: { silent?: boolean } = {}): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout, terminal: true });
  try {
    if (!opts.silent) return (await rl.question(question)).trim();

    // Mute echo while typing a password.
    const mutableOut = stdout as unknown as { write: (chunk: string) => boolean };
    const realWrite = mutableOut.write.bind(mutableOut);
    mutableOut.write = (chunk: string) => (/\n/.test(chunk) ? realWrite(chunk) : true);
    try {
      const answer = await rl.question(question);
      realWrite("\n");
      return answer.trim();
    } finally {
      mutableOut.write = realWrite;
    }
  } finally {
    rl.close();
  }
}

async function main(): Promise<void> {
  const email = EmailSchema.parse(process.env.CREATE_USER_EMAIL ?? (await prompt("Email: ")));
  const displayName = (process.env.CREATE_USER_NAME ?? (await prompt("Display name: "))).trim();
  if (!displayName) throw new Error("Display name is required");

  const password = PasswordSchema.parse(
    process.env.CREATE_USER_PASSWORD ??
      (await prompt("Password (min 10 chars): ", { silent: true })),
  );

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error(`A user with email "${email}" already exists (id ${existing.id})`);

  const user = await prisma.user.create({
    data: { email, displayName, passwordHash: await hashPassword(password) },
  });
  console.log(`✓ Created user #${user.id} <${user.email}> "${user.displayName}"`);
}

main()
  .catch((err: unknown) => {
    const message =
      err instanceof z.ZodError
        ? err.issues.map((i) => i.message).join("; ")
        : err instanceof Error
          ? err.message
          : String(err);
    console.error(`✗ ${message}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
