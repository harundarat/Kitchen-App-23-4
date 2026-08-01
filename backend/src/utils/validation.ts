import { isValidObjectId } from "mongoose";
import type { Request } from "express";
import type { z } from "zod";

import { ApiError } from "./apiError.js";

export function parseInput<T extends z.ZodType>(schema: T, value: unknown): z.output<T> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ApiError(400, "Invalid request", "VALIDATION_ERROR", result.error.flatten());
  }
  return result.data;
}

export function assertObjectId(value: string, label = "id"): void {
  if (!isValidObjectId(value)) {
    throw new ApiError(400, `Invalid ${label}`, "INVALID_ID");
  }
}

export function routeParam(request: Request, name: string): string {
  const value = request.params[name];
  if (typeof value !== "string" || !value) {
    throw new ApiError(400, `Missing route parameter: ${name}`, "MISSING_ROUTE_PARAMETER");
  }
  return value;
}

export function stringArray(value: unknown): unknown {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed: unknown = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [value];
  } catch {
    return [value];
  }
}

export function optionalJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}
