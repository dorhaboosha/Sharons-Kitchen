import { FormControl, FormLabel, FormErrorMessage, Input, NumberInput, NumberInputField } from "@chakra-ui/react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CreateDishData } from "@sharons-kitchen/shared";

interface DishFormFieldsProps {
  register: UseFormRegister<CreateDishData>;
  errors: FieldErrors<CreateDishData>;
}

export function DishFormFields({ register, errors }: DishFormFieldsProps) {
  return (
    <>
      <FormControl isInvalid={!!errors.name} isRequired>
        <FormLabel>שם מנה</FormLabel>
        <Input {...register("name")} placeholder="לדוגמה: קציצות ברוטב" />
        <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.price} isRequired>
        <FormLabel>מחיר (₪)</FormLabel>
        <NumberInput min={0} precision={0}>
          <NumberInputField
            {...register("price", { valueAsNumber: true })}
            placeholder="0"
          />
        </NumberInput>
        <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.quantity} isRequired>
        <FormLabel>כמות (קופסאות)</FormLabel>
        <NumberInput min={0} precision={0}>
          <NumberInputField
            {...register("quantity", { valueAsNumber: true })}
            placeholder="0"
          />
        </NumberInput>
        <FormErrorMessage>{errors.quantity?.message}</FormErrorMessage>
      </FormControl>
    </>
  );
}
