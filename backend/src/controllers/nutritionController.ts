import type { RequestHandler } from "express";
import type mongoose from "mongoose";
import { z } from "zod";

import { Nutrition, type INutrition } from "../models/nutrition.js";
import { parseInput } from "../utils/validation.js";

const nutritionSearchSchema = z.object({
  caloriesMax: z.coerce.number().nonnegative().optional(),
  totalFatMax: z.coerce.number().nonnegative().optional(),
  saturatedFatMax: z.coerce.number().nonnegative().optional(),
  proteinMin: z.coerce.number().nonnegative().optional(),
  carbohydratesMin: z.coerce.number().nonnegative().optional(),
  sugarMax: z.coerce.number().nonnegative().optional(),
  sodiumMax: z.coerce.number().nonnegative().optional(),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export const searchNutrition: RequestHandler = async (request, response) => {
  const input = parseInput(nutritionSearchSchema, request.query);
  const query: mongoose.QueryFilter<INutrition> = {};
  if (input.caloriesMax !== undefined) query.calories = { $lte: input.caloriesMax };
  if (input.totalFatMax !== undefined) query["totalFat.amount"] = { $lte: input.totalFatMax };
  if (input.saturatedFatMax !== undefined) query["saturatedFat.amount"] = { $lte: input.saturatedFatMax };
  if (input.proteinMin !== undefined) query["protein.amount"] = { $gte: input.proteinMin };
  if (input.carbohydratesMin !== undefined) query["carbohydrates.amount"] = { $gte: input.carbohydratesMin };
  if (input.sugarMax !== undefined) query["sugar.amount"] = { $lte: input.sugarMax };
  if (input.sodiumMax !== undefined) query["sodium.amount"] = { $lte: input.sodiumMax };

  const nutrition = await Nutrition.find(query)
    .populate({ path: "recipe", select: "title image totalTime categories" })
    .limit(input.limit);
  response.status(200).json({ nutrition });
};
