import { useRef } from "react";
import { AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader,
  AlertDialogBody, AlertDialogFooter, Button, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DishId } from "@sharons-kitchen/shared";
import { updateDish } from "../services/inventoryService";
import { DISHES_QUERY_KEY } from "../hooks/useInventory";

interface RestoreConfirmDialogProps {
  dishId: DishId | null;
  dishName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RestoreConfirmDialog({ dishId, dishName, isOpen, onClose }: RestoreConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: () => updateDish(dishId!, { isActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DISHES_QUERY_KEY] });
      onClose();
    },
    onError: () => {
      toast({
        title: "שגיאה בשחזור המנה",
        description: "אירעה שגיאה, נסה שנית",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    },
  });

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} size={{ base: "sm", md: "md" }}>
      <AlertDialogOverlay>
        <AlertDialogContent dir="rtl" bg="brand.50" color="gray.800"
          borderRadius="xl" overflow="hidden">
          <AlertDialogHeader bg="brand.200" color="#2C1810" textAlign="center" fontSize="lg"
            fontWeight="bold" borderBottom="2px solid" borderBottomColor="gray.400">
            שחזור מנה ♻️
          </AlertDialogHeader>

          <AlertDialogBody pt={5}>
            האם לשחזר את המנה <strong>{dishName}</strong>?
            <br />
            המנה תחזור להיות פעילה ותופיע ברשימה.
          </AlertDialogBody>

          <AlertDialogFooter gap={3} borderTop="1px solid" borderTopColor="gray.400">
            <Button ref={cancelRef} variant="ghost" color="gray.600" onClick={onClose}>
              ביטול
            </Button>
            <Button colorScheme="green" isLoading={mutation.isPending} onClick={() => mutation.mutate()}>
              שחזור
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
