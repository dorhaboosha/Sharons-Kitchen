import { useState } from "react";
import { Box, Heading } from "@chakra-ui/react";
import { GetDishesQueryData } from "@sharons-kitchen/shared";
import { useInventory } from "../features/inventory/hooks/useInventory";
import { InventoryToolbar } from "../features/inventory/components/InventoryToolbar";
import { InventoryTable } from "../features/inventory/components/InventoryTable";

export function InventoryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<GetDishesQueryData["filter"]>("all");
  const [sortBy, setSortBy] = useState<GetDishesQueryData["sortBy"]>(undefined);
  const [sortOrder, setSortOrder] = useState<GetDishesQueryData["sortOrder"]>("asc");

  const { data: dishes = [] } = useInventory({ search, filter, sortBy, sortOrder });

  return (
    <Box maxW="1200px" mx="auto" px={6} py={8} dir="rtl">
      <Heading size="lg" mb={6}>
        מלאי
      </Heading>

      <InventoryToolbar search={search} onSearchChange={setSearch} filter={filter} onFilterChange={setFilter} sortBy={sortBy}
        onSortByChange={setSortBy} sortOrder={sortOrder} onSortOrderChange={setSortOrder} onAddClick={() => {/* open CreateDishModal — task 9.3 */}} />

      <InventoryTable dishes={dishes} />
    </Box>
  );
}
