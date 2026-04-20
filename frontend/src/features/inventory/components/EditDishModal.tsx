import { useEffect } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Button, VStack, FormControl, 
  FormLabel, Switch } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dish, UpdateDishSchema, UpdateDishData, CreateDishData } from "@sharons-kitchen/shared";
import { DishFormFields } from "./DishFormFields";
import type { UseFormRegister, FieldErrors } from "react-hook-form";

interface EditDishModalProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditDishModal({ dish, isOpen, onClose }: EditDishModalProps) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<UpdateDishData>({ resolver: zodResolver(UpdateDishSchema) });

  const isActive = watch("isActive");

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

  function onSubmit(_data: UpdateDishData) {
    // PATCH mutation wired in task 9.6
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
              <DishFormFields
                register={register as unknown as UseFormRegister<CreateDishData>}
                errors={errors as FieldErrors<CreateDishData>}
              />

              <FormControl display="flex" alignItems="center" gap={3}>
                <FormLabel mb={0}>מנה פעילה</FormLabel>
                <Switch isChecked={isActive ?? true} onChange={(e) => setValue("isActive", e.target.checked)} colorScheme="teal" />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={handleClose}>
              ביטול
            </Button>
            <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
              שמירה
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
