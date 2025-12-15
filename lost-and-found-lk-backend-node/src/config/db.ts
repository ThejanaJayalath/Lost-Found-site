import mongoose from "mongoose";
import { env } from "./env";

let isConnected = false;

export async function connectToDatabase(): Promise<void> {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(env.mongoUri);
    isConnected = true;
    // eslint-disable-next-line no-console
    console.log("Connected to MongoDB");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to connect to MongoDB", err);
    throw err;
  }
}


