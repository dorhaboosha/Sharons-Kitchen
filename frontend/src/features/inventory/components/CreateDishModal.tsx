import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Button, VStack } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateDishSchema, CreateDishData } from "@sharons-kitchen/shared";
import { DishFormFields } from "./DishFormFields";

interface CreateDishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateDishModal({ isOpen, onClose }: CreateDishModalProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateDishData>({
    resolver: zodResolver(CreateDishSchema),
  });

  function handleClose() {
    reset();
    onClose();
  }

  function onSubmit(_data: CreateDishData) {
    // POST mutation wired in task 9.4
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent dir="rtl">
        <ModalHeader>הוספת מנה</ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <DishFormFields register={register} errors={errors} />
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
