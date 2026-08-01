import mongoose from "mongoose";

import { env } from "./env.js";

mongoose.set("strictQuery", true);

let connectionPromise: Promise<typeof mongoose> | undefined;

export function connectDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);

  connectionPromise ??= mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 10_000,
  });

  return connectionPromise.catch((error: unknown) => {
    connectionPromise = undefined;
    throw error;
  });
}

export async function disconnectDatabase(): Promise<void> {
  connectionPromise = undefined;
  await mongoose.disconnect();
}

export function databaseStatus(): string {
  return ["disconnected", "connected", "connecting", "disconnecting"][
    mongoose.connection.readyState
  ] ?? "unknown";
}
