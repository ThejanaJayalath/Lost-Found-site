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

// GET /users - List All Users with Details
adminRouter.get("/users", async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });

        const userDetails = await Promise.all(
            users.map(async (user) => {
                const posts = await Post.find({ userId: user._id.toString() }).sort({ createdAt: -1 });

                // Determine latest activity (either last post or account creation)
                const lastPostDate = posts.length > 0 ? posts[0]?.createdAt : null;
                const latestActivity = lastPostDate
                    ? new Date(lastPostDate).toLocaleDateString()
                    : new Date(user.createdAt || Date.now()).toLocaleDateString();

                return {
                    user: {
                        id: user._id,
                        name: user.fullName,
                        email: user.email,
                        photoUrl: "", // Placeholder as User model doesn't have photo
                        authProvider: "email", // Placeholder
                        blocked: false, // Placeholder as User model doesn't have blocked status yet
                    },
                    posts: posts.map(p => ({
                        id: p._id,
                        title: p.title,
                        description: p.description,
                        status: p.status,
                        date: new Date(p.date).toLocaleDateString(),
                        time: p.time,
                        images: p.images,
                        hidden: p.hidden || false
                    })),
                    postCount: posts.length,
                    latestActivity: latestActivity,
                };
            })
        );

        res.json(userDetails);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

// PUT /posts/:id/hide - Toggle Hide Status
adminRouter.put("/posts/:id/hide", async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post.hidden = !post.hidden;
        await post.save();

        res.json({ message: "Post visibility toggled", hidden: post.hidden });
    } catch (error) {
        console.error("Error toggling post visibility:", error);
        res.status(500).json({ message: "Failed to update post" });
    }
});

// DELETE /posts/:id - Delete Post
adminRouter.delete("/posts/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPost = await Post.findByIdAndDelete(id);

        if (!deletedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Failed to delete post" });
    }
});
