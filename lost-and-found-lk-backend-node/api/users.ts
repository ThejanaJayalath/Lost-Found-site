import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "./_cors";
import { connectToDatabase } from "../src/config/db";
import { User } from "../src/models/User";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Apply CORS headers first
  applyCors(req, res);

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST,OPTIONS");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Connect to database
    await connectToDatabase();
  } catch (dbError: any) {
    console.error("Database connection error:", dbError);
    return res.status(500).json({
      message: "Database connection failed",
      error: process.env.NODE_ENV === "development" ? dbError.message : undefined,
    });
  }

  try {
    // Get request body
    const body = req.body || {};
    const { email, name, phoneNumber } = body as {
      email?: string;
      name?: string;
      phoneNumber?: string | null;
    };

    // Validate email
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        email,
        passwordHash: "firebase",
        fullName: name || email,
        phoneNumber: phoneNumber || undefined,
      } as any);
    } else {
      // Update existing user
      if (phoneNumber != null) {
        user.phoneNumber = phoneNumber;
      }
      if (name && name.trim()) {
        user.fullName = name;
      }
    }

    // Save user
    const saved = await user.save();

    // Return response
    return res.status(200).json({
      id: saved._id.toString(),
      email: saved.email,
      name: saved.fullName,
      phoneNumber: saved.phoneNumber || null,
    });
  } catch (err: any) {
    console.error("Error syncing user:", err);
    return res.status(500).json({
      message: "Failed to sync user",
      error:
        process.env.NODE_ENV === "development"
          ? err.message || String(err)
          : undefined,
    });
  }
}


