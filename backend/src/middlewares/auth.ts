import { timingSafeEqual } from "crypto";
import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError";

/** Constant-time string comparison that also tolerates length mismatches. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Requires `Authorization: Bearer <token>` matching `expectedToken`.
 *
 * If `expectedToken` is undefined (only possible outside production — the
 * config layer requires it there) the guard is a no-op and logs a loud
 * warning at startup, so local dev stays frictionless.
 */
export function requireApiToken(expectedToken: string | undefined): RequestHandler {
  if (!expectedToken) {
    console.warn(
      "\n⚠  API_ACCESS_TOKEN is not set — the API is running UNAUTHENTICATED.\n" +
        "   Set API_ACCESS_TOKEN in the environment to require a credential.\n",
    );
    return (_req, _res, next) => next();
  }

  return (req, _res, next) => {
    const match = /^Bearer\s+(.+)$/i.exec(req.get("authorization") ?? "");
    if (!match || !safeEqual(match[1], expectedToken)) {
      next(new AppError("UNAUTHORIZED", 401, "נדרשת הזדהות"));
      return;
    }
    next();
  };
}
