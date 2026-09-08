import type { AuthUser } from "@sharons-kitchen/shared";

declare global {
  namespace Express {
    interface Request {
      /** Set by `requireUser` once a valid session token has been resolved. */
      user?: AuthUser;
    }
  }
}

export {};
