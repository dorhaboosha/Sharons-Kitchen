import { Input, InputGroup, InputLeftElement, Text } from "@chakra-ui/react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <Text color="gray.400">🔍</Text>
      </InputLeftElement>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="חיפוש לפי שם מנה..."
        bg="white" color="gray.800" borderColor="brand.300" borderWidth="2px" _hover={{ borderColor: "brand.400" }}
        _focusVisible={{ borderColor: "brand.500", boxShadow: "none" }} _placeholder={{ color: "gray.400" }} />
    </InputGroup>
  );
}
