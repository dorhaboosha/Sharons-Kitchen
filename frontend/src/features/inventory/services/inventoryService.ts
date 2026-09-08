import { apiFetch } from "../../../services/apiClient";
import {
  Dish,
  DishId,
  CreateDishInput,
  UpdateDishInput,
  AdjustStockInput,
  GetDishesQueryData,
} from "@sharons-kitchen/shared";

function buildQuery(params: GetDishesQueryData): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) {
    return "";
  }

  return "?" + new URLSearchParams(entries as [string, string][]).toString();
}

export function getDishes(params: GetDishesQueryData = {}): Promise<Dish[]> {
  return apiFetch<Dish[]>(`/api/dishes${buildQuery(params)}`);
}

export function createDish(input: CreateDishInput): Promise<Dish> {
  return apiFetch<Dish>("/api/dishes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateDish(id: DishId, input: UpdateDishInput): Promise<Dish> {
  return apiFetch<Dish>(`/api/dishes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function adjustStock(id: DishId, input: AdjustStockInput): Promise<Dish> {
  return apiFetch<Dish>(`/api/dishes/${id}/adjust-stock`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteDishPermanently(id: DishId): Promise<null> {
  return apiFetch<null>(`/api/dishes/${id}`, {
    method: "DELETE",
  });
}
