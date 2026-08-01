import { model, Schema } from "mongoose";

export interface ICategory {
  title: string;
  image: string;
}

export interface IAddInfo {
  ingredients: string[];
  categories: ICategory[];
}

const categorySchema = new Schema<ICategory>(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const addInfoSchema = new Schema<IAddInfo>(
  {
    ingredients: { type: [String], default: [] },
    categories: { type: [categorySchema], default: [] },
  },
  { versionKey: false },
);

export const AddInfo = model<IAddInfo>("AddInfo", addInfoSchema);
