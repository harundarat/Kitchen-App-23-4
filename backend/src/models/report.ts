import { model, Schema, Types } from "mongoose";

export interface IReport {
  recipe: Types.ObjectId;
  user: Types.ObjectId;
  reason: string;
  description: string;
  status: "open" | "resolved" | "dismissed";
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    recipe: { type: Schema.Types.ObjectId, ref: "Recipe", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reason: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["open", "resolved", "dismissed"], default: "open" },
  },
  { timestamps: true, versionKey: false },
);

reportSchema.index({ recipe: 1, user: 1, status: 1 }, { unique: true });

export const Report = model<IReport>("Report", reportSchema);
