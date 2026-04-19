import { z } from "zod";

export const GetDishesQuerySchema = z.object({
  filter: z.enum(["active", "inactive", "all"]).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "quantity"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GetDishesQueryData = z.infer<typeof GetDishesQuerySchema>;
