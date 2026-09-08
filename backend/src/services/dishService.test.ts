import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../prisma/client", () => ({
  prisma: {
    dish: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { prisma } from "../prisma/client";
import {
  getDishById,
  createDish,
  updateDish,
  adjustStock,
  deleteDishPermanently,
} from "./dishService";

const findUnique = vi.mocked(prisma.dish.findUnique);
const findUniqueOrThrow = vi.mocked(prisma.dish.findUniqueOrThrow);
const create = vi.mocked(prisma.dish.create);
const update = vi.mocked(prisma.dish.update);
const updateMany = vi.mocked(prisma.dish.updateMany);
const deleteMany = vi.mocked(prisma.dish.deleteMany);

type DishRow = {
  id: number;
  name: string;
  priceAgorot: number;
  quantity: number;
  unitsPerBox: number | null;
  description: string | null;
  isActive: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function makeDish(overrides: Partial<DishRow> = {}): DishRow {
  return {
    id: 1,
    name: "קובה סלק",
    priceAgorot: 1000,
    quantity: 5,
    unitsPerBox: null,
    description: null,
    isActive: true,
    deletedAt: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

// The mocked delegate methods are loosely typed here; the service only ever
// awaits their resolved value.
const resolve = (value: unknown) => value as never;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getDishById", () => {
  it("returns the dish when it exists", async () => {
    const dish = makeDish();
    findUnique.mockResolvedValue(resolve(dish));

    await expect(getDishById(1)).resolves.toEqual(dish);
    expect(findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it("throws NOT_FOUND when the dish is missing", async () => {
    findUnique.mockResolvedValue(resolve(null));

    await expect(getDishById(999)).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
    });
  });
});

describe("createDish", () => {
  it("normalizes the name and creates the dish with nulls for omitted optionals", async () => {
    findUnique.mockResolvedValue(resolve(null));
    const created = makeDish({ name: "קובה סלק" });
    create.mockResolvedValue(resolve(created));

    const result = await createDish({
      name: "  קובה   סלק  ",
      priceAgorot: 1200,
      quantity: 3,
    });

    expect(findUnique).toHaveBeenCalledWith({ where: { name: "קובה סלק" } });
    expect(create).toHaveBeenCalledWith({
      data: {
        name: "קובה סלק",
        priceAgorot: 1200,
        quantity: 3,
        unitsPerBox: null,
        description: null,
      },
    });
    expect(result).toEqual(created);
  });

  it("throws CONFLICT and does not create when the name already exists", async () => {
    findUnique.mockResolvedValue(resolve(makeDish()));

    await expect(
      createDish({ name: "קובה סלק", priceAgorot: 1000, quantity: 1 }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
      statusCode: 409,
    });

    expect(create).not.toHaveBeenCalled();
  });
});

describe("updateDish", () => {
  it("throws NOT_FOUND when the dish is missing", async () => {
    findUnique.mockResolvedValue(resolve(null));

    await expect(updateDish(1, { priceAgorot: 500 })).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
    });
    expect(update).not.toHaveBeenCalled();
  });

  it("blocks editing an inactive dish when isActive is not being set to true", async () => {
    findUnique.mockResolvedValue(resolve(makeDish({ isActive: false })));

    await expect(updateDish(1, { priceAgorot: 500 })).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
    });
    expect(update).not.toHaveBeenCalled();
  });

  it("stamps deletedAt when soft-deleting (isActive: false)", async () => {
    findUnique.mockResolvedValue(resolve(makeDish({ isActive: true })));
    update.mockResolvedValue(resolve(makeDish({ isActive: false })));

    await updateDish(1, { isActive: false });

    const arg = update.mock.calls[0][0] as { data: { isActive: boolean; deletedAt: Date } };
    expect(arg.data.isActive).toBe(false);
    expect(arg.data.deletedAt).toBeInstanceOf(Date);
  });

  it("clears deletedAt when restoring an inactive dish (isActive: true)", async () => {
    findUnique.mockResolvedValue(resolve(makeDish({ isActive: false })));
    update.mockResolvedValue(resolve(makeDish({ isActive: true })));

    await updateDish(1, { isActive: true });

    expect(update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { isActive: true, deletedAt: null },
    });
  });

  it("does not touch deletedAt on a plain field edit", async () => {
    findUnique.mockResolvedValue(resolve(makeDish()));
    update.mockResolvedValue(resolve(makeDish({ priceAgorot: 900 })));

    await updateDish(1, { priceAgorot: 900 });

    const arg = update.mock.calls[0][0] as { data: Record<string, unknown> };
    expect("deletedAt" in arg.data).toBe(false);
  });

  it("throws CONFLICT when the new name belongs to a different dish", async () => {
    findUnique
      .mockResolvedValueOnce(resolve(makeDish({ id: 1 }))) // the dish being updated
      .mockResolvedValueOnce(resolve(makeDish({ id: 2, name: "שם אחר" }))); // name owner

    await expect(updateDish(1, { name: "שם אחר" })).rejects.toMatchObject({
      code: "CONFLICT",
      statusCode: 409,
    });
    expect(update).not.toHaveBeenCalled();
  });

  it("allows renaming when the matching name is the same dish", async () => {
    findUnique
      .mockResolvedValueOnce(resolve(makeDish({ id: 1 })))
      .mockResolvedValueOnce(resolve(makeDish({ id: 1 })));
    update.mockResolvedValue(resolve(makeDish()));

    await updateDish(1, { name: "  קובה סלק  " });

    expect(update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({ name: "קובה סלק" }),
    });
  });

  it("passes through a simple field update on an active dish", async () => {
    findUnique.mockResolvedValue(resolve(makeDish()));
    update.mockResolvedValue(resolve(makeDish({ priceAgorot: 2000 })));

    await updateDish(1, { priceAgorot: 2000 });

    expect(update).toHaveBeenCalledWith({ where: { id: 1 }, data: { priceAgorot: 2000 } });
  });
});

