import { AppError } from "./AppError";

/** Parses a route param into a positive integer id, or throws VALIDATION_ERROR. */
export function parseId(raw: unknown): number {
  const id = typeof raw === "string" ? Number(raw) : NaN;
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("VALIDATION_ERROR", 400, "מזהה לא תקין");
  }
  return id;
}
