import { Router } from "express";

import {
  createRecipe,
  deleteRecipe,
  editRecipe,
  getPaginatedRecipes,
  getRecipeById,
  reportRecipe,
  saveRecipe,
  toggleLikeRecipe,
} from "../controllers/recipeController.js";
import { authenticate, authCheck, verifyRecipeAuthor } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

export const recipeRouter = Router();

const recipeImages = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "stepImages", maxCount: 10 },
]);

recipeRouter.get("/", getPaginatedRecipes);
recipeRouter.get("/:id", authCheck, getRecipeById);
recipeRouter.post("/", authenticate, recipeImages, createRecipe);
recipeRouter.put("/:id", authenticate, verifyRecipeAuthor, recipeImages, editRecipe);
recipeRouter.delete("/:id", authenticate, verifyRecipeAuthor, deleteRecipe);
recipeRouter.post("/:id/like", authenticate, toggleLikeRecipe);
recipeRouter.post("/:id/save", authenticate, saveRecipe);
recipeRouter.post("/:id/report", authenticate, reportRecipe);
