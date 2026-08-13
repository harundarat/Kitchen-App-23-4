import { Router } from "express";

import {
  deleteUser,
  editUser,
  getUser,
  getUserLikedRecipes,
  getUserSavedRecipes,
  registerUser,
} from "../controllers/userController.js";
import { authenticate, authorizeUsername, onlyUser } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

export const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.get("/:username/saved-recipes", authenticate, onlyUser, authorizeUsername, getUserSavedRecipes);
userRouter.get("/:username/liked-recipes", authenticate, onlyUser, authorizeUsername, getUserLikedRecipes);
userRouter.get("/:username", getUser);
userRouter.put("/:username", authenticate, onlyUser, authorizeUsername, upload.single("image"), editUser);
userRouter.delete("/:username", authenticate, onlyUser, authorizeUsername, deleteUser);
