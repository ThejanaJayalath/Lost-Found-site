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
                        blocked: user.blocked || false,
                    },
                    posts: posts.map(p => ({
                        id: p._id,
                        title: p.title,
                        description: p.description,
                        status: p.status,
                        date: new Date(p.date).toLocaleDateString(),
                        time: p.time,
                        images: p.images,
                        hidden: p.hidden || false,
                        facebookStatus: p.facebookStatus,
                        facebookPostId: p.facebookPostId
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

// PUT /users/:id/block - Block/Unblock User
adminRouter.put("/users/:id/block", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.blocked = !user.blocked;
        await user.save();

        res.json({ message: `User ${user.blocked ? 'blocked' : 'unblocked'} successfully`, blocked: user.blocked });
    } catch (error) {
        console.error("Error blocking/unblocking user:", error);
        res.status(500).json({ message: "Failed to update user status" });
    }
});

// DELETE /users/:id - Delete User and their posts
adminRouter.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Delete user's posts first
        await Post.deleteMany({ userId: id });

        // Delete user
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User and their posts deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Failed to delete user" });
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

// POST /posts/:id/approve-facebook - Manually approve/trigger Facebook Post
import { postToFacebook } from "../utils/facebookService";

adminRouter.post("/posts/:id/approve-facebook", async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Optional: you can check if already posted.
        // if (post.facebookStatus === "POSTED") {
        //     return res.status(400).json({ message: "Already posted to Facebook" });
        // }

        const fbPostId = await postToFacebook(post);

        post.facebookStatus = "POSTED";
        post.facebookPostId = fbPostId;
        await post.save();

        res.json({ message: "Post published to Facebook", id: fbPostId });

    } catch (error: any) {
        console.error("Error posting to Facebook:", error);

        // Update status to FAILED
        const { id } = req.params;
        await Post.findByIdAndUpdate(id, { facebookStatus: "FAILED" });

        res.status(500).json({ message: error.message || "Failed to post to Facebook" });
    }
});
