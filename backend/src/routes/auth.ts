import { Router } from "express";
import { sendSuccess } from "../utils/response";

const router = Router();

/**
 * Credential check for the frontend login gate. The auth middleware in front
 * of this route does the real work; reaching the handler means the token was
 * valid. No database access.
 */
router.get("/status", (_req, res) => {
  sendSuccess(res, { authenticated: true });
});

export default router;
