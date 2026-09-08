import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { loadConfigOrExit } from "./config";
import { errorHandler } from "./middlewares/errorHandler";
import { requireUser } from "./middlewares/auth";
import { sendError } from "./utils/response";
import dishesRouter from "./routes/dishes";
import authRouter from "./routes/auth";

const config = loadConfigOrExit();

const app = express();

// Render (like most hosts) serves the app from behind a single reverse proxy.
// Trusting exactly one hop lets express-rate-limit read the real client IP from
// X-Forwarded-For without honouring arbitrary client-supplied values.
if (config.isProduction) {
  app.set("trust proxy", 1);
}

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(cors({ origin: config.frontendUrl }));
app.use(express.json({ limit: "100kb" }));

// Broad ceiling on all dish-API traffic...
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => sendError(res, 429, "RATE_LIMITED", "יותר מדי בקשות, נסה שוב מאוחר יותר"),
});

// ...plus a tighter cap on writes (POST / PATCH / DELETE).
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "GET",
  handler: (_req, res) =>
    sendError(res, 429, "RATE_LIMITED", "יותר מדי בקשות כתיבה, נסה שוב מאוחר יותר"),
});

// Tight brake on login specifically, to slow credential-stuffing.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res) =>
    sendError(res, 429, "RATE_LIMITED", "יותר מדי ניסיונות התחברות, נסה שוב מאוחר יותר"),
});

// Health check stays open so platform probes are unaffected.
app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

// Auth endpoints: login is public (it's the way in) but throttled; logout and
// /me guard themselves inside the router.
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", apiLimiter, authRouter);

// Everything else requires a valid session.
app.use("/api/dishes", apiLimiter, writeLimiter, requireUser, dishesRouter);

app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT} (${config.NODE_ENV})`);
});

export default app;
