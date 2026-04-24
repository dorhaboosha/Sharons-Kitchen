import { FormControl, FormLabel, FormErrorMessage, Input, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from "@chakra-ui/react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CreateDishData } from "@sharons-kitchen/shared";

interface DishFormFieldsProps {
  register: UseFormRegister<CreateDishData>;
  errors: FieldErrors<CreateDishData>;
}

const INPUT_STYLES = {
  bg: "white",
  color: "gray.800",
  borderColor: "gray.500",
  borderWidth: "2px",
  _hover: { borderColor: "gray.700" },
  _focusVisible: { borderColor: "gray.700", boxShadow: "none" },
};

const STEPPER_STYLES = {
  border: "none" as const,
  color: "gray.600",
  _hover: { bg: "transparent" },
};

export function DishFormFields({ register, errors }: DishFormFieldsProps) {
  return (
    <>
      <FormControl isInvalid={!!errors.name} isRequired>
        <FormLabel color="gray.700">שם מנה</FormLabel>
        <Input {...register("name")} placeholder="לדוגמה: קציצות ברוטב" {...INPUT_STYLES} />
        <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.price} isRequired>
        <FormLabel color="gray.700">מחיר (₪)</FormLabel>
        <NumberInput min={0} precision={0} dir="ltr">
          <NumberInputField {...register("price", { valueAsNumber: true })} placeholder="0" textAlign="right" {...INPUT_STYLES} />
          <NumberInputStepper border="none">
            <NumberIncrementStepper {...STEPPER_STYLES} />
            <NumberDecrementStepper {...STEPPER_STYLES} />
          </NumberInputStepper>
        </NumberInput>
        <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.quantity} isRequired>
        <FormLabel color="gray.700">כמות (קופסאות)</FormLabel>
        <NumberInput min={0} precision={0} dir="ltr">
          <NumberInputField {...register("quantity", { valueAsNumber: true })} placeholder="0" textAlign="right" {...INPUT_STYLES} />
          <NumberInputStepper border="none">
            <NumberIncrementStepper {...STEPPER_STYLES} />
            <NumberDecrementStepper {...STEPPER_STYLES} />
          </NumberInputStepper>
        </NumberInput>
        <FormErrorMessage>{errors.quantity?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.unitsPerBox}>
        <FormLabel color="gray.700">יחידות בקופסה</FormLabel>
        <NumberInput min={1} precision={0} dir="ltr">
          <NumberInputField {...register("unitsPerBox", { valueAsNumber: true })} placeholder="לדוגמה: 6" textAlign="right" {...INPUT_STYLES} />
          <NumberInputStepper border="none">
            <NumberIncrementStepper {...STEPPER_STYLES} />
            <NumberDecrementStepper {...STEPPER_STYLES} />
          </NumberInputStepper>
        </NumberInput>
        <FormErrorMessage>{errors.unitsPerBox?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.description}>
        <FormLabel color="gray.700">תיאור</FormLabel>
        <Input {...register("description")} placeholder="לדוגמה: קציצות ברוטב עגבניות" {...INPUT_STYLES} />
        <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
      </FormControl>
    </>
  );
}
