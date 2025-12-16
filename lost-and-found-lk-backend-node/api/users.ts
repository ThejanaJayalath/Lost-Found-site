import { applyCors } from "./_cors";
import { connectToDatabase } from "../src/config/db";
import { User } from "../src/models/User";

export default async function handler(req: any, res: any) {
  try {
    applyCors(req, res);

    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }

    // Connect to database with error handling
    try {
      await connectToDatabase();
    } catch (dbError) {
      // eslint-disable-next-line no-console
      console.error("Database connection error:", dbError);
      return res.status(500).json({ 
        message: "Database connection failed",
        error: process.env.NODE_ENV === "development" ? String(dbError) : undefined
      });
    }

    if (req.method === "POST") {
      // Parse request body if it's a string
      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch (parseError) {
          // eslint-disable-next-line no-console
          console.error("JSON parse error:", parseError);
          return res.status(400).json({ message: "Invalid JSON in request body" });
        }
      }

      const { email, name, phoneNumber } = body as {
        email?: string;
        name?: string;
        phoneNumber?: string | null;
      };

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      try {
        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            email,
            passwordHash: "firebase",
            fullName: name ?? email,
            phoneNumber: phoneNumber ?? undefined,
          } as any);
        } else if (phoneNumber != null) {
          user.phoneNumber = phoneNumber;
          if (name) {
            user.fullName = name;
          }
        }

        const saved = await user.save();

        return res.status(200).json({
          id: saved._id.toString(),
          email: saved.email,
          name: saved.fullName,
          phoneNumber: saved.phoneNumber ?? null,
        });
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error("Error syncing user:", err);
        return res.status(500).json({ 
          message: "Failed to sync user",
          error: process.env.NODE_ENV === "development" ? err.message : undefined
        });
      }
    }

    res.setHeader("Allow", "POST,OPTIONS");
    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Unexpected error in users handler:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}


