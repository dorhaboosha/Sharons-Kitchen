import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

function validationErrorResponse(res: Response, error: ZodError): void {
  const details = error.errors.map((e) => ({
    field: e.path.join("."),
    message: e.message,
  }));
  res.status(400).json({
    success: false,
    error: { code: "VALIDATION_ERROR", message: "הנתונים שנשלחו אינם תקינים", details },
  });
}

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      validationErrorResponse(res, result.error as ZodError);
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      validationErrorResponse(res, result.error as ZodError);
      return;
    }
    res.locals.query = result.data;
    next();
  };
}
