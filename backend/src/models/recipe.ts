import { model, Schema, Types, type HydratedDocument } from "mongoose";

export interface IRecipeStep {
  description: string;
  image: string;
}

export interface IRecipe {
  author: Types.ObjectId;
  title: string;
  image: string;
  description: string;
  totalTime: string;
  video: string;
  ingredients: string[];
  steps: IRecipeStep[];
  categories: string[];
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type RecipeDocument = HydratedDocument<IRecipe>;

const recipeStepSchema = new Schema<IRecipeStep>(
  {
    description: { type: String, required: true, trim: true },
    image: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const recipeSchema = new Schema<IRecipe>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    image: { type: String, trim: true, default: "" },
    description: { type: String, required: true, trim: true },
    totalTime: { type: String, required: true, trim: true },
    video: { type: String, trim: true, default: "" },
    ingredients: { type: [String], required: true },
    steps: { type: [recipeStepSchema], required: true },
    categories: { type: [String], default: [], index: true },
    likeCount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

recipeSchema.index(
  { title: "text", ingredients: "text" },
  { weights: { title: 5, ingredients: 1 }, name: "recipe_text_search" },
);

export const Recipe = model<IRecipe>("Recipe", recipeSchema);
