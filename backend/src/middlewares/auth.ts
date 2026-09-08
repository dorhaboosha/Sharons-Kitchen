import type { Request, RequestHandler } from "express";
import { AppError } from "../utils/AppError";
import { resolveSession } from "../services/authService";

/** Pull the token out of an `Authorization: Bearer <token>` header, or null. */
export function extractBearerToken(req: Request): string | null {
  const match = /^Bearer\s+(.+)$/i.exec(req.get("authorization") ?? "");
  return match ? match[1].trim() : null;
}

/**
 * Gate: the request must carry a valid session token. On success `req.user` is
 * populated; on failure the request is rejected with `UNAUTHORIZED` / 401 and
 * the same message regardless of *why* it failed.
 */
export const requireUser: RequestHandler = (req, _res, next) => {
  const token = extractBearerToken(req);
  if (!token) {
    next(new AppError("UNAUTHORIZED", 401, "נדרשת הזדהות"));
    return;
  }

  resolveSession(token)
    .then((user) => {
      if (!user) {
        next(new AppError("UNAUTHORIZED", 401, "נדרשת הזדהות"));
        return;
      }
      req.user = user;
      next();
    })
    .catch(next);
};
