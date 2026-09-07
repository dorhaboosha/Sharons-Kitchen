import { z } from "zod";

export const UpdateDishSchema = z
  .object({
    name: z
      .string()
      .min(1, "שם המנה לא יכול להיות ריק")
      .max(120, "שם המנה ארוך מדי (עד 120 תווים)")
      .optional(),
    price: z
      .number({ invalid_type_error: "המחיר חייב להיות מספר" })
      .int("המחיר חייב להיות מספר שלם")
      .min(0, "המחיר לא יכול להיות שלילי")
      .optional(),
    quantity: z
      .number({ invalid_type_error: "הכמות חייבת להיות מספר" })
      .int("הכמות חייבת להיות מספר שלם")
      .min(0, "הכמות לא יכולה להיות שלילית")
      .optional(),
    unitsPerBox: z
      .number({ invalid_type_error: "יחידות בקופסה חייב להיות מספר" })
      .int("יחידות בקופסה חייב להיות מספר שלם")
      .min(1, "חייב להיות מספר גדול מ-0")
      .nullable()
      .optional(),
    description: z.string().max(1000, "התיאור ארוך מדי (עד 1000 תווים)").nullable().optional(),
    isActive: z.boolean({ invalid_type_error: "ערך לא תקין" }).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "יש לספק לפחות שדה אחד לעדכון",
  });

export type UpdateDishData = z.infer<typeof UpdateDishSchema>;
