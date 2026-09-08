import { z } from "zod";

export const CreateDishSchema = z.object({
  name: z.string().min(1, "שם המנה הוא שדה חובה").max(120, "שם המנה ארוך מדי (עד 120 תווים)"),
  // Agorot (1/100 shekel). 100 = ₪1 minimum; ceiling ₪100,000 to stay well
  // inside a 32-bit int.
  priceAgorot: z
    .number({ invalid_type_error: "המחיר אינו תקין" })
    .int("המחיר אינו תקין")
    .min(100, "המחיר חייב להיות לפחות ₪1")
    .max(10_000_000, "המחיר גבוה מדי"),
  quantity: z
    .number({ invalid_type_error: "הכמות חייבת להיות מספר" })
    .int("הכמות חייבת להיות מספר שלם")
    .min(1, "הכמות חייבת להיות לפחות 1"),
  unitsPerBox: z
    .number({ invalid_type_error: "יחידות בקופסה חייב להיות מספר" })
    .int("יחידות בקופסה חייב להיות מספר שלם")
    .min(1, "חייב להיות מספר גדול מ-0")
    .optional(),
  description: z.string().max(1000, "התיאור ארוך מדי (עד 1000 תווים)").optional(),
});

export type CreateDishData = z.infer<typeof CreateDishSchema>;
