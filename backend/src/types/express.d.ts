import type { RecipeDocument } from "../models/recipe.js";

export interface AuthUser {
  id: string;
  username: string;
  role: "user" | "admin";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser | null;
      recipe?: RecipeDocument;
    }
  }
}

export {};
