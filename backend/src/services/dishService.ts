import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";

export type FilterParam = "active" | "inactive" | "all";
export type SortByParam = "name" | "quantity";
export type SortOrderParam = "asc" | "desc";

export interface GetDishesParams {
  filter?: FilterParam;
  search?: string;
  sortBy?: SortByParam;
  sortOrder?: SortOrderParam;
}

export async function getDishes(params: GetDishesParams = {}) {
  const { filter = "all", search, sortBy, sortOrder = "asc" } = params;

  // --- Filter ---
  const where: Prisma.DishWhereInput = {};

  if (filter === "active") where.isActive = true;
  if (filter === "inactive") where.isActive = false;

  // --- Search ---
  if (search && search.trim() !== "") {
    where.name = { contains: search.trim(), mode: "insensitive" };
  }
  
  // --- Sort ---
  // Always keep active dishes first.
  // If sortBy is provided, apply it *within* active/inactive groups.
  const orderBy: Prisma.DishOrderByWithRelationInput[] = sortBy
  ? [{ isActive: "desc" }, { [sortBy]: sortOrder }, { name: "asc" }]
  : [{ isActive: "desc" }, { name: "asc" }];

  return prisma.dish.findMany({ where, orderBy });
}

export async function getDishById(id: number) {
  const dish = await prisma.dish.findUnique({ where: { id } });

  if (!dish) {
    throw new AppError("NOT_FOUND", 404, "המנה לא נמצאה");
  }

  return dish;
}
