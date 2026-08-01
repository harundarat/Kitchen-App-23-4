import { Router } from "express";

import {
  deleteRecipeAdmin,
  deleteUser,
  getAdmin,
  getAllRecipesAdmin,
  getRecipeById,
  getRecipeByIdOrTitle,
  getReportedRecipes,
  getUserById,
  getUserByUsername,
  getUsers,
  loginAdmin,
  logoutAdmin,
} from "../controllers/adminController.js";
import { authenticate, onlyAdmin } from "../middleware/auth.js";

export const adminRouter = Router();

adminRouter.post("/login", loginAdmin);
adminRouter.post("/logout", logoutAdmin);
adminRouter.use(authenticate, onlyAdmin);
adminRouter.get("/reports", getReportedRecipes);
adminRouter.get("/users", getUsers);
adminRouter.get("/user/username/:username", getUserByUsername);
adminRouter.get("/user/:id", getUserById);
adminRouter.delete("/user/:id", deleteUser);
adminRouter.get("/recipes", getAllRecipesAdmin);
adminRouter.get("/recipe", getRecipeByIdOrTitle);
adminRouter.get("/recipe/:id", getRecipeById);
adminRouter.delete("/recipe/:id", deleteRecipeAdmin);
adminRouter.get("/:username", getAdmin);
