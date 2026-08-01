import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { databaseStatus } from "./config/database.js";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";
import { ApiError } from "./utils/apiError.js";

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", env.TRUST_PROXY);
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || env.CORS_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new ApiError(403, "Origin is not allowed by CORS", "CORS_NOT_ALLOWED"));
    },
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok", database: databaseStatus() });
});
app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
