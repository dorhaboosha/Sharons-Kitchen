/** Branded type for dish primary keys — prevents accidentally passing a raw number as a dish ID. */
export type DishId = number & { readonly __brand: "DishId" };

/** Represents a dish record as returned by the API. */
export interface Dish {
  id: DishId;
  name: string;
  price: number;
  quantity: number;
  unitsPerBox: number | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
