import { Select } from "@chakra-ui/react";

export type SortValue =
  "" | "name:asc" | "name:desc" | "quantity:asc" | "quantity:desc" | "price:asc" | "price:desc";

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "", label: "מיון לפי..." },
  { value: "name:asc", label: "שם: א -> ת" },
  { value: "name:desc", label: "שם: ת -> א" },
  { value: "quantity:asc", label: "כמות: נמוך -> גבוה" },
  { value: "quantity:desc", label: "כמות: גבוה -> נמוך" },
  { value: "price:asc", label: "מחיר: נמוך -> גבוה" },
  { value: "price:desc", label: "מחיר: גבוה -> נמוך" },
];

interface SortControlsProps {
  sort: SortValue;
  onSortChange: (value: SortValue) => void;
}

export function SortControls({ sort, onSortChange }: SortControlsProps) {
  return (
    <Select
      size="md"
      bg="white"
      color="gray.800"
      borderColor="brand.200"
      borderWidth="2px"
      _hover={{ borderColor: "brand.400" }}
      _focusVisible={{ borderColor: "brand.500", boxShadow: "none" }}
      value={sort}
      onChange={(e) => onSortChange(e.target.value as SortValue)}
      w="auto"
      minW="180px"
    >
      {SORT_OPTIONS.map((opt) => (
        <option
          key={opt.value}
          value={opt.value}
          style={{ backgroundColor: "#ffffff", color: "#2D3748" }}
        >
          {opt.label}
        </option>
      ))}
    </Select>
  );
}
