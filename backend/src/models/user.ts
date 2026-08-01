import { model, Schema, type HydratedDocument } from "mongoose";

export interface IUser {
  image: string;
  username: string;
  fullName: string;
  email: string;
  website: string;
  bio: string;
  password: string;
  preferences: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    image: { type: String, trim: true, default: "" },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    website: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
    password: { type: String, required: true, select: false },
    preferences: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false },
);

export const User = model<IUser>("User", userSchema);
