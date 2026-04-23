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
  const adjustStockModal = useDisclosure();

  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [deletingDish, setDeletingDish] = useState<{ id: DishId; name: string } | null>(null);
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

  function handleAdjustStock(dish: Dish) {
    setAdjustingDish(dish);
    adjustStockModal.onOpen();
  }

  function handleAdjustStockClose() {
    adjustStockModal.onClose();
    setAdjustingDish(null);
  }

  return (
    <Box maxW="1200px" mx="auto" px={6} py={8} dir="rtl">
      <Heading size="lg" mb={6}>
        מלאי
      </Heading>

      <InventoryToolbar search={search} onSearchChange={setSearch} filter={filter} onFilterChange={setFilter}
        sort={sort} onSortChange={setSort}
        onAddClick={createModal.onOpen} />

      <InventoryTable dishes={dishes} isLoading={isLoading} hasActiveFilters={hasActiveFilters} onEdit={handleEdit} onDelete={handleDelete} onRestore={handleEdit} onAdjustStock={handleAdjustStock} onClearFilters={handleClearFilters} />

      <CreateDishModal isOpen={createModal.isOpen} onClose={createModal.onClose} />

      <EditDishModal dish={editingDish} isOpen={editModal.isOpen} onClose={handleEditClose} />

      <DeleteConfirmDialog dishId={deletingDish?.id ?? null} dishName={deletingDish?.name ?? ""} isOpen={deleteDialog.isOpen} onClose={handleDeleteClose} />

      <AdjustStockModal dish={adjustingDish} isOpen={adjustStockModal.isOpen} onClose={handleAdjustStockClose} />
    </Box>
  );
}
