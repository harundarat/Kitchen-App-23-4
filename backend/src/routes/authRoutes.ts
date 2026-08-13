import { Router } from "express";

import { loginUser, logoutUser } from "../controllers/authController.js";
import {
  authenticate,
  authorizeUsername,
  onlyUser,
  requireActivePrincipal,
} from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);
authRouter.get("/", authenticate, requireActivePrincipal, (request, response) => {
  response.status(200).json({ user: request.user });
});
authRouter.get("/authorized/:username", authenticate, onlyUser, authorizeUsername, (request, response) => {
  response.status(200).json({ user: request.user });
});
