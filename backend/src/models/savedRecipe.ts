import { model, Schema, Types } from "mongoose";

export interface ISavedRecipe {
  recipe: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
}

const savedRecipeSchema = new Schema<ISavedRecipe>(
  {
    recipe: { type: Schema.Types.ObjectId, ref: "Recipe", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

savedRecipeSchema.index({ recipe: 1, user: 1 }, { unique: true });

export const SavedRecipe = model<ISavedRecipe>("SavedRecipe", savedRecipeSchema);
