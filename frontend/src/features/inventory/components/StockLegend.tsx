import { Flex, Box, Text } from "@chakra-ui/react";

const LEGEND = [
  { bg: "green.300",  label: "במלאי (מעל 5 יחידות)" },
  { bg: "orange.300", label: "מלאי נמוך (1–5 יחידות)" },
  { bg: "red.300",    label: "אזל מהמלאי (0 יחידות)" },
  { bg: "gray.400",   label: "מנה לא פעילה" },
];

export function StockLegend() {
  return (
    <Flex wrap="wrap" gap={{ base: 3, md: 5 }} mb={3} px={3} py={2} bg="whiteAlpha.700" borderRadius="md" 
      borderWidth="1px" borderColor="gray.300" align="center" justify="flex-start">
      {LEGEND.map(({ bg, label }) => (
        <Flex key={label} align="center" gap={2}>
          <Box w={4} h={4} bg={bg} borderRadius="sm" flexShrink={0} />
          <Text fontSize="sm" color="gray.700">{label}</Text>
        </Flex>
      ))}
    </Flex>
  );
}
