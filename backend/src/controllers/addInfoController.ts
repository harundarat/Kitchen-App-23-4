import type { RequestHandler } from "express";

import { AddInfo } from "../models/addInfo.js";

export const getIngredients: RequestHandler = async (_request, response) => {
  const info = await AddInfo.findOne().select("ingredients -_id").lean();
  response.status(200).json({ ingredients: info?.ingredients ?? [] });
};

export const getCategories: RequestHandler = async (_request, response) => {
  const info = await AddInfo.findOne().select("categories -_id").lean();
  response.status(200).json({ categories: info?.categories ?? [] });
};
