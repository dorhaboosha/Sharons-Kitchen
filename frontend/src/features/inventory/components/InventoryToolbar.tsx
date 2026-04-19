import { Box, Button, Flex } from "@chakra-ui/react";
import { GetDishesQueryData } from "@sharons-kitchen/shared";

interface InventoryToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: GetDishesQueryData["filter"];
  onFilterChange: (value: GetDishesQueryData["filter"]) => void;
  sortBy: GetDishesQueryData["sortBy"];
  onSortByChange: (value: GetDishesQueryData["sortBy"]) => void;
  sortOrder: GetDishesQueryData["sortOrder"];
  onSortOrderChange: (value: GetDishesQueryData["sortOrder"]) => void;
  onAddClick: () => void;
}

export function InventoryToolbar({search, onSearchChange, filter, onFilterChange, sortBy, onSortByChange, sortOrder, onSortOrderChange, onAddClick}: InventoryToolbarProps) {
  return (
    <Flex mb={4} gap={3} wrap="wrap" align="center" justify="space-between">
      {/* Right group: search + filter + sort */}
      <Flex gap={3} wrap="wrap" align="center" flex={1}>
        {/* SearchBar (task 8.5) */}
        <Box flex={1} minW="200px">
          {/* <SearchBar value={search} onChange={onSearchChange} /> */}
        </Box>

        {/* FilterButtons (task 8.6) */}
        <Box>
          {/* <FilterButtons value={filter} onChange={onFilterChange} /> */}
        </Box>

        {/* SortControls (task 8.7) */}
        <Box>
          {/* <SortControls sortBy={sortBy} sortOrder={sortOrder} onChangeSortBy={onSortByChange} onChangeSortOrder={onSortOrderChange} /> */}
        </Box>
      </Flex>

      {/* Left: Add dish button (modal wired in task 9.3) */}
      <Button colorScheme="teal" flexShrink={0} onClick={onAddClick}>
        הוספת מנה
      </Button>
    </Flex>
  );
}
