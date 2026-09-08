import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { GetDishesQueryData } from "@sharons-kitchen/shared";
import { getDishes } from "../services/inventoryService";

export const DISHES_QUERY_KEY = "dishes";

export function useInventory(params: GetDishesQueryData = {}) {
  return useQuery({
    queryKey: [DISHES_QUERY_KEY, params],
    queryFn: () => getDishes(params),
    // Keep the current rows on screen while a new search/filter/sort loads,
    // instead of flashing back to skeletons on every change.
    placeholderData: keepPreviousData,
  });
}
