import type { Request, RequestHandler } from "express";
import type mongoose from "mongoose";
import type { SortOrder } from "mongoose";
import { z } from "zod";

import { Like } from "../models/like.js";
import { Nutrition, type INutrition } from "../models/nutrition.js";
import { Recipe, type IRecipe } from "../models/recipe.js";
import { Report } from "../models/report.js";
import { SavedRecipe } from "../models/savedRecipe.js";
import { deleteRecipeWithRelations } from "../services/cascadeDelete.js";
import { uploadImage } from "../services/storage.js";
import { ApiError } from "../utils/apiError.js";
import { assertObjectId, optionalJson, parseInput, routeParam, stringArray } from "../utils/validation.js";

const optionalUrl = z.union([z.literal(""), z.url()]);
const textArray = z.preprocess(stringArray, z.array(z.string().trim().min(1)));
const stepArray = z.preprocess(
  stringArray,
  z.array(
    z.union([
      z.string().trim().min(1).transform((description) => ({ description, image: "" })),
      z.object({
        description: z.string().trim().min(1).max(2_000),
        image: optionalUrl.default(""),
      }),
    ]),
  ).min(1).max(20),
);

const nutrientSchema = z.object({
  amount: z.coerce.number().nonnegative(),
  unit: z.enum(["g", "mg"]),
  dailyValuePercent: z.coerce.number().nonnegative().optional(),
});

const nutritionSchema = z.object({
  calories: z.coerce.number().nonnegative().optional(),
  totalFat: nutrientSchema.optional(),
  saturatedFat: nutrientSchema.optional(),
  protein: nutrientSchema.optional(),
  carbohydrates: nutrientSchema.optional(),
  sugar: nutrientSchema.optional(),
  sodium: nutrientSchema.optional(),
  source: z.enum(["manual", "ai"]).default("manual"),
});

const createRecipeSchema = z.object({
  title: z.string().trim().min(1).max(150),
  image: optionalUrl.default(""),
  description: z.string().trim().min(1).max(10_000),
  totalTime: z.string().trim().min(1).max(100),
  video: optionalUrl.default(""),
  ingredients: textArray.pipe(z.array(z.string()).min(1).max(100)),
  steps: stepArray,
  categories: textArray.pipe(z.array(z.string()).max(30)).default([]),
  nutrition: z.preprocess(optionalJson, nutritionSchema.optional()),
});

const updateRecipeSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
  image: optionalUrl.optional(),
  description: z.string().trim().min(1).max(10_000).optional(),
  totalTime: z.string().trim().min(1).max(100).optional(),
  video: optionalUrl.optional(),
  ingredients: textArray.pipe(z.array(z.string()).min(1).max(100)).optional(),
  steps: stepArray.optional(),
  categories: textArray.pipe(z.array(z.string()).max(30)).optional(),
  nutrition: z.preprocess(optionalJson, nutritionSchema.nullable().optional()),
});

const listSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  category: z.string().trim().optional(),
  search: z.string().trim().max(200).optional(),
  ingredients: z.string().trim().max(500).optional(),
  popular: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
});

const reportSchema = z.object({
  reason: z.string().trim().min(1).max(100),
  description: z.string().trim().max(2_000).default(""),
}).strict();

type RequestBody = Record<string, unknown>;

function normalizedBody(request: Request): RequestBody {
  const body = (request.body && typeof request.body === "object" ? request.body : {}) as RequestBody;
  return {
    title: body.title,
    image: body.image,
    description: body.description,
    totalTime: body.totalTime ?? body.total_time,
    video: body.video,
    ingredients: body.ingredients,
    steps: body.steps ?? body.stepDescription,
    categories: body.categories ?? body.category,
    nutrition: body.nutrition,
  };
}

function normalizedUpdateBody(request: Request): RequestBody {
  return Object.fromEntries(
    Object.entries(normalizedBody(request)).filter(([, value]) => value !== undefined),
  );
}

function filesByField(request: Request): Record<string, Express.Multer.File[]> {
  if (!request.files || Array.isArray(request.files)) return {};
  return request.files;
}

async function applyImageUploads(request: Request, recipe: InstanceType<typeof Recipe>): Promise<void> {
  const files = filesByField(request);
  const mainImage = files.image?.[0];
  if (mainImage) {
    recipe.image = await uploadImage(
      `images/recipes/${recipe._id}/main.image`,
      mainImage.buffer,
      mainImage.mimetype,
    );
  }

  const stepImages = files.stepImages ?? [];
  if (stepImages.length > recipe.steps.length) {
    throw new ApiError(400, "There cannot be more step images than recipe steps", "INVALID_STEP_IMAGES");
  }

  const uploaded = await Promise.all(
    stepImages.map((file, index) =>
      uploadImage(`images/recipes/${recipe._id}/step-${index}.image`, file.buffer, file.mimetype),
    ),
  );
  uploaded.forEach((image, index) => {
    const step = recipe.steps[index];
    if (step) step.image = image;
  });
}

async function saveNutrition(
  recipeId: IRecipe["author"],
  nutrition: z.output<typeof nutritionSchema> | null | undefined,
): Promise<void> {
  if (nutrition === undefined) return;
  if (nutrition === null) {
    await Nutrition.deleteOne({ recipe: recipeId });
    return;
  }
  await Nutrition.findOneAndUpdate(
    { recipe: recipeId },
    { ...nutrition, recipe: recipeId },
    { upsert: true, runValidators: true, new: true },
  );
}