describe("adjustStock", () => {
  it("applies the delta in one conditional UPDATE and returns the fresh row", async () => {
    updateMany.mockResolvedValue(resolve({ count: 1 }));
    const updated = makeDish({ quantity: 12 });
    findUniqueOrThrow.mockResolvedValue(resolve(updated));

    const result = await adjustStock(1, 7);

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 1, isActive: true, quantity: { gte: -7 } },
      data: { quantity: { increment: 7 } },
    });
    expect(update).not.toHaveBeenCalled();
    expect(result).toEqual(updated);
  });

  it("guards the zero floor via `quantity >= -delta` when subtracting", async () => {
    updateMany.mockResolvedValue(resolve({ count: 1 }));
    findUniqueOrThrow.mockResolvedValue(resolve(makeDish({ quantity: 0 })));

    await adjustStock(1, -3);

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 1, isActive: true, quantity: { gte: 3 } },
      data: { quantity: { increment: -3 } },
    });
  });

  it("throws NOT_FOUND when nothing matched and the dish does not exist", async () => {
    updateMany.mockResolvedValue(resolve({ count: 0 }));
    findUnique.mockResolvedValue(resolve(null));

    await expect(adjustStock(1, 3)).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
    });
    expect(findUniqueOrThrow).not.toHaveBeenCalled();
  });

  it("throws VALIDATION_ERROR for an inactive dish", async () => {
    updateMany.mockResolvedValue(resolve({ count: 0 }));
    findUnique.mockResolvedValue(resolve(makeDish({ isActive: false })));

    await expect(adjustStock(1, 3)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "לא ניתן לעדכן מלאי של מנה לא פעילה",
    });
  });

  it("throws the below-zero VALIDATION_ERROR when the dish is active but stock is too low", async () => {
    updateMany.mockResolvedValue(resolve({ count: 0 }));
    findUnique.mockResolvedValue(resolve(makeDish({ isActive: true, quantity: 2 })));

    await expect(adjustStock(1, -3)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message: "לא ניתן להפחית מתחת ל-0",
    });
  });
});

describe("deleteDishPermanently", () => {
  it("resolves when an inactive dish is deleted", async () => {
    deleteMany.mockResolvedValue(resolve({ count: 1 }));

    await expect(deleteDishPermanently(1)).resolves.toBeUndefined();
    expect(deleteMany).toHaveBeenCalledWith({ where: { id: 1, isActive: false } });
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("throws VALIDATION_ERROR when the dish exists but is still active", async () => {
    deleteMany.mockResolvedValue(resolve({ count: 0 }));
    findUnique.mockResolvedValue(resolve(makeDish({ isActive: true })));

    await expect(deleteDishPermanently(1)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400,
    });
  });

  it("throws NOT_FOUND when no such dish exists", async () => {
    deleteMany.mockResolvedValue(resolve({ count: 0 }));
    findUnique.mockResolvedValue(resolve(null));

    await expect(deleteDishPermanently(1)).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
    });
  });
});
