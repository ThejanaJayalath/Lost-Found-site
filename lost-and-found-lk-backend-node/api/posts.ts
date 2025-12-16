import { applyCors } from "./_cors";
import { connectToDatabase } from "../src/config/db";
import { Post } from "../src/models/Post";
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
    } catch (dbError: any) {
      console.error("Database connection error:", dbError);
      return res.status(500).json({
        message: "Database connection failed",
        error: process.env.NODE_ENV === "development" ? dbError.message : undefined,
      });
    }

    if (req.method === "GET") {
      const { status } = req.query as { status?: string };

      const query: any = {};

      if (status === "LOST") {
        query.isLost = true;
      } else if (status === "FOUND") {
        query.isLost = false;
      }

      query.status = "ACTIVE";

      try {
        const posts = await Post.find(query).sort({ createdAt: -1 }).lean();

        const mapped = posts.map((p: any) => ({
          id: p._id.toString(),
          title: p.title,
          description: p.description,
          location: p.location,
          date: p.date,
          images: [],
          type: p.itemType,
          status: p.status,
          color: "",
          imei: p.imei,
          serialNumber: p.serialNumber,
          idNumber: p.idNumber,
          contactPhone: p.phoneNumber,
          time: p.time,
        }));

        return res.status(200).json(mapped);
      } catch (err: any) {
        console.error("Error fetching posts", err);
        return res.status(500).json({
          message: "Failed to fetch posts",
          error: process.env.NODE_ENV === "development" ? err.message : undefined,
        });
      }
    }

    if (req.method === "POST") {
      const {
        title,
        description,
        location,
        date,
        type,
        status,
        color,
        imei,
        serialNumber,
        idNumber,
        contactPhone,
        time,
        isLost,
        userId,
      } = req.body;

      console.log("Creating post with data:", { title, type, status, userId, isLost });

      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      try {
        const user = await User.findById(userId);
        if (!user) {
          console.error("User not found with ID:", userId);
          return res.status(404).json({ message: "User not found" });
        }

        const post = new Post({
          title,
          description,
          location,
          date,
          itemType: type,
          isLost,
          user: user._id,
          status: status ?? "ACTIVE",
          imei,
          serialNumber,
          idNumber,
          phoneNumber: contactPhone,
          time,
        } as any);

        const saved = await post.save();
        console.log("Post created successfully:", saved._id.toString());

        return res.status(201).json({ id: saved._id.toString() });
      } catch (err: any) {
        console.error("Error creating post:", err);
        console.error("Error details:", {
          message: err.message,
          stack: err.stack,
          name: err.name,
        });
        return res.status(500).json({
          message: "Failed to create post",
          error: process.env.NODE_ENV === "development" ? err.message : undefined,
        });
      }
    }

    res.setHeader("Allow", "GET,POST,OPTIONS");
    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error: any) {
    console.error("Unexpected error in posts handler:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}


