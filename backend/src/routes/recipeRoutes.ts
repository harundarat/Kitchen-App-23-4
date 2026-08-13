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
import { authenticate, authCheck, onlyUser, verifyRecipeAuthor } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

export const recipeRouter = Router();

const recipeImages = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "stepImages", maxCount: 10 },
]);

recipeRouter.get("/", getPaginatedRecipes);
recipeRouter.get("/:id", authCheck, getRecipeById);
recipeRouter.post("/", authenticate, onlyUser, recipeImages, createRecipe);
recipeRouter.put("/:id", authenticate, onlyUser, verifyRecipeAuthor, recipeImages, editRecipe);
recipeRouter.delete("/:id", authenticate, onlyUser, verifyRecipeAuthor, deleteRecipe);
recipeRouter.post("/:id/like", authenticate, onlyUser, toggleLikeRecipe);
recipeRouter.post("/:id/save", authenticate, onlyUser, saveRecipe);
recipeRouter.post("/:id/report", authenticate, onlyUser, reportRecipe);
