import { model, Schema, type HydratedDocument } from "mongoose";

export interface IAdmin {
  username: string;
  fullName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AdminDocument = HydratedDocument<IAdmin>;

const adminSchema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true, versionKey: false },
);

export const Admin = model<IAdmin>("Admin", adminSchema);
