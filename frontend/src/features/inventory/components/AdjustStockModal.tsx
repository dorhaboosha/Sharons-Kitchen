import { useEffect } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Button, ButtonGroup, FormControl, FormLabel,
  FormErrorMessage, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, VStack, Text, useToast } from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dish } from "@sharons-kitchen/shared";
import { adjustStock } from "../services/inventoryService";
import { DISHES_QUERY_KEY } from "../hooks/useInventory";
import { ApiClientError } from "../../../services/apiClient";

interface AdjustStockModalProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
}

const AdjustStockFormSchema = z.object({
  direction: z.enum(["add", "subtract"]),
  amount: z.number().int().min(1, "הכמות חייבת להיות לפחות 1"),
});

type AdjustStockFormData = z.infer<typeof AdjustStockFormSchema>;

export function AdjustStockModal({ dish, isOpen, onClose }: AdjustStockModalProps) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { control, handleSubmit, reset, watch, setError, formState: { errors } } =
    useForm<AdjustStockFormData>({
      resolver: zodResolver(AdjustStockFormSchema),
      defaultValues: { direction: "add", amount: 1 },
    });

  const direction = watch("direction");

  const mutation = useMutation({
    mutationFn: ({ direction, amount }: AdjustStockFormData) => {
      const delta = direction === "add" ? amount : -amount;
      return adjustStock(dish!.id, { delta });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DISHES_QUERY_KEY] });
      handleClose();
    },
    onError: (err: unknown) => {
      if (err instanceof ApiClientError && err.code === "VALIDATION_ERROR") {
        setError("amount", { message: "הכמות להפחתה גדולה מהמלאי הקיים" });
      } else {
        toast({
          title: "שגיאה בעדכון המלאי",
          description: "אירעה שגיאה, נסה שנית",
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
      }
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ direction: "add", amount: 1 });
    }
  }, [isOpen, reset]);

  function handleClose() {
    reset();
    onClose();
  }

  function onSubmit(data: AdjustStockFormData) {
    mutation.mutate(data);
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} closeOnOverlayClick={false} size={{ base: "md", md: "lg" }}>
      <ModalOverlay />
      <ModalContent dir="rtl" bg="brand.50" color="gray.800" borderRadius="xl" overflow="hidden">
        <ModalHeader bg="brand.200" color="#2C1810" textAlign="center" fontSize="xl" fontWeight="bold"
          borderBottom="2px solid" borderBottomColor="gray.400">
          עדכון מלאי 📦{dish ? ` — ${dish.name}` : ""}
        </ModalHeader>
        <ModalCloseButton color="#2C1810" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody pt={5}>
            <VStack spacing={5} align="stretch">
              <Text fontSize="sm" color="gray.600">
                כמות נוכחית: <strong>{dish?.quantity ?? 0}</strong>
              </Text>

              <FormControl>
                <FormLabel color="gray.700">פעולה</FormLabel>
                <Controller
                  name="direction"
                  control={control}
                  render={({ field }) => (
                    <ButtonGroup isAttached variant="outline" w="full">
                      <Button flex={1} colorScheme="green" variant={field.value === "add" ? "solid" : "outline"} 
                        onClick={() => field.onChange("add")} type="button">
                        הוספה
                      </Button>
                      <Button flex={1} colorScheme="red" variant={field.value === "subtract" ? "solid" : "outline"}
                        onClick={() => field.onChange("subtract")} type="button">
                        הפחתה
                      </Button>
                    </ButtonGroup>
                  )}
                />
              </FormControl>

              <FormControl isInvalid={!!errors.amount}>
                <FormLabel color="gray.700">כמות {direction === "add" ? "להוספה" : "להפחתה"}</FormLabel>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <NumberInput min={1} value={field.value}
                      onChange={(_, valueAsNumber) => field.onChange(isNaN(valueAsNumber) ? 1 : valueAsNumber)} dir="ltr">
                      <NumberInputField textAlign="right" bg="white" color="gray.800" borderColor="gray.500"
                        borderWidth="2px" _hover={{ borderColor: "gray.700" }}
                        _focusVisible={{ borderColor: "gray.700", boxShadow: "none" }} />
                      <NumberInputStepper border="none">
                        <NumberIncrementStepper border="none" color="gray.600" _hover={{ bg: "transparent" }} />
                        <NumberDecrementStepper border="none" color="gray.600" _hover={{ bg: "transparent" }} />
                      </NumberInputStepper>
                    </NumberInput>
                  )}
                />
                {errors.amount && (
                  <FormErrorMessage>{errors.amount.message}</FormErrorMessage>
                )}
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter gap={3} borderTop="1px solid" borderTopColor="gray.400">
            <Button variant="ghost" color="gray.600" onClick={handleClose}>
              ביטול
            </Button>
            <Button type="submit" colorScheme={direction === "add" ? "green" : "red"} isLoading={mutation.isPending}>
              {direction === "add" ? "הוספה" : "הפחתה"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
