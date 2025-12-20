import { Router } from "express";
import { User } from "../models/User";
import { Post } from "../models/Post";

export const adminRouter = Router();

// GET /stats - Dashboard Statistics
adminRouter.get("/stats", async (req, res) => {
    try {
        const [lostItems, foundItems, resolvedItems, totalUsers] = await Promise.all([
            Post.countDocuments({ status: "LOST" }),
            Post.countDocuments({ status: "FOUND" }),
            Post.countDocuments({ status: "RESOLVED" }),
            User.countDocuments({}),
        ]);

        res.json({
            lostItems,
            foundItems,
            resolvedItems,
            totalUsers,
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
});

// GET /users - List All Users
adminRouter.get("/users", async (req, res) => {
    try {
        const users = await User.find({})
            .select("-passwordHash") // Exclude password hash
            .sort({ createdAt: -1 }); // Newest first

        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});
