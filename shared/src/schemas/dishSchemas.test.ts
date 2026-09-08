import { describe, it, expect } from "vitest";
import { CreateDishSchema } from "./createDish";
import { UpdateDishSchema } from "./updateDish";
import { GetDishesQuerySchema } from "./getDishesQuery";

const validCreate = { name: "קובה סלק", priceAgorot: 1000, quantity: 3 };

describe("CreateDishSchema", () => {
  it("accepts a minimal valid dish", () => {
    expect(CreateDishSchema.safeParse(validCreate).success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(CreateDishSchema.safeParse({ ...validCreate, name: "" }).success).toBe(false);
  });

  it("accepts a name of exactly 120 characters", () => {
    const name = "א".repeat(120);
    expect(CreateDishSchema.safeParse({ ...validCreate, name }).success).toBe(true);
  });

  it("rejects a name longer than 120 characters", () => {
    const name = "א".repeat(121);
    expect(CreateDishSchema.safeParse({ ...validCreate, name }).success).toBe(false);
  });

  it("rejects a description longer than 1000 characters", () => {
    const description = "א".repeat(1001);
    expect(CreateDishSchema.safeParse({ ...validCreate, description }).success).toBe(false);
  });

  it("accepts a description of exactly 1000 characters", () => {
    const description = "א".repeat(1000);
    expect(CreateDishSchema.safeParse({ ...validCreate, description }).success).toBe(true);
  });

  it("requires priceAgorot to be at least ₪1 (100 agorot) and an integer", () => {
    expect(CreateDishSchema.safeParse({ ...validCreate, priceAgorot: 99 }).success).toBe(false);
    expect(CreateDishSchema.safeParse({ ...validCreate, priceAgorot: 100 }).success).toBe(true);
    expect(CreateDishSchema.safeParse({ ...validCreate, priceAgorot: 12.5 }).success).toBe(false);
  });

  it("rejects a priceAgorot above the ₪100,000 ceiling", () => {
    expect(CreateDishSchema.safeParse({ ...validCreate, priceAgorot: 10_000_001 }).success).toBe(
      false,
    );
  });
});

describe("UpdateDishSchema", () => {
  it("rejects an empty patch", () => {
    expect(UpdateDishSchema.safeParse({}).success).toBe(false);
  });

  it("rejects a name longer than 120 characters", () => {
    expect(UpdateDishSchema.safeParse({ name: "א".repeat(121) }).success).toBe(false);
  });

  it("rejects a description longer than 1000 characters", () => {
    expect(UpdateDishSchema.safeParse({ description: "א".repeat(1001) }).success).toBe(false);
  });

  it("still allows description to be null", () => {
    expect(UpdateDishSchema.safeParse({ description: null }).success).toBe(true);
  });

  it("enforces the same ₪1 price floor as CreateDishSchema", () => {
    expect(UpdateDishSchema.safeParse({ priceAgorot: 99 }).success).toBe(false);
    expect(UpdateDishSchema.safeParse({ priceAgorot: 100 }).success).toBe(true);
  });
});

describe("GetDishesQuerySchema", () => {
  it("accepts a search string up to 100 characters", () => {
    expect(GetDishesQuerySchema.safeParse({ search: "א".repeat(100) }).success).toBe(true);
  });

  it("rejects a search string longer than 100 characters", () => {
    expect(GetDishesQuerySchema.safeParse({ search: "א".repeat(101) }).success).toBe(false);
  });
});
