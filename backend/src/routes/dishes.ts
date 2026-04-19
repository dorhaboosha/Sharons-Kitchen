import { Router } from "express";
import { validate, validateQuery } from "../middlewares/validate";
import { CreateDishSchema, UpdateDishSchema, AdjustStockSchema, GetDishesQuerySchema } from "@sharons-kitchen/shared";
import { getDishesController, getDishByIdController, createDishController, updateDishController, adjustStockController } from "../controllers/dishControllers";

const router = Router();

router.get("/", validateQuery(GetDishesQuerySchema), getDishesController);
router.get("/:id", getDishByIdController);
router.post("/", validate(CreateDishSchema), createDishController);
router.patch("/:id", validate(UpdateDishSchema), updateDishController);
router.post("/:id/adjust-stock", validate(AdjustStockSchema), adjustStockController);

export default router;
