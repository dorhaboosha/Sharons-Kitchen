import { z } from "zod";

/**
 * Environment contract for the backend. Parsed once at startup; a bad or
 * missing value stops the process with a clear message instead of failing
 * later in a confusing way (or silently falling back to a dev default in
 * production).
 */
const EnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().max(65535).default(3000),
    DATABASE_URL: z.string().min(1, "required (the PostgreSQL connection string)"),
    FRONTEND_URL: z
      .string()
      .url("must be a full URL, e.g. https://your-frontend.onrender.com")
      .transform((u) => u.replace(/\/+$/, "")) // browsers send an origin with no trailing slash
      .optional(),
    // Shared credential the frontend must present as `Authorization: Bearer <token>`.
    // Interim gate until real per-user auth exists.
    API_ACCESS_TOKEN: z
      .string()
      .min(16, "must be at least 16 characters (use a long random value)")
      .optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === "production" && !env.FRONTEND_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["FRONTEND_URL"],
        message: "required in production (the browser origin allowed by CORS)",
      });
    }
    if (env.NODE_ENV === "production" && !env.API_ACCESS_TOKEN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["API_ACCESS_TOKEN"],
        message: "required in production (the shared API credential)",
      });
    }
  });

export interface AppConfig {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  DATABASE_URL: string;
  frontendUrl: string;
  /** Shared bearer credential; undefined only in dev (auth then disabled). */
  apiAccessToken: string | undefined;
  isProduction: boolean;
}

/** Validate a raw environment bag. Throws with an aggregated message on failure. */
export function parseEnv(env: NodeJS.ProcessEnv): AppConfig {
  const result = EnvSchema.safeParse(env);

  if (!result.success) {
    const lines = result.error.issues.map(
      (issue) => `  - ${issue.path.join(".") || "(env)"}: ${issue.message}`,
    );
    throw new Error(`Invalid environment configuration:\n${lines.join("\n")}`);
  }

  const data = result.data;
  return {
    NODE_ENV: data.NODE_ENV,
    PORT: data.PORT,
    DATABASE_URL: data.DATABASE_URL,
    // In development, fall back to the Vite dev-server origin.
    frontendUrl: data.FRONTEND_URL ?? "http://localhost:5173",
    apiAccessToken: data.API_ACCESS_TOKEN,
    isProduction: data.NODE_ENV === "production",
  };
}

/**
 * Parse `process.env`, or print the problem and exit. Kept separate from
 * {@link parseEnv} so tests can exercise validation without terminating the
 * process. Called once from server startup.
 */
export function loadConfigOrExit(): AppConfig {
  try {
    return parseEnv(process.env);
  } catch (err) {
    console.error(`\n${(err as Error).message}\n`);
    process.exit(1);
  }
}
