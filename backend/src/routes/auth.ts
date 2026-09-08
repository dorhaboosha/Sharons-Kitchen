import { Router } from "express";
import { LoginSchema } from "@sharons-kitchen/shared";
import { validate } from "../middlewares/validate";
import { requireUser, extractBearerToken } from "../middlewares/auth";
import { sendSuccess } from "../utils/response";
import * as authService from "../services/authService";

const router = Router();

/** Exchange email + password for a session token. */
router.post("/login", validate(LoginSchema), (req, res, next) => {
  const { email, password } = req.body as { email: string; password: string };
  authService
    .login(email, password)
    .then(({ token, user }) => sendSuccess(res, { token, user }))
    .catch(next);
});

/** Revoke the caller's own session. */
router.post("/logout", requireUser, (req, res, next) => {
  const token = extractBearerToken(req);
  Promise.resolve(token ? authService.logout(token) : undefined)
    .then(() => sendSuccess(res, { ok: true }))
    .catch(next);
});

/** Who am I? Used by the frontend to rehydrate on load. */
router.get("/me", requireUser, (req, res) => {
  sendSuccess(res, { user: req.user });
});

export default router;
