import type { Types } from "mongoose";

import { Like } from "../models/like.js";
import { Nutrition } from "../models/nutrition.js";
import { Recipe } from "../models/recipe.js";
import { Report } from "../models/report.js";
import { SavedRecipe } from "../models/savedRecipe.js";
import { User } from "../models/user.js";

type DocumentId = string | Types.ObjectId;

export async function deleteRecipeWithRelations(recipeId: DocumentId): Promise<boolean> {
  const result = await Recipe.deleteOne({ _id: recipeId });
  if (result.deletedCount === 0) return false;

  await Promise.all([
    Nutrition.deleteMany({ recipe: recipeId }),
    Like.deleteMany({ recipe: recipeId }),
    SavedRecipe.deleteMany({ recipe: recipeId }),
    Report.deleteMany({ recipe: recipeId }),
  ]);
  return true;
}

export async function deleteUserWithRelations(userId: DocumentId): Promise<boolean> {
  const [authoredRecipes, likedRecipes] = await Promise.all([
    Recipe.find({ author: userId }).select("_id").lean(),
    Like.find({ user: userId }).select("recipe").lean(),
  ]);

  const recipeIds = authoredRecipes.map((recipe) => recipe._id);
  const affectedLikeCounts = likedRecipes
    .map((like) => like.recipe)
    .filter((recipeId) => !recipeIds.some((id) => id.equals(recipeId)));

  const result = await User.deleteOne({ _id: userId });
  if (result.deletedCount === 0) return false;

  await Promise.all([
    Recipe.deleteMany({ author: userId }),
    Nutrition.deleteMany({ recipe: { $in: recipeIds } }),
    Like.deleteMany({ $or: [{ user: userId }, { recipe: { $in: recipeIds } }] }),
    SavedRecipe.deleteMany({ $or: [{ user: userId }, { recipe: { $in: recipeIds } }] }),
    Report.deleteMany({ $or: [{ user: userId }, { recipe: { $in: recipeIds } }] }),
  ]);

  await Promise.all(
    affectedLikeCounts.map(async (recipeId) => {
      const likeCount = await Like.countDocuments({ recipe: recipeId });
      await Recipe.updateOne({ _id: recipeId }, { $set: { likeCount } });
    }),
  );
  return true;
}
