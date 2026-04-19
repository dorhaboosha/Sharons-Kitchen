import { Flex, Select } from "@chakra-ui/react";
import { GetDishesQueryData } from "@sharons-kitchen/shared";

interface SortControlsProps {
  sortBy: GetDishesQueryData["sortBy"];
  sortOrder: GetDishesQueryData["sortOrder"];
  onChangeSortBy: (value: GetDishesQueryData["sortBy"]) => void;
  onChangeSortOrder: (value: GetDishesQueryData["sortOrder"]) => void;
}

export function SortControls({sortBy, sortOrder = "asc", onChangeSortBy, onChangeSortOrder }: SortControlsProps) {
  return (
    <Flex gap={2}>
      <Select size="md" bg="white" value={sortBy ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          onChangeSortBy(val === "" ? undefined : (val as GetDishesQueryData["sortBy"]));
        }}
        w="auto" minW="140px">
        <option value="">מיון לפי...</option>
        <option value="name">שם</option>
        <option value="quantity">כמות</option>
      </Select>

      <Select size="md" bg="white" value={sortOrder}
        onChange={(e) =>
          onChangeSortOrder(e.target.value as GetDishesQueryData["sortOrder"])
        }
        w="auto" minW="110px" isDisabled={!sortBy}>
        <option value="asc">א ← ת / נמוך → גבוה</option>
        <option value="desc">ת ← א / גבוה → נמוך</option>
      </Select>
    </Flex>
  );
}
