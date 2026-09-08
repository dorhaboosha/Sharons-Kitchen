import { z } from "zod";

/**
 * Login credentials sent to `POST /api/auth/login`.
 *
 * The password is only length-bounded here (not policy-checked) — login must
 * accept whatever a valid account was created with, and must not leak the
 * policy to an attacker. Strength rules live in {@link PasswordSchema}, which
 * is enforced when an account is created.
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "נדרשת כתובת אימייל")
    .max(254, "כתובת האימייל ארוכה מדי")
    .email("כתובת אימייל לא תקינה"),
  password: z.string().min(1, "נדרשת סיסמה").max(200, "הסיסמה ארוכה מדי"),
});

export type LoginData = z.infer<typeof LoginSchema>;
