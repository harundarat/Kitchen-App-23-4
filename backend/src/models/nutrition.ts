import { model, Schema, Types, type HydratedDocument } from "mongoose";

export interface INutrient {
  amount: number;
  unit: "g" | "mg";
  dailyValuePercent?: number;
}

export interface INutrition {
  recipe: Types.ObjectId;
  calories?: number;
  totalFat?: INutrient;
  saturatedFat?: INutrient;
  protein?: INutrient;
  carbohydrates?: INutrient;
  sugar?: INutrient;
  sodium?: INutrient;
  source: "manual" | "ai";
  createdAt: Date;
  updatedAt: Date;
}

export type NutritionDocument = HydratedDocument<INutrition>;

const nutrientSchema = new Schema<INutrient>(
  {
    amount: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, enum: ["g", "mg"] },
    dailyValuePercent: { type: Number, min: 0 },
  },
  { _id: false },
);

const nutritionSchema = new Schema<INutrition>(
  {
    recipe: { type: Schema.Types.ObjectId, ref: "Recipe", required: true, unique: true },
    calories: { type: Number, min: 0 },
    totalFat: nutrientSchema,
    saturatedFat: nutrientSchema,
    protein: nutrientSchema,
    carbohydrates: nutrientSchema,
    sugar: nutrientSchema,
    sodium: nutrientSchema,
    source: { type: String, enum: ["manual", "ai"], default: "manual" },
  },
  { timestamps: true, versionKey: false },
);

export const Nutrition = model<INutrition>("Nutrition", nutritionSchema);
