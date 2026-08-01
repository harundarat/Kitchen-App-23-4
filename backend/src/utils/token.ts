import jwt from "jsonwebtoken";
import { z } from "zod";

import { env } from "../config/env.js";
import type { AuthUser } from "../types/express.js";

const tokenSchema = z.object({
  sub: z.string().min(1),
  username: z.string().min(1),
  role: z.enum(["user", "admin"]),
});

export function createToken(user: AuthUser): string {
  return jwt.sign(
    { username: user.username, role: user.role },
    env.JWT_SECRET,
    { subject: user.id, expiresIn: env.JWT_EXPIRES_IN_SECONDS },
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const result = tokenSchema.safeParse(jwt.verify(token, env.JWT_SECRET));
    if (!result.success) return null;
    return {
      id: result.data.sub,
      username: result.data.username,
      role: result.data.role,
    };
  } catch {
    return null;
  }
}
