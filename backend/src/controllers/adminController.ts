import type { CookieOptions, RequestHandler } from "express";
import { z } from "zod";

import { env } from "../config/env.js";
import { Admin } from "../models/admin.js";
import { Nutrition } from "../models/nutrition.js";
import { Recipe } from "../models/recipe.js";
import { Report } from "../models/report.js";
import { User } from "../models/user.js";
import { deleteRecipeWithRelations, deleteUserWithRelations } from "../services/cascadeDelete.js";
import { ApiError } from "../utils/apiError.js";
import { comparePassword } from "../utils/password.js";
import { createToken } from "../utils/token.js";
import {
  emailSchema,
  fullNameSchema,
  usernameSchema,
} from "../utils/userValidation.js";
import { assertObjectId, parseInput, routeParam } from "../utils/validation.js";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
}).strict();

const recipeLookupSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).optional(),
}).refine((value) => Boolean(value.id || value.title), { message: "id or title is required" });

const adminUserUpdateSchema = z.object({
  username: usernameSchema.optional(),
  fullName: fullNameSchema.optional(),
  email: emailSchema.optional(),
}).strict();

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE,
  maxAge: env.JWT_EXPIRES_IN_SECONDS * 1000,
  path: "/",
};

export const loginAdmin: RequestHandler = async (request, response) => {
  const data = parseInput(loginSchema, request.body);
  const admin = await Admin.findOne({ email: data.email }).select("+password");
  if (!admin || !(await comparePassword(data.password, admin.password))) {
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const token = createToken({ id: admin._id.toString(), username: admin.username, role: "admin" });
  response.cookie("token", token, cookieOptions);
  response.status(200).json({ id: admin._id, username: admin.username, token });
};

export const logoutAdmin: RequestHandler = (_request, response) => {
  response.clearCookie("token", {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: "/",
  });
  response.status(200).json({ message: "Logged out successfully" });
};

export const getUserById: RequestHandler = async (request, response) => {
  const id = routeParam(request, "id");
  assertObjectId(id, "user id");
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found", "NOT_FOUND");
  response.status(200).json(user);
};

export const getUserByUsername: RequestHandler = async (request, response) => {
  const user = await User.findOne({ username: routeParam(request, "username").toLowerCase() });
  if (!user) throw new ApiError(404, "User not found", "NOT_FOUND");
  response.status(200).json(user);
};

export const deleteUser: RequestHandler = async (request, response) => {
  const id = routeParam(request, "id");
  assertObjectId(id, "user id");
  if (!(await deleteUserWithRelations(id))) {
    throw new ApiError(404, "User not found", "NOT_FOUND");
  }
  response.status(200).json({ message: "User and associated data deleted" });
};

export const updateUser: RequestHandler = async (request, response) => {
  const id = routeParam(request, "id");
  assertObjectId(id, "user id");
  const data = parseInput(adminUserUpdateSchema, request.body);
  if (Object.keys(data).length === 0) {
    throw new ApiError(400, "Please provide data to update", "EMPTY_UPDATE");
  }

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found", "NOT_FOUND");
  if (data.username !== undefined) user.username = data.username;
  if (data.fullName !== undefined) user.fullName = data.fullName;
  if (data.email !== undefined) user.email = data.email;
  await user.save();

  const { password: _password, ...updatedUser } = user.toObject();
  response.status(200).json({ message: "User updated successfully", user: updatedUser });
};

export const getRecipeByIdOrTitle: RequestHandler = async (request, response) => {
  const query = parseInput(recipeLookupSchema, request.query);
  if (query.id) assertObjectId(query.id, "recipe id");
  let recipe = null;
  if (query.id) recipe = await Recipe.findById(query.id);
  else if (query.title) recipe = await Recipe.findOne({ title: query.title });
  if (!recipe) throw new ApiError(404, "Recipe not found", "NOT_FOUND");
  response.status(200).json({ recipe });
};

export const getAllRecipesAdmin: RequestHandler = async (_request, response) => {
  const recipes = await Recipe.find().sort({ createdAt: -1 });
  response.status(200).json(recipes);
};

export const getRecipeById: RequestHandler = async (request, response) => {
  const id = routeParam(request, "id");
  assertObjectId(id, "recipe id");
  const [recipe, nutrition] = await Promise.all([
    Recipe.findById(id),
    Nutrition.findOne({ recipe: id }),
  ]);
  if (!recipe) throw new ApiError(404, "Recipe not found", "NOT_FOUND");
  response.status(200).json({ recipe, nutrition });
};

export const deleteRecipeAdmin: RequestHandler = async (request, response) => {
  const id = routeParam(request, "id");
  assertObjectId(id, "recipe id");
  if (!(await deleteRecipeWithRelations(id))) {
    throw new ApiError(404, "Recipe not found", "NOT_FOUND");
  }
  response.status(200).json({ message: "Recipe deleted successfully" });
};

export const getAdmin: RequestHandler = async (request, response) => {
  const admin = await Admin.findOne({ username: routeParam(request, "username").toLowerCase() });
  if (!admin) throw new ApiError(404, "Administrator not found", "NOT_FOUND");
  response.status(200).json(admin);
};

export const getUsers: RequestHandler = async (_request, response) => {
  const users = await User.find().sort({ createdAt: -1 });
  response.status(200).json(users);
};

export const getReportedRecipes: RequestHandler = async (_request, response) => {
  const reports = await Report.find()
    .populate({ path: "recipe", select: "title image author" })
    .populate({ path: "user", select: "username fullName" })
    .sort({ createdAt: -1 });
  response.status(200).json({ reports });
};
