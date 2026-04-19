import { Request, Response, NextFunction } from "express";
import { getDishes, FilterParam, SortByParam, SortOrderParam } from "../services/dishService";
import { sendSuccess } from "../utils/response";

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
