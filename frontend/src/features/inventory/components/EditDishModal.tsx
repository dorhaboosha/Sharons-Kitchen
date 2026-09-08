import { useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Switch,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dish, UpdateDishSchema, UpdateDishData, CreateDishData } from "@sharons-kitchen/shared";
import { DishFormFields } from "./DishFormFields";
import { updateDish } from "../services/inventoryService";
import { DISHES_QUERY_KEY } from "../hooks/useInventory";
import { ApiClientError } from "../../../services/apiClient";
import type { UseFormRegister, FieldErrors, Control } from "react-hook-form";

interface EditDishModalProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditDishModal({ dish, isOpen, onClose }: EditDishModalProps) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<UpdateDishData>({ resolver: zodResolver(UpdateDishSchema) });

  const isActive = watch("isActive");

  const mutation = useMutation({
    mutationFn: (data: UpdateDishData) => updateDish(dish!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DISHES_QUERY_KEY] });
      handleClose();
    },
    onError: (err: unknown) => {
      if (err instanceof ApiClientError && err.code === "CONFLICT") {
        setError("name", { message: "כבר קיימת מנה בשם הזה" });
      } else {
        toast({
          title: "שגיאה בשמירת המנה",
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
    if (dish) {
      reset({
        name: dish.name,
        priceAgorot: dish.priceAgorot,
        quantity: dish.quantity,
        unitsPerBox: dish.unitsPerBox ?? undefined,
        description: dish.description ?? undefined,
        isActive: dish.isActive,
      });
    }
  }, [dish, reset]);

  function handleClose() {
    reset();
    onClose();
  }

  function onSubmit(data: UpdateDishData) {
    mutation.mutate(data);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={true}
      size={{ base: "md", md: "lg" }}
    >
      <ModalOverlay />
      <ModalContent dir="rtl" bg="brand.50" color="gray.800" borderRadius="xl" overflow="hidden">
        <ModalHeader
          bg="brand.200"
          color="#2C1810"
          textAlign="center"
          fontSize="xl"
          fontWeight="bold"
          borderBottom="2px solid"
          borderBottomColor="gray.400"
        >
          עריכת מנה ✏️
        </ModalHeader>
        <ModalCloseButton color="#2C1810" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody pt={3} pb={2}>
            <VStack spacing={3} align="stretch">
              <DishFormFields
                register={register as unknown as UseFormRegister<CreateDishData>}
                errors={errors as FieldErrors<CreateDishData>}
                control={control as unknown as Control<CreateDishData>}
              />

              <FormControl display="flex" alignItems="center" gap={3}>
                <FormLabel mb={0} color="gray.700">
                  מנה פעילה
                </FormLabel>
                <Switch
                  isChecked={isActive ?? true}
                  onChange={(e) => setValue("isActive", e.target.checked)}
                  sx={{
                    ".chakra-switch__track[data-checked]": { bg: "green.400" },
                    ".chakra-switch__track:not([data-checked])": { bg: "red.400" },
                  }}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter gap={3} borderTop="1px solid" borderTopColor="gray.400">
            <Button variant="ghost" color="gray.700" onClick={handleClose}>
              ביטול
            </Button>
            <Button type="submit" colorScheme="brand" isLoading={mutation.isPending}>
              שמירה
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
