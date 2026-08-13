import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9_]+$/);

export const fullNameSchema = z.string().trim().min(1).max(100);

export const emailSchema = z.string().trim().toLowerCase().email();
