import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const optionalString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

const booleanString = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  return value;
}, z.boolean());

const nodeEnv = process.env.NODE_ENV ?? "development";
const developmentSecret = "development-only-secret-change-me-123456789";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65_535).default(3000),
  MONGO_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/kitchencraft"),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(604_800),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:5173,http://localhost:3000")
    .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean)),
  COOKIE_SECURE: booleanString.default(false),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  TRUST_PROXY: booleanString.default(false),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().positive().max(25).default(5),
  FB_API_KEY: optionalString,
  FB_AUTH_DOMAIN: optionalString,
  FB_PROJECT_ID: optionalString,
  FB_STORAGE_BUCKET: optionalString,
  FB_MESSAGING_SENDER_ID: optionalString,
  FB_APP_ID: optionalString,
  ADMIN_USERNAME: optionalString,
  ADMIN_FULL_NAME: optionalString,
  ADMIN_EMAIL: optionalString,
  ADMIN_PASSWORD: optionalString,
});

const result = envSchema.safeParse({
  ...process.env,
  JWT_SECRET:
    process.env.JWT_SECRET || (nodeEnv === "production" ? undefined : developmentSecret),
});

if (!result.success) {
  const details = result.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

if (result.data.COOKIE_SAME_SITE === "none" && !result.data.COOKIE_SECURE) {
  throw new Error("COOKIE_SECURE must be true when COOKIE_SAME_SITE is none");
}

export const env = result.data;
