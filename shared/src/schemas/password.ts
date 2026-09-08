import { z } from "zod";

/**
 * Strength rules for a new account password. Enforced only when a password is
 * *set* (account creation, future password change) — never on login.
 *
 * Deliberately modest for a single-operator tool: a length floor is the single
 * most effective rule; composition requirements mostly push people toward
 * predictable substitutions.
 */
export const PasswordSchema = z
  .string()
  .min(10, "הסיסמה חייבת להכיל לפחות 10 תווים")
  .max(200, "הסיסמה ארוכה מדי");

export type PasswordData = z.infer<typeof PasswordSchema>;
