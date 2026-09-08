import { useRef } from "react";
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogCloseButton,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DishId } from "@sharons-kitchen/shared";
import { updateDish } from "../services/inventoryService";
import { DISHES_QUERY_KEY } from "../hooks/useInventory";

interface DeleteConfirmDialogProps {
  dishId: DishId | null;
  dishName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteConfirmDialog({
  dishId,
  dishName,
  isOpen,
  onClose,
}: DeleteConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: () => updateDish(dishId!, { isActive: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DISHES_QUERY_KEY] });
      onClose();
    },
    onError: () => {
      toast({
        title: "שגיאה במחיקת המנה",
        description: "אירעה שגיאה, נסה שנית",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    },
  });

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      size={{ base: "sm", md: "md" }}
      closeOnOverlayClick
    >
      <AlertDialogOverlay>
        <AlertDialogContent
          dir="rtl"
          bg="brand.50"
          color="gray.800"
          borderRadius="xl"
          overflow="hidden"
        >
          <AlertDialogHeader
            bg="brand.200"
            color="#2C1810"
            textAlign="center"
            fontSize="lg"
            fontWeight="bold"
            borderBottom="2px solid"
            borderBottomColor="gray.400"
          >
            מחיקת מנה 🗑️
          </AlertDialogHeader>
          <AlertDialogCloseButton color="#2C1810" />

          <AlertDialogBody pt={5}>
            האם למחוק את המנה <strong>{dishName}</strong>?
            <br />
            המנה לא תימחק לצמיתות — ניתן לשחזר אותה בהמשך.
          </AlertDialogBody>

          <AlertDialogFooter gap={3} borderTop="1px solid" borderTopColor="gray.400">
            <Button ref={cancelRef} variant="ghost" color="gray.600" onClick={onClose}>
              ביטול
            </Button>
            <Button
              colorScheme="red"
              isLoading={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              מחיקה
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
