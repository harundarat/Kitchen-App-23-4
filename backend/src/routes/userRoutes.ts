import { Router } from "express";

import {
  deleteUser,
  editUser,
  getUser,
  getUserLikedRecipes,
  getUserSavedRecipes,
  registerUser,
} from "../controllers/userController.js";
import { authenticate, authorizeUsername } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

export const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.get("/:username/saved-recipes", authenticate, authorizeUsername, getUserSavedRecipes);
userRouter.get("/:username/liked-recipes", authenticate, authorizeUsername, getUserLikedRecipes);
userRouter.get("/:username", getUser);
userRouter.put("/:username", authenticate, authorizeUsername, upload.single("image"), editUser);
userRouter.delete("/:username", authenticate, authorizeUsername, deleteUser);
