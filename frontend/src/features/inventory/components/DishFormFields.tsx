import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { UseFormRegister, FieldErrors, Controller, Control } from "react-hook-form";
import { CreateDishData, agorotToShekels, shekelsToAgorot } from "@sharons-kitchen/shared";

interface DishFormFieldsProps {
  register: UseFormRegister<CreateDishData>;
  errors: FieldErrors<CreateDishData>;
  control: Control<CreateDishData>;
}

const INPUT_STYLES = {
  bg: "white",
  color: "gray.800",
  borderColor: "gray.500",
  borderWidth: "2px",
  _hover: { borderColor: "gray.700" },
  _focusVisible: { borderColor: "gray.700", boxShadow: "none" },
};

const LABEL_STYLES = { color: "gray.700", mb: 1 };

const STEPPER_STYLES = {
  border: "none" as const,
  color: "gray.600",
  _hover: { bg: "transparent" },
};

export function DishFormFields({ register, errors, control }: DishFormFieldsProps) {
  return (
    <>
      <FormControl isInvalid={!!errors.name} isRequired>
        <FormLabel {...LABEL_STYLES}>שם מנה</FormLabel>
        <Input {...register("name")} placeholder="לדוגמה: קציצות ברוטב" {...INPUT_STYLES} />
        <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
      </FormControl>

      {/* Price — typed in shekels, held in the form as agorot (integer) */}
      <FormControl isInvalid={!!errors.priceAgorot} isRequired>
        <FormLabel {...LABEL_STYLES}>מחיר (₪)</FormLabel>
        <Controller
          name="priceAgorot"
          control={control}
          defaultValue={100}
          render={({ field }) => {
            const invalid = typeof field.value !== "number" || Number.isNaN(field.value);
            return (
              <NumberInput
                min={1}
                precision={2}
                dir="ltr"
                value={invalid ? "" : agorotToShekels(field.value)}
                onChange={(_, valueAsNumber) =>
                  field.onChange(Number.isNaN(valueAsNumber) ? NaN : shekelsToAgorot(valueAsNumber))
                }
                onBlur={() => {
                  if (invalid || field.value < 100) {
                    field.onChange(100);
                  }
                  field.onBlur();
                }}
              >
                <NumberInputField textAlign="right" {...INPUT_STYLES} />
                <NumberInputStepper border="none">
                  <NumberIncrementStepper {...STEPPER_STYLES} />
                  <NumberDecrementStepper {...STEPPER_STYLES} />
                </NumberInputStepper>
              </NumberInput>
            );
          }}
        />
        <FormErrorMessage>{errors.priceAgorot?.message}</FormErrorMessage>
      </FormControl>

      {/* Quantity — controlled; defaults to 1 and snaps back to 1 on blur if cleared */}
      <FormControl isInvalid={!!errors.quantity} isRequired>
        <FormLabel {...LABEL_STYLES}>כמות (קופסאות)</FormLabel>
        <Controller
          name="quantity"
          control={control}
          defaultValue={1}
          render={({ field }) => (
            <NumberInput
              min={1}
              precision={0}
              dir="ltr"
              value={isNaN(field.value) ? "" : field.value}
              onChange={(_, valueAsNumber) =>
                field.onChange(isNaN(valueAsNumber) ? "" : valueAsNumber)
              }
              onBlur={() => {
                if (!field.value || isNaN(field.value) || field.value < 1) {
                  field.onChange(1);
                }
                field.onBlur();
              }}
            >
              <NumberInputField textAlign="right" {...INPUT_STYLES} />
              <NumberInputStepper border="none">
                <NumberIncrementStepper {...STEPPER_STYLES} />
                <NumberDecrementStepper {...STEPPER_STYLES} />
              </NumberInputStepper>
            </NumberInput>
          )}
        />
        <FormErrorMessage>{errors.quantity?.message}</FormErrorMessage>
      </FormControl>

      {/* Units per box — optional; if a value is entered it must be ≥ 1 (corrected on blur) */}
      <FormControl isInvalid={!!errors.unitsPerBox}>
        <FormLabel {...LABEL_STYLES}>יחידות בקופסה</FormLabel>
        <Controller
          name="unitsPerBox"
          control={control}
          render={({ field }) => (
            <NumberInput
              min={1}
              precision={0}
              dir="ltr"
              value={field.value ?? ""}
              onChange={(_, valueAsNumber) =>
                field.onChange(isNaN(valueAsNumber) ? undefined : valueAsNumber)
              }
              onBlur={() => {
                if (field.value !== undefined && !isNaN(field.value) && field.value < 1) {
                  field.onChange(1);
                }
                field.onBlur();
              }}
            >
              <NumberInputField textAlign="right" placeholder="לדוגמה: 6" {...INPUT_STYLES} />
              <NumberInputStepper border="none">
                <NumberIncrementStepper {...STEPPER_STYLES} />
                <NumberDecrementStepper {...STEPPER_STYLES} />
              </NumberInputStepper>
            </NumberInput>
          )}
        />
        <FormErrorMessage>{errors.unitsPerBox?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.description}>
        <FormLabel {...LABEL_STYLES}>תיאור</FormLabel>
        <Input
          {...register("description")}
          placeholder="לדוגמה: קציצות ברוטב עגבניות"
          {...INPUT_STYLES}
        />
        <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
      </FormControl>
    </>
  );
}
