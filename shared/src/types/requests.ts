/** Input for creating a new dish. Name will be normalized by the backend before persistence. */
export interface CreateDishInput {
  name: string;
  price: number;
  quantity: number;
  unitsPerBox?: number;
  description?: string;
}

/**
 * Input for updating an existing dish. All fields are optional — only provided fields are changed.
 * Includes `isActive` for soft-delete and restore operations.
 * If `name` is provided it will be normalized and uniqueness-checked before persistence.
 */
export interface UpdateDishInput {
  name?: string;
  price?: number;
  quantity?: number;
  unitsPerBox?: number | null;
  description?: string | null;
  isActive?: boolean;
}

/** Input for the adjust-stock endpoint. */
export interface AdjustStockInput {
  delta: number;
}
