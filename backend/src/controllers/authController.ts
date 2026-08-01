import type { CookieOptions, RequestHandler } from "express";
import { z } from "zod";

import { env } from "../config/env.js";
import { User } from "../models/user.js";
import { ApiError } from "../utils/apiError.js";
import { comparePassword } from "../utils/password.js";
import { createToken } from "../utils/token.js";
import { parseInput } from "../utils/validation.js";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
}).strict();

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE,
  maxAge: env.JWT_EXPIRES_IN_SECONDS * 1000,
  path: "/",
};

export const loginUser: RequestHandler = async (request, response) => {
  const data = parseInput(loginSchema, request.body);
  const user = await User.findOne({ email: data.email }).select("+password");

  if (!user || !(await comparePassword(data.password, user.password))) {
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const token = createToken({
    id: user._id.toString(),
    username: user.username,
    role: "user",
  });
  response.cookie("token", token, cookieOptions);
  response.status(200).json({ id: user._id, username: user.username, token });
};

export const logoutUser: RequestHandler = (_request, response) => {
  response.clearCookie("token", {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: "/",
  });
  response.status(200).json({ message: "Logged out successfully" });
};
