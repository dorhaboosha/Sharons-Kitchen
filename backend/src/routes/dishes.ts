import { Router } from "express";
import { validate } from "../middlewares/validate";
import { CreateDishSchema, UpdateDishSchema, AdjustStockSchema } from "@sharons-kitchen/shared";
import { getDishesController, getDishByIdController, createDishController, updateDishController, adjustStockController } from "../controllers/dishControllers";

const router = Router();

router.get("/", getDishesController);
router.get("/:id", getDishByIdController);
router.post("/", validate(CreateDishSchema), createDishController);
router.patch("/:id", validate(UpdateDishSchema), updateDishController);
router.post("/:id/adjust-stock", validate(AdjustStockSchema), adjustStockController);

export default router;
