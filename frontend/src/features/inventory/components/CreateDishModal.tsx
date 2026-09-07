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
  useToast,
} from "@chakra-ui/react";
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

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm<CreateDishData>({
    resolver: zodResolver(CreateDishSchema),
    defaultValues: { price: 1, quantity: 1 },
  });

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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={true}
      size={{ base: "md", md: "lg" }}
    >
      <ModalOverlay />
      <ModalContent dir="rtl" bg="brand.50" color="gray.800" borderRadius="xl" overflow="hidden">
        {/* Header strip in logo blue with brown title text */}
        <ModalHeader
          bg="brand.200"
          color="#2C1810"
          textAlign="center"
          fontSize="xl"
          fontWeight="bold"
          borderBottom="2px solid"
          borderBottomColor="gray.400"
        >
          הוספת מנה חדשה 🍽️
        </ModalHeader>
        <ModalCloseButton color="#2C1810" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody pt={3} pb={2}>
            <VStack spacing={3} align="stretch">
              <DishFormFields register={register} errors={errors} control={control} />
            </VStack>
          </ModalBody>

          <ModalFooter gap={3} borderTop="1px solid" borderTopColor="gray.400">
            <Button variant="ghost" color="gray.600" onClick={handleClose}>
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
