import mongoose from "mongoose";
import { env } from "./env";

let isConnected = false;

export async function connectToDatabase(): Promise<void> {
  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // If connection is in progress, wait for it
  if (mongoose.connection.readyState === 2) {
    return new Promise((resolve, reject) => {
      mongoose.connection.once("connected", resolve);
      mongoose.connection.once("error", reject);
    });
  }

  try {
    // Set connection options for serverless environments
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    await mongoose.connect(env.mongoUri, options);
    isConnected = true;
    // eslint-disable-next-line no-console
    console.log("Connected to MongoDB");

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      // eslint-disable-next-line no-console
      console.error("MongoDB connection error:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      // eslint-disable-next-line no-console
      console.log("MongoDB disconnected");
      isConnected = false;
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to connect to MongoDB:", err);
    isConnected = false;
    throw err;
  }
}