export const getPaginatedRecipes: RequestHandler = async (request, response) => {
  const input = parseInput(listSchema, request.query);
  const query: mongoose.QueryFilter<IRecipe> = {};
  if (input.category) query.categories = { $in: input.category.split(",").map((item) => item.trim()) };

  const textSearch = [input.search, input.ingredients].filter(Boolean).join(" ").trim();
  if (textSearch) query.$text = { $search: textSearch };

  const sort: Record<string, SortOrder> = input.popular
    ? { likeCount: -1, createdAt: -1 }
    : { createdAt: -1 };
  const [recipes, total] = await Promise.all([
    Recipe.find(query)
      .select("title image totalTime likeCount categories createdAt author")
      .populate({ path: "author", select: "fullName image username" })
      .sort(sort)
      .skip((input.page - 1) * input.limit)
      .limit(input.limit),
    Recipe.countDocuments(query),
  ]);

  response.status(200).json({
    recipes,
    pagination: {
      total,
      totalPages: Math.ceil(total / input.limit),
      currentPage: input.page,
      limit: input.limit,
    },
  });
};

export const getRecipeById: RequestHandler = async (request, response) => {
  const id = routeParam(request, "id");
  assertObjectId(id, "recipe id");
  const recipe = await Recipe.findById(id).populate({
    path: "author",
    select: "fullName image username",
  });
  if (!recipe) throw new ApiError(404, "Recipe not found", "NOT_FOUND");

  const [nutrition, liked, saved] = await Promise.all([
    Nutrition.findOne({ recipe: recipe._id }),
    request.user ? Like.exists({ recipe: recipe._id, user: request.user.id }) : null,
    request.user ? SavedRecipe.exists({ recipe: recipe._id, user: request.user.id }) : null,
  ]);
  response.status(200).json({
    recipe: { ...recipe.toObject(), nutrition, isLiked: Boolean(liked), isSaved: Boolean(saved) },
  });
};

export const createRecipe: RequestHandler = async (request, response) => {
  const data = parseInput(createRecipeSchema, normalizedBody(request));
  const { nutrition, ...recipeData } = data;
  const recipe = new Recipe({ ...recipeData, author: request.user!.id });
  await applyImageUploads(request, recipe);
  await recipe.save();
  await saveNutrition(recipe._id, nutrition);
  response.status(201).json({ message: "Recipe created successfully", recipe });
};

export const editRecipe: RequestHandler = async (request, response) => {
  const data = parseInput(updateRecipeSchema, normalizedUpdateBody(request));
  const recipe = request.recipe!;
  const { nutrition, ...recipeData } = data;
  Object.assign(recipe, recipeData);
  await applyImageUploads(request, recipe);
  await recipe.save();
  await saveNutrition(recipe._id, nutrition);
  response.status(200).json({ message: "Recipe updated successfully", recipe });
};

export const deleteRecipe: RequestHandler = async (request, response) => {
  await deleteRecipeWithRelations(request.recipe!._id);
  response.status(200).json({ message: "Recipe deleted successfully" });
};

export const toggleLikeRecipe: RequestHandler = async (request, response) => {
  const id = routeParam(request, "id");
  assertObjectId(id, "recipe id");
  const recipeExists = await Recipe.exists({ _id: id });
  if (!recipeExists) throw new ApiError(404, "Recipe not found", "NOT_FOUND");

  const existing = await Like.findOneAndDelete({ recipe: id, user: request.user!.id });
  let liked = false;
  if (!existing) {
    try {
      await Like.create({ recipe: id, user: request.user!.id });
      liked = true;
    } catch (error) {
      if ((error as { code?: number }).code !== 11000) throw error;
      liked = true;
    }
  }

  const likeCount = await Like.countDocuments({ recipe: id });
  await Recipe.updateOne({ _id: id }, { $set: { likeCount } });
  response.status(200).json({ liked, likeCount });
};

export const saveRecipe: RequestHandler = async (request, response) => {
  const id = routeParam(request, "id");
  assertObjectId(id, "recipe id");
  if (!(await Recipe.exists({ _id: id }))) {
    throw new ApiError(404, "Recipe not found", "NOT_FOUND");
  }

  const existing = await SavedRecipe.findOneAndDelete({
    recipe: id,
    user: request.user!.id,
  });
  let saved = false;
  if (!existing) {
    try {
      await SavedRecipe.create({ recipe: id, user: request.user!.id });
      saved = true;
    } catch (error) {
      if ((error as { code?: number }).code !== 11000) throw error;
      saved = true;
    }
  }
  response.status(200).json({ saved });
};

export const reportRecipe: RequestHandler = async (request, response) => {
  const id = routeParam(request, "id");
  assertObjectId(id, "recipe id");
  if (!(await Recipe.exists({ _id: id }))) {
    throw new ApiError(404, "Recipe not found", "NOT_FOUND");
  }
  const data = parseInput(reportSchema, request.body);
  const report = await Report.create({ ...data, recipe: id, user: request.user!.id });
  response.status(201).json({ message: "Recipe has been reported", report });
};

export type NutritionInput = Omit<INutrition, "recipe" | "createdAt" | "updatedAt">;
