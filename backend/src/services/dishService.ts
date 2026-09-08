import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";
import { normalizeName, CreateDishInput, UpdateDishInput } from "@sharons-kitchen/shared";

export type FilterParam = "active" | "inactive" | "all";
export type SortByParam = "name" | "quantity" | "priceAgorot";
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

export async function createDish(input: CreateDishInput) {
  const name = normalizeName(input.name);

  const existing = await prisma.dish.findUnique({ where: { name } });
  if (existing) {
    throw new AppError("CONFLICT", 409, "כבר קיימת מנה בשם הזה");
  }

  return prisma.dish.create({
    data: {
      name,
      priceAgorot: input.priceAgorot,
      quantity: input.quantity,
      unitsPerBox: input.unitsPerBox ?? null,
      description: input.description ?? null,
    },
  });
}

export async function updateDish(id: number, input: UpdateDishInput) {
  const dish = await prisma.dish.findUnique({ where: { id } });
  if (!dish) {
    throw new AppError("NOT_FOUND", 404, "המנה לא נמצאה");
  }

  // Inactive dishes can only be restored — all other edits are blocked
  if (!dish.isActive && input.isActive !== true) {
    throw new AppError("VALIDATION_ERROR", 400, "לא ניתן לערוך מנה לא פעילה");
  }

  const data: Prisma.DishUpdateInput = { ...input };

  if (input.name !== undefined) {
    const name = normalizeName(input.name);
    const conflict = await prisma.dish.findUnique({ where: { name } });
    if (conflict && conflict.id !== id) {
      throw new AppError("CONFLICT", 409, "כבר קיימת מנה בשם הזה");
    }
    data.name = name;
  }

  return prisma.dish.update({ where: { id }, data });
}

export async function adjustStock(id: number, delta: number) {
  // Atomic: the row changes only if it exists, is active, and the result stays
  // >= 0 — all decided inside the single UPDATE. Concurrent adjustments can't
  // lose an update or drive stock negative. `quantity >= -delta` is equivalent
  // to `quantity + delta >= 0` for both signs of delta.
  const { count } = await prisma.dish.updateMany({
    where: { id, isActive: true, quantity: { gte: -delta } },
    data: { quantity: { increment: delta } },
  });

  if (count === 0) {
    // Nothing matched — report the most specific reason. A benign race here
    // could mislabel the reason, but the mutation itself already didn't happen.
    const dish = await prisma.dish.findUnique({ where: { id } });
    if (!dish) {
      throw new AppError("NOT_FOUND", 404, "המנה לא נמצאה");
    }
    if (!dish.isActive) {
      throw new AppError("VALIDATION_ERROR", 400, "לא ניתן לעדכן מלאי של מנה לא פעילה");
    }
    throw new AppError("VALIDATION_ERROR", 400, "לא ניתן להפחית מתחת ל-0");
  }

  return prisma.dish.findUniqueOrThrow({ where: { id } });
}

export async function deleteDishPermanently(id: number) {
  const { count } = await prisma.dish.deleteMany({ where: { id, isActive: false } });

  if (count === 0) {
    const dish = await prisma.dish.findUnique({ where: { id } });
    if (!dish) {
      throw new AppError("NOT_FOUND", 404, "המנה לא נמצאה");
    }
    throw new AppError("VALIDATION_ERROR", 400, "ניתן למחוק לצמיתות רק מנה לא פעילה");
  }
}
