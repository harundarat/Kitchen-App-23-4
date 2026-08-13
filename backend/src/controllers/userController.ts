import type { RequestHandler } from "express";
import { z } from "zod";

import { Like } from "../models/like.js";
import { Recipe } from "../models/recipe.js";
import { SavedRecipe } from "../models/savedRecipe.js";
import { User } from "../models/user.js";
import { deleteUserWithRelations } from "../services/cascadeDelete.js";
import { uploadImage } from "../services/storage.js";
import { ApiError } from "../utils/apiError.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import {
  emailSchema,
  fullNameSchema,
  usernameSchema,
} from "../utils/userValidation.js";
import { parseInput, routeParam, stringArray } from "../utils/validation.js";

const registerSchema = z.object({
  username: usernameSchema,
  fullName: fullNameSchema,
  email: emailSchema,
  password: z.string().min(8).max(72),
  preferences: z.preprocess(stringArray, z.array(z.string().trim().min(1)).max(30)).default([]),
}).strict();

const editSchema = z.object({
  username: usernameSchema.optional(),
  fullName: fullNameSchema.optional(),
  email: emailSchema.optional(),
  website: z.union([z.literal(""), z.url()]).optional(),
  bio: z.string().trim().max(500).optional(),
  preferences: z.preprocess(stringArray, z.array(z.string().trim().min(1)).max(30)).optional(),
}).strict();

const deleteSchema = z.object({ password: z.string().min(1) }).strict();

export const registerUser: RequestHandler = async (request, response) => {
  const data = parseInput(registerSchema, request.body);
  const existing = await User.findOne({
    $or: [{ username: data.username }, { email: data.email }],
  }).select("username email");

  if (existing) {
    const field = existing.username === data.username ? "username" : "email";
    throw new ApiError(409, `${field} already exists`, "DUPLICATE_RECORD");
  }

  const user = await User.create({ ...data, password: await hashPassword(data.password) });
  response.status(201).json({
    message: "User created successfully",
    user: { id: user._id, username: user.username, fullName: user.fullName, email: user.email },
  });
};

export const getUser: RequestHandler = async (request, response) => {
  const normalizedUsername = routeParam(request, "username").toLowerCase();
  const user = await User.findOne({ username: normalizedUsername });
  if (!user) throw new ApiError(404, "User not found", "NOT_FOUND");

  const recipes = await Recipe.find({ author: user._id })
    .select("title image totalTime likeCount categories createdAt")
    .sort({ createdAt: -1 });
  response.status(200).json({ user, recipes });
};

async function getRelatedRecipes(userId: string, relation: "saved" | "liked") {
  const relationModel = relation === "saved" ? SavedRecipe : Like;
  const records = await relationModel.find({ user: userId }).select("recipe createdAt").sort({ createdAt: -1 });
  const order = records.map((record) => record.recipe.toString());
  const recipes = await Recipe.find({ _id: { $in: order } })
    .select("title image totalTime likeCount categories createdAt author")
    .populate({ path: "author", select: "fullName image username" });
  const byId = new Map(recipes.map((recipe) => [recipe._id.toString(), recipe]));
  return order.flatMap((id) => {
    const recipe = byId.get(id);
    return recipe ? [recipe] : [];
  });
}

export const getUserSavedRecipes: RequestHandler = async (request, response) => {
  const recipes = await getRelatedRecipes(request.user!.id, "saved");
  response.status(200).json({ total: recipes.length, recipes });
};

export const getUserLikedRecipes: RequestHandler = async (request, response) => {
  const recipes = await getRelatedRecipes(request.user!.id, "liked");
  response.status(200).json({ total: recipes.length, recipes });
};

export const editUser: RequestHandler = async (request, response) => {
  const data = parseInput(editSchema, request.body);
  if (Object.keys(data).length === 0 && !request.file) {
    throw new ApiError(400, "Please provide data to update", "EMPTY_UPDATE");
  }

  const user = await User.findOne({ username: routeParam(request, "username").toLowerCase() });
  if (!user) throw new ApiError(404, "User not found", "NOT_FOUND");

  if (request.file) {
    user.image = await uploadImage(
      `images/users/${user._id}.image`,
      request.file.buffer,
      request.file.mimetype,
    );
  }
  if (data.username !== undefined) user.username = data.username;
  if (data.fullName !== undefined) user.fullName = data.fullName;
  if (data.email !== undefined) user.email = data.email;
  if (data.website !== undefined) user.website = data.website;
  if (data.bio !== undefined) user.bio = data.bio;
  if (data.preferences !== undefined) user.preferences = data.preferences;
  await user.save();

  response.status(200).json({ message: "User profile updated successfully", user });
};

export const deleteUser: RequestHandler = async (request, response) => {
  const { password } = parseInput(deleteSchema, request.body);
  const user = await User.findOne({ username: routeParam(request, "username").toLowerCase() }).select("+password");
  if (!user) throw new ApiError(404, "User not found", "NOT_FOUND");
  if (!(await comparePassword(password, user.password))) {
    throw new ApiError(401, "Incorrect password", "INVALID_CREDENTIALS");
  }

  await deleteUserWithRelations(user._id);
  response.status(200).json({ message: "User and associated data deleted" });
};
