import { Dish, DishId } from "@sharons-kitchen/shared";
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Text, HStack, Button, Skeleton, VStack, Box } from "@chakra-ui/react";

const SKELETON_ROWS = 5;
const LOW_STOCK_THRESHOLD = 5;

interface InventoryTableProps {
  dishes: Dish[];
  isLoading?: boolean;
  hasActiveFilters?: boolean;
  onEdit: (dish: Dish) => void;
  onDelete: (id: DishId) => void;
  onRestore: (dish: Dish) => void;
  onAdjustStock: (dish: Dish) => void;
  onPermanentDelete: (dish: Dish) => void;
  onClearFilters?: () => void;
}

function getRowBg(dish: Dish): string {
  if (!dish.isActive) return "gray.400";
  if (dish.quantity === 0) return "red.300";
  if (dish.quantity <= LOW_STOCK_THRESHOLD) return "orange.300";
  return "green.300";
}

// Semi-transparent white lets the row tint show through (fluent), 2px border makes buttons stand out
const BTN_BASE = {
  size: "sm" as const,
  bg: "whiteAlpha.800",
  borderWidth: "2px",
  _hover: { bg: "whiteAlpha.900" },
};

const COLUMNS = [
  { key: "name", label: "שם מנה" },
  { key: "price", label: "מחיר (₪)" },
  { key: "quantity", label: "כמות" },
  { key: "unitsPerBox", label: "יחידות בקופסה" },
  { key: "description", label: "תיאור" },
  { key: "actions", label: "פעולות" },
] as const;

function EmptyState({ hasActiveFilters, onClearFilters }: { hasActiveFilters: boolean; onClearFilters?: () => void }) {
  if (hasActiveFilters) {
    return (
      <Tr>
        <Td colSpan={COLUMNS.length} py={16}>
          <VStack spacing={3} align="center">
            <Box fontSize="4xl" lineHeight={1}>🔍</Box>
            <Text fontWeight="semibold" fontSize="lg" color="black">
              לא נמצאו תוצאות
            </Text>
            <Text fontSize="md" color="black">
              אין מנות התואמות את החיפוש או הסינון הנוכחי.
            </Text>
            {onClearFilters && (
              <Button size="md" colorScheme="brand" variant="solid" onClick={onClearFilters}>
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
          <Text fontWeight="semibold" fontSize="lg" color="black">
            המלאי ריק
          </Text>
          <Text fontSize="md" color="black">
            לא נוספו מנות עדיין. לחץ על &quot;הוספת מנה&quot; כדי להתחיל.
          </Text>
        </VStack>
      </Td>
    </Tr>
  );
}

export function InventoryTable({ dishes, isLoading = false, hasActiveFilters = false, onEdit, onDelete, onRestore, onAdjustStock, onPermanentDelete, onClearFilters }: InventoryTableProps) {
  return (
    <TableContainer borderWidth={2} borderRadius="md" borderColor="gray.500" overflowX="auto" bg="whiteAlpha.800">
      <Table variant="simple" size="md" dir="rtl"
        sx={{ "td, th": { borderColor: "gray.700" }, "tr:last-child td": { borderBottom: "none" } }}>
        <Thead bg="gray.100">
          <Tr>
            {COLUMNS.map((col) => (
              <Th key={col.key} textAlign="center" color="gray.700">
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
              <Tr key={dish.id} bg={getRowBg(dish)}>
                <Td textAlign="center" color="gray.800" fontWeight={dish.isActive ? "medium" : "normal"}>
                  {dish.name}
                </Td>
                <Td textAlign="center" color="gray.800">₪{dish.price}</Td>
                <Td textAlign="center" color="gray.800">{dish.quantity}</Td>
                <Td textAlign="center" color="gray.800">{dish.unitsPerBox ?? "—"}</Td>
                <Td textAlign="center" color="gray.800" maxW="200px" isTruncated>
                  {dish.description ?? "—"}
                </Td>
                <Td textAlign="center">
                  <HStack spacing={2} justify="center">
                    {dish.isActive && (
                      <>
                        <Button {...BTN_BASE} color="brand.700" borderColor="brand.400" onClick={() => onEdit(dish)}>
                          עריכה
                        </Button>
                        <Button {...BTN_BASE} color="#5C3317" borderColor="#8B5A3A" onClick={() => onAdjustStock(dish)}>
                          עדכון כמות
                        </Button>
                        <Button {...BTN_BASE} color="red.600" borderColor="red.400" onClick={() => onDelete(dish.id)}>
                          מחיקה
                        </Button>
                      </>
                    )}
                    {!dish.isActive && (
                      <>
                        <Button {...BTN_BASE} color="green.700" borderColor="green.500" onClick={() => onRestore(dish)}>
                          שחזור
                        </Button>
                        <Button {...BTN_BASE} color="red.700" borderColor="red.500" onClick={() => onPermanentDelete(dish)}>
                          מחיקה לצמיתות
                        </Button>
                      </>
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
