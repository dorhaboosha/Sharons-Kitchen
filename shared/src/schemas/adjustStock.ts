import { z } from "zod";

export const AdjustStockSchema = z.object({
  delta: z
    .number({ invalid_type_error: "הערך חייב להיות מספר" })
    .int("הערך חייב להיות מספר שלם")
    .refine((n) => n !== 0, { message: "הערך חייב להיות שונה מאפס" }),
});

export type AdjustStockData = z.infer<typeof AdjustStockSchema>;
