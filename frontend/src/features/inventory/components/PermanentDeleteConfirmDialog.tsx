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
import { deleteDishPermanently } from "../services/inventoryService";
import { DISHES_QUERY_KEY } from "../hooks/useInventory";

interface PermanentDeleteConfirmDialogProps {
  dishId: DishId | null;
  dishName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PermanentDeleteConfirmDialog({
  dishId,
  dishName,
  isOpen,
  onClose,
}: PermanentDeleteConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: () => deleteDishPermanently(dishId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DISHES_QUERY_KEY] });
      onClose();
    },
    onError: () => {
      toast({
        title: "שגיאה במחיקה לצמיתות",
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
            bg="red.100"
            color="red.700"
            textAlign="center"
            fontSize="lg"
            fontWeight="bold"
            borderBottom="2px solid"
            borderBottomColor="gray.400"
          >
            מחיקה לצמיתות 🗑️
          </AlertDialogHeader>
          <AlertDialogCloseButton color="red.700" />

          <AlertDialogBody pt={5}>
            האם למחוק את המנה <strong>{dishName}</strong> לצמיתות?
            <br />
            פעולה זו אינה הפיכה — המנה תימחק לחלוטין מהמערכת ולא ניתן יהיה לשחזר אותה.
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
              מחיקה לצמיתות
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
