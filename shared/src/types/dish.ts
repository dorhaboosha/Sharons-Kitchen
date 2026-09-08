/** Branded type for dish primary keys — prevents accidentally passing a raw number as a dish ID. */
export type DishId = number & { readonly __brand: "DishId" };

/** Represents a dish record as returned by the API. */
export interface Dish {
  id: DishId;
  name: string;
  /** Price in agorot (1/100 shekel). */
  priceAgorot: number;
  quantity: number;
  unitsPerBox: number | null;
  description: string | null;
  isActive: boolean;
  /** When the dish was soft-deleted (ISO string); null while active. */
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
