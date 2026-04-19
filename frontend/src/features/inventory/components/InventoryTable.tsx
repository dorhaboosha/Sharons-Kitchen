import { Dish } from "@sharons-kitchen/shared";
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Text } from "@chakra-ui/react";

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
          {/* Data rows — task 8.10 */}
          {dishes.length === 0 && (
            <Tr>
              <Td colSpan={COLUMNS.length} textAlign="center" py={10}>
                <Text color="gray.400">אין מנות להצגה</Text>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
