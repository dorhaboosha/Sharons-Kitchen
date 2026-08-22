import { useState } from "react";
import { Box, Heading, useDisclosure } from "@chakra-ui/react";
import { Dish, DishId, GetDishesQueryData } from "@sharons-kitchen/shared";
import { useInventory } from "../features/inventory/hooks/useInventory";
import { InventoryToolbar } from "../features/inventory/components/InventoryToolbar";
import { InventoryTable } from "../features/inventory/components/InventoryTable";
import { CreateDishModal } from "../features/inventory/components/CreateDishModal";
import { EditDishModal } from "../features/inventory/components/EditDishModal";
import { DeleteConfirmDialog } from "../features/inventory/components/DeleteConfirmDialog";
import { AdjustStockModal } from "../features/inventory/components/AdjustStockModal";
import { StockLegend } from "../features/inventory/components/StockLegend";
import { RestoreConfirmDialog } from "../features/inventory/components/RestoreConfirmDialog";
import { PermanentDeleteConfirmDialog } from "../features/inventory/components/PermanentDeleteConfirmDialog";
import { SortValue } from "../features/inventory/components/SortControls";

export function InventoryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<GetDishesQueryData["filter"]>("all");
  const [sort, setSort] = useState<SortValue>("");

  // Split combined sort value ("name:asc") into separate API params before querying
  const [sortBy, sortOrder] = sort
    ? (sort.split(":") as [GetDishesQueryData["sortBy"], GetDishesQueryData["sortOrder"]])
    : [undefined, "asc" as const];

  const { data: dishes = [], isLoading } = useInventory({ search, filter, sortBy, sortOrder });

  const hasActiveFilters = Boolean(search) || (filter !== undefined && filter !== "all") || Boolean(sort);

  function handleClearFilters() {
    setSearch("");
    setFilter("all");
    setSort("");
  }

  const createModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteDialog = useDisclosure();
  const restoreDialog = useDisclosure();
  const permanentDeleteDialog = useDisclosure();
  const adjustStockModal = useDisclosure();

  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [deletingDish, setDeletingDish] = useState<{ id: DishId; name: string } | null>(null);
  const [restoringDish, setRestoringDish] = useState<{ id: DishId; name: string } | null>(null);
  const [permanentlyDeletingDish, setPermanentlyDeletingDish] = useState<{ id: DishId; name: string } | null>(null);
  const [adjustingDish, setAdjustingDish] = useState<Dish | null>(null);

  function handleEdit(dish: Dish) {
    setEditingDish(dish);
    editModal.onOpen();
  }

  function handleEditClose() {
    editModal.onClose();
    setEditingDish(null);
  }

  function handleDelete(id: DishId) {
    const dish = dishes.find((d) => d.id === id);
    if (!dish) return;
    setDeletingDish({ id: dish.id, name: dish.name });
    deleteDialog.onOpen();
  }

  function handleDeleteClose() {
    deleteDialog.onClose();
    setDeletingDish(null);
  }

  function handleRestore(dish: Dish) {
    setRestoringDish({ id: dish.id, name: dish.name });
    restoreDialog.onOpen();
  }

  function handleRestoreClose() {
    restoreDialog.onClose();
    setRestoringDish(null);
  }

  function handlePermanentDelete(dish: Dish) {
    setPermanentlyDeletingDish({ id: dish.id, name: dish.name });
    permanentDeleteDialog.onOpen();
  }

  function handlePermanentDeleteClose() {
    permanentDeleteDialog.onClose();
    setPermanentlyDeletingDish(null);
  }

  function handleAdjustStock(dish: Dish) {
    setAdjustingDish(dish);
    adjustStockModal.onOpen();
  }

  function handleAdjustStockClose() {
    adjustStockModal.onClose();
    setAdjustingDish(null);
  }

  return (
    <Box maxW="1200px" mx="auto" px={{ base: 3, md: 6 }} py={{ base: 4, md: 8 }} dir="rtl">
      <Heading size="2xl" textAlign="center" mb={8}>
        ניהול מלאי
      </Heading>

      <InventoryToolbar search={search} onSearchChange={setSearch} filter={filter} onFilterChange={setFilter}
        sort={sort} onSortChange={setSort}
        onAddClick={createModal.onOpen} />

      <StockLegend />

      <InventoryTable dishes={dishes} isLoading={isLoading} hasActiveFilters={hasActiveFilters} onEdit={handleEdit} onDelete={handleDelete} onRestore={handleRestore} onAdjustStock={handleAdjustStock} onPermanentDelete={handlePermanentDelete} onClearFilters={handleClearFilters} />

      <CreateDishModal isOpen={createModal.isOpen} onClose={createModal.onClose} />

      <EditDishModal dish={editingDish} isOpen={editModal.isOpen} onClose={handleEditClose} />

      <DeleteConfirmDialog dishId={deletingDish?.id ?? null} dishName={deletingDish?.name ?? ""} isOpen={deleteDialog.isOpen} onClose={handleDeleteClose} />

      <RestoreConfirmDialog dishId={restoringDish?.id ?? null} dishName={restoringDish?.name ?? ""} isOpen={restoreDialog.isOpen} onClose={handleRestoreClose} />

      <PermanentDeleteConfirmDialog dishId={permanentlyDeletingDish?.id ?? null} dishName={permanentlyDeletingDish?.name ?? ""} isOpen={permanentDeleteDialog.isOpen} onClose={handlePermanentDeleteClose} />

      <AdjustStockModal dish={adjustingDish} isOpen={adjustStockModal.isOpen} onClose={handleAdjustStockClose} />
    </Box>
  );
}
