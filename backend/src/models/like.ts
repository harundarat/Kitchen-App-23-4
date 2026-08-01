import { model, Schema, Types } from "mongoose";

export interface ILike {
  recipe: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    recipe: { type: Schema.Types.ObjectId, ref: "Recipe", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

likeSchema.index({ recipe: 1, user: 1 }, { unique: true });

export const Like = model<ILike>("Like", likeSchema);
