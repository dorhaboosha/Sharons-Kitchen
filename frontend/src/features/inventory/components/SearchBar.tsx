import { Input, InputGroup, InputRightElement, Text } from "@chakra-ui/react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <InputGroup>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="חיפוש לפי שם מנה..." bg="white" />
      <InputRightElement pointerEvents="none">
        <Text color="gray.400">🔍</Text>
      </InputRightElement>
    </InputGroup>
  );
}
