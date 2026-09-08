import { z } from "zod";

export const GetDishesQuerySchema = z.object({
  filter: z.enum(["active", "inactive", "all"]).optional(),
  search: z.string().max(100, "מחרוזת החיפוש ארוכה מדי").optional(),
  sortBy: z.enum(["name", "quantity", "priceAgorot"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GetDishesQueryData = z.infer<typeof GetDishesQuerySchema>;
