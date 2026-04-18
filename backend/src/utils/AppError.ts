import { ApiErrorCode } from "@sharons-kitchen/shared";

export class AppError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}
