import { Box, Button, Flex } from "@chakra-ui/react";
import { GetDishesQueryData } from "@sharons-kitchen/shared";
import { SearchBar } from "./SearchBar";
import { FilterButtons } from "./FilterButtons";
import { SortControls, SortValue } from "./SortControls";

interface InventoryToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: GetDishesQueryData["filter"];
  onFilterChange: (value: GetDishesQueryData["filter"]) => void;
  sort: SortValue;
  onSortChange: (value: SortValue) => void;
  onAddClick: () => void;
}

export function InventoryToolbar({ search, onSearchChange, filter, onFilterChange, sort, onSortChange, onAddClick }: InventoryToolbarProps) {
  return (
    <Flex mb={4} gap={3} wrap="wrap" align="center" justify="space-between">
      {/* Right group: search + filter + sort */}
      <Flex gap={3} wrap="wrap" align="center" flex={1}>
        <Box w={{ base: "100%", md: "auto" }} flex={{ base: "none", md: 1 }} minW={{ md: "200px" }}>
          <SearchBar value={search} onChange={onSearchChange} />
        </Box>

        <Box w={{ base: "100%", md: "auto" }}>
          <FilterButtons value={filter} onChange={onFilterChange} />
        </Box>

        <Box w={{ base: "100%", md: "auto" }}>
          <SortControls sort={sort} onSortChange={onSortChange} />
        </Box>
      </Flex>

      <Button colorScheme="brand" flexShrink={0} w={{ base: "100%", md: "auto" }} onClick={onAddClick}>
        הוספת מנה
      </Button>
    </Flex>
  );
}
