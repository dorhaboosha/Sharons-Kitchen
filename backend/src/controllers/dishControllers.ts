import { Request, Response, NextFunction } from "express";
import { getDishes, getDishById, createDish, updateDish, adjustStock } from "../services/dishService";
import { sendSuccess } from "../utils/response";
import { CreateDishData, UpdateDishData, AdjustStockData, GetDishesQueryData } from "@sharons-kitchen/shared";

export async function getDishesController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = res.locals.query as GetDishesQueryData;
    const dishes = await getDishes(query);
    sendSuccess(res, dishes);
  }
  catch (err) {
    next(err);
  }
}

export async function getDishByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const dish = await getDishById(id);
    sendSuccess(res, dish);
  } 
  catch (err) {
    next(err);
  }
}

export async function createDishController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dish = await createDish(req.body as CreateDishData);
    sendSuccess(res, dish, 201);
  } 
  catch (err) {
    next(err);
  }
}

export async function updateDishController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const dish = await updateDish(id, req.body as UpdateDishData);
    sendSuccess(res, dish);
  } 
  catch (err) {
    next(err);
  }
}

export async function adjustStockController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const dish = await adjustStock(id, (req.body as AdjustStockData).delta);
    sendSuccess(res, dish);
  } 
  catch (err) {
    next(err);
  }
}
