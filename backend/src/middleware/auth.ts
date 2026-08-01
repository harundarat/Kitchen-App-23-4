import type { NextFunction, Request, Response } from "express";

import { Admin } from "../models/admin.js";
import { Recipe } from "../models/recipe.js";
import { User } from "../models/user.js";
import { ApiError } from "../utils/apiError.js";
import { assertObjectId, routeParam } from "../utils/validation.js";
import { verifyToken } from "../utils/token.js";

function extractToken(request: Request): string | undefined {
  const authorization = request.get("authorization");
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7).trim();
  return typeof request.cookies?.token === "string" ? request.cookies.token : undefined;
}

export function authenticate(request: Request, _response: Response, next: NextFunction): void {
  const token = extractToken(request);
  const user = token ? verifyToken(token) : null;
  if (!user) throw new ApiError(401, "Authentication required", "UNAUTHENTICATED");
  request.user = user;
  next();
}

export function authCheck(request: Request, _response: Response, next: NextFunction): void {
  const token = extractToken(request);
  request.user = token ? verifyToken(token) : null;
  next();
}

export async function authorizeUsername(
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  const user = await User.exists({ username: routeParam(request, "username").toLowerCase() });
  if (!user) throw new ApiError(404, "User not found", "NOT_FOUND");
  if (user._id.toString() !== request.user?.id) {
    throw new ApiError(403, "You are not authorized to perform this action", "FORBIDDEN");
  }
  next();
}

export async function verifyRecipeAuthor(
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  const id = routeParam(request, "id");
  assertObjectId(id, "recipe id");
  const recipe = await Recipe.findById(id);
  if (!recipe) throw new ApiError(404, "Recipe not found", "NOT_FOUND");
  if (recipe.author.toString() !== request.user?.id) {
    throw new ApiError(403, "You are not authorized to perform this action", "FORBIDDEN");
  }
  request.recipe = recipe;
  next();
}

export async function onlyAdmin(
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  if (request.user?.role !== "admin") {
    throw new ApiError(403, "Administrator access required", "FORBIDDEN");
  }

  const adminExists = await Admin.exists({ _id: request.user.id });
  if (!adminExists) throw new ApiError(403, "Administrator access required", "FORBIDDEN");
  next();
}
