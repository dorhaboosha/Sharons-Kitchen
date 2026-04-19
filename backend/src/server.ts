import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import dishesRouter from "./routes/dishes";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/dishes", dishesRouter);

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
