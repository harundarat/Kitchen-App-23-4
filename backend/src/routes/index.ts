import { Router } from "express";

import { getCategories, getIngredients } from "../controllers/addInfoController.js";
import { getForYouRecipes } from "../controllers/forYouController.js";
import { searchNutrition } from "../controllers/nutritionController.js";
import { authCheck } from "../middleware/auth.js";
import { adminRouter } from "./adminRoutes.js";
import { authRouter } from "./authRoutes.js";
import { recipeRouter } from "./recipeRoutes.js";
import { userRouter } from "./userRoutes.js";

export const apiRouter = Router();

apiRouter.get("/", (_request, response) => {
  response.status(200).json({ name: "KitchenCraft API", version: "2.0.0" });
});
apiRouter.get("/ingredients", getIngredients);
apiRouter.get("/categories", getCategories);
apiRouter.get("/category", getCategories);
apiRouter.get("/nutrition/search", searchNutrition);
apiRouter.get("/searchgizi", searchNutrition);
apiRouter.get("/for-you", authCheck, getForYouRecipes);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/recipes", recipeRouter);
apiRouter.use("/admin", adminRouter);
