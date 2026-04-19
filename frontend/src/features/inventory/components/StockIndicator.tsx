import { Box, Tooltip } from "@chakra-ui/react";

const LOW_THRESHOLD = 5;

function getIndicator(quantity: number): { color: string; label: string } {
  if (quantity === 0) {
    return { color: "red.500", label: "אזל מהמלאי" };
  }

  if (quantity <= LOW_THRESHOLD) {
    return { color: "orange.400", label: "מלאי נמוך" };
  }

  return { color: "green.400", label: "מלאי תקין" };
}

interface StockIndicatorProps {
  quantity: number;
}

export function StockIndicator({ quantity }: StockIndicatorProps) {
  const { color, label } = getIndicator(quantity);

  return (
    <Tooltip label={label} placement="top" hasArrow>
      <Box display="inline-block" w={3} h={3} borderRadius="full" bg={color} cursor="default" aria-label={label} />
    </Tooltip>
  );
}
