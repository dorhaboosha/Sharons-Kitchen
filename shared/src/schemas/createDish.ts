import { z } from "zod";

export const CreateDishSchema = z.object({
  name: z.string().min(1, "שם המנה הוא שדה חובה").max(120, "שם המנה ארוך מדי (עד 120 תווים)"),
  price: z
    .number({ invalid_type_error: "המחיר חייב להיות מספר" })
    .int("המחיר חייב להיות מספר שלם")
    .min(1, "המחיר חייב להיות לפחות 1"),
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
