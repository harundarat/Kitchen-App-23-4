import { Router } from "express";

import { loginUser, logoutUser } from "../controllers/authController.js";
import { authenticate, authorizeUsername } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);
authRouter.get("/", authenticate, (request, response) => {
  response.status(200).json({ user: request.user });
});
authRouter.get("/authorized/:username", authenticate, authorizeUsername, (request, response) => {
  response.status(200).json({ user: request.user });
});
