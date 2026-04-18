import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "הנתונים שנשלחו אינם תקינים",
          details,
        },
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
