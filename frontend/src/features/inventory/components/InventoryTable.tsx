import { Dish, DishId } from "@sharons-kitchen/shared";
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Text, HStack, Button, Skeleton, VStack, Box } from "@chakra-ui/react";
import { StockIndicator } from "./StockIndicator";

const SKELETON_ROWS = 5;

interface InventoryTableProps {
  dishes: Dish[];
  isLoading?: boolean;
  hasActiveFilters?: boolean;
  onEdit: (dish: Dish) => void;
  onDelete: (id: DishId) => void;
  onRestore: (dish: Dish) => void;
  onAdjustStock: (dish: Dish) => void;
  onClearFilters?: () => void;
}

function EmptyState({ hasActiveFilters, onClearFilters }: { hasActiveFilters: boolean; onClearFilters?: () => void }) {
  if (hasActiveFilters) {
    return (
      <Tr>
        <Td colSpan={COLUMNS.length} py={16}>
          <VStack spacing={3} align="center">
            <Box fontSize="4xl" lineHeight={1}>🔍</Box>
            <Text fontWeight="semibold" fontSize="lg" color="gray.600">
              לא נמצאו תוצאות
            </Text>
            <Text fontSize="sm" color="gray.400">
              אין מנות התואמות את החיפוש או הסינון הנוכחי.
            </Text>
            {onClearFilters && (
              <Button size="sm" variant="outline" onClick={onClearFilters}>
                נקה סינון
              </Button>
            )}
          </VStack>
        </Td>
      </Tr>
    );
  }

  return (
    <Tr>
      <Td colSpan={COLUMNS.length} py={16}>
        <VStack spacing={3} align="center">
          <Box fontSize="4xl" lineHeight={1}>🍽️</Box>
          <Text fontWeight="semibold" fontSize="lg" color="gray.600">
            המלאי ריק
          </Text>
          <Text fontSize="sm" color="gray.400">
            לא נוספו מנות עדיין. לחץ על &quot;הוספת מנה&quot; כדי להתחיל.
          </Text>
        </VStack>
      </Td>
    </Tr>
  );
}

const COLUMNS = [
  { key: "name", label: "שם מנה" },
  { key: "price", label: "מחיר (₪)" },
  { key: "quantity", label: "כמות" },
  { key: "unitsPerBox", label: "יחידות בקופסה" },
  { key: "description", label: "תיאור" },
  { key: "indicator", label: "אינדיקציה" },
  { key: "actions", label: "פעולות" },
] as const;

export function InventoryTable({ dishes, isLoading = false, hasActiveFilters = false, onEdit, onDelete, onRestore, onAdjustStock, onClearFilters }: InventoryTableProps) {
  return (
    <TableContainer borderWidth={1} borderRadius="md" borderColor="gray.200">
      <Table variant="simple" size="md" dir="rtl">
        <Thead bg="gray.50">
          <Tr>
            {COLUMNS.map((col) => (
              <Th key={col.key} textAlign="right" color="gray.600">
                {col.label}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <Tr key={i}>
                {COLUMNS.map((col) => (
                  <Td key={col.key}>
                    <Skeleton height="20px" borderRadius="md" />
                  </Td>
                ))}
              </Tr>
            ))
          ) : dishes.length === 0 ? (
            <EmptyState hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />
          ) : (
            dishes.map((dish) => (
              <Tr key={dish.id} opacity={dish.isActive ? 1 : 0.5} _hover={{ bg: "gray.50" }}>
                <Td textAlign="right" fontWeight={dish.isActive ? "medium" : "normal"}>
                  {dish.name}
                </Td>
                <Td textAlign="right">₪{dish.price}</Td>
                <Td textAlign="right">{dish.quantity}</Td>
                <Td textAlign="right">{dish.unitsPerBox ?? "—"}</Td>
                <Td textAlign="right" maxW="200px" isTruncated>
                  {dish.description ?? "—"}
                </Td>
                <Td textAlign="right">
                  <StockIndicator quantity={dish.quantity} />
                </Td>
                <Td textAlign="right">
                  <HStack spacing={2} justify="flex-end">
                    <Button size="sm" variant="outline" onClick={() => onEdit(dish)}>
                      עריכה
                    </Button>
                    <Button size="sm" variant="outline" colorScheme="blue" onClick={() => onAdjustStock(dish)}>
                      מלאי
                    </Button>
                    {dish.isActive ? (
                      <Button size="sm" variant="outline" colorScheme="red" onClick={() => onDelete(dish.id)}>
                        מחיקה
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" colorScheme="teal" onClick={() => onRestore(dish)}>
                        שחזור
                      </Button>
                    )}
                  </HStack>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
