import { Dish } from "@sharons-kitchen/shared";
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Text, Box } from "@chakra-ui/react";
import { StockIndicator } from "./StockIndicator";

interface InventoryTableProps {
  dishes: Dish[];
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

export function InventoryTable({ dishes }: InventoryTableProps) {
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
          {dishes.length === 0 ? (
            <Tr>
              <Td colSpan={COLUMNS.length} textAlign="center" py={10}>
                <Text color="gray.400">אין מנות להצגה</Text>
              </Td>
            </Tr>
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
                  {/* Row action buttons — task 8.11 */}
                  <Box />
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
