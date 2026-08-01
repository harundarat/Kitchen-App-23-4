import multer from "multer";
import { Error as MongooseError } from "mongoose";
import type { ErrorRequestHandler, RequestHandler } from "express";

import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

interface MongoServerError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

export const notFound: RequestHandler = (request, response) => {
  response.status(404).json({
    error: "Route not found",
    method: request.method,
    path: request.originalUrl,
  });
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof ApiError) {
    response.status(error.status).json({
      error: error.message,
      ...(error.code ? { code: error.code } : {}),
      ...(error.details ? { details: error.details } : {}),
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    response.status(400).json({ error: error.message, code: error.code });
    return;
  }

  if (error instanceof MongooseError.CastError) {
    response.status(400).json({ error: `Invalid ${error.path}`, code: "INVALID_ID" });
    return;
  }

  if (error instanceof MongooseError.ValidationError) {
    response.status(400).json({ error: error.message, code: "DATABASE_VALIDATION_ERROR" });
    return;
  }

  const mongoError = error as MongoServerError;
  if (mongoError?.code === 11000) {
    response.status(409).json({
      error: "A record with the same unique value already exists",
      code: "DUPLICATE_RECORD",
      fields: mongoError.keyValue ? Object.keys(mongoError.keyValue) : [],
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    error: "Internal server error",
    ...(env.NODE_ENV === "development" && error instanceof Error
      ? { message: error.message }
      : {}),
  });
};
