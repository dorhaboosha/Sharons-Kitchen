import { Button, ButtonGroup } from "@chakra-ui/react";
import { GetDishesQueryData } from "@sharons-kitchen/shared";

type FilterValue = GetDishesQueryData["filter"];

interface FilterButtonsProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

const options: { label: string; value: NonNullable<FilterValue> }[] = [
  { label: "הכל", value: "all" },
  { label: "פעילות", value: "active" },
  { label: "לא פעילות", value: "inactive" },
];

export function FilterButtons({ value = "all", onChange }: FilterButtonsProps) {
  return (
    <ButtonGroup isAttached variant="outline" size="md">
      {options.map((opt) => (
        <Button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          colorScheme="brand"
          variant={value === opt.value ? "solid" : "outline"}
        >
          {opt.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
