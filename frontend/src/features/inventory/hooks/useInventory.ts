import { useQuery } from "@tanstack/react-query";
import { GetDishesQueryData } from "@sharons-kitchen/shared";
import { getDishes } from "../services/inventoryService";

export const DISHES_QUERY_KEY = "dishes";

export function useInventory(params: GetDishesQueryData = {}) {
  return useQuery({
    queryKey: [DISHES_QUERY_KEY, params],
    queryFn: () => getDishes(params),
  });
}
