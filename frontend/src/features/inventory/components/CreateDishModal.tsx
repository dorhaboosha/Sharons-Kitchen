import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, 
  ModalCloseButton, Button, VStack, useToast } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateDishSchema, CreateDishData } from "@sharons-kitchen/shared";
import { createDish } from "../services/inventoryService";
import { DISHES_QUERY_KEY } from "../hooks/useInventory";
import { ApiClientError } from "../../../services/apiClient";
import { DishFormFields } from "./DishFormFields";

interface CreateDishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateDishModal({ isOpen, onClose }: CreateDishModalProps) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } =
    useForm<CreateDishData>({ resolver: zodResolver(CreateDishSchema) });

  const mutation = useMutation({
    mutationFn: createDish,
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

  function handleClose() {
    reset();
    onClose();
  }

  function onSubmit(data: CreateDishData) {
    mutation.mutate(data);
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
            <Button type="submit" colorScheme="teal" isLoading={mutation.isPending}>
              שמירה
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
