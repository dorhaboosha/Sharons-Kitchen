import { useEffect } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Button, VStack, FormControl, FormLabel, 
  Switch, useToast } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dish, UpdateDishSchema, UpdateDishData, CreateDishData } from "@sharons-kitchen/shared";
import { DishFormFields } from "./DishFormFields";
import { updateDish } from "../services/inventoryService";
import { DISHES_QUERY_KEY } from "../hooks/useInventory";
import { ApiClientError } from "../../../services/apiClient";
import type { UseFormRegister, FieldErrors } from "react-hook-form";

interface EditDishModalProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditDishModal({ dish, isOpen, onClose }: EditDishModalProps) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { register, handleSubmit, reset, watch, setValue, setError, formState: { errors } } =
    useForm<UpdateDishData>({ resolver: zodResolver(UpdateDishSchema) });

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
      } 
      else {
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
        price: dish.price,
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
    <Modal isOpen={isOpen} onClose={handleClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent dir="rtl">
        <ModalHeader>עריכת מנה</ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <DishFormFields register={register as unknown as UseFormRegister<CreateDishData>} errors={errors as FieldErrors<CreateDishData>} />

              <FormControl display="flex" alignItems="center" gap={3}>
                <FormLabel mb={0}>מנה פעילה</FormLabel>
                <Switch
                  isChecked={isActive ?? true}
                  onChange={(e) => setValue("isActive", e.target.checked)}
                  colorScheme="brand"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={handleClose}>
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
