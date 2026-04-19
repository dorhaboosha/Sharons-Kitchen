import { Request, Response, NextFunction } from "express";
import { getDishes, getDishById, createDish, FilterParam, SortByParam, SortOrderParam } from "../services/dishService";
import { sendSuccess } from "../utils/response";
import { CreateDishData } from "@sharons-kitchen/shared";

export async function getDishesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { filter, search, sortBy, sortOrder } = req.query;

    const dishes = await getDishes({
      filter: filter as FilterParam | undefined,
      search: search as string | undefined,
      sortBy: sortBy as SortByParam | undefined,
      sortOrder: sortOrder as SortOrderParam | undefined,
    });

    sendSuccess(res, dishes);
  } catch (err) {
    next(err);
  }
}

export async function getDishByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);
    const dish = await getDishById(id);
    sendSuccess(res, dish);
  } catch (err) {
    next(err);
  }
}

export async function createDishController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dish = await createDish(req.body as CreateDishData);
    sendSuccess(res, dish, 201);
  } catch (err) {
    next(err);
  }
}
