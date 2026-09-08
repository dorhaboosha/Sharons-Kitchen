import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/response";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message);
    return;
  }

  // Prisma constraint violations that can slip past the service-level checks
  // under concurrency (two requests creating the same name; a row deleted
  // between a find and the following update/delete).
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      sendError(res, 409, "CONFLICT", "כבר קיימת מנה בשם הזה");
      return;
    }
    if (err.code === "P2025") {
      sendError(res, 404, "NOT_FOUND", "המנה לא נמצאה");
      return;
    }
  }

  console.error(err);

  sendError(res, 500, "INTERNAL_ERROR", "אירעה שגיאה פנימית בשרת");
}
