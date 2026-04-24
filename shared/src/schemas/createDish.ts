import { z } from "zod";

export const CreateDishSchema = z.object({
  name: z.string().min(1, "שם המנה הוא שדה חובה"),
  price: z
    .number({ invalid_type_error: "המחיר חייב להיות מספר" })
    .int("המחיר חייב להיות מספר שלם")
    .min(0, "המחיר לא יכול להיות שלילי"),
  quantity: z
    .number({ invalid_type_error: "הכמות חייבת להיות מספר" })
    .int("הכמות חייבת להיות מספר שלם")
    .min(1, "הכמות חייבת להיות לפחות 1"),
  unitsPerBox: z
    .number({ invalid_type_error: "יחידות בקופסה חייב להיות מספר" })
    .int("יחידות בקופסה חייב להיות מספר שלם")
    .min(1, "חייב להיות מספר גדול מ-0")
    .optional(),
  description: z.string().optional(),
});

export type CreateDishData = z.infer<typeof CreateDishSchema>;
