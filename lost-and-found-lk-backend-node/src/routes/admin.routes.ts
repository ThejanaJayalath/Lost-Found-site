import { Router } from "express";
import { User } from "../models/User";
import { Post } from "../models/Post";
import { SupportMessage } from "../models/SupportMessage";
import { Settings } from "../models/Settings";
import { requireAdmin, requireOwner } from "../middleware/auth.middleware";
import { postToFacebook, getFacebookPageAccessToken } from "../utils/facebookService";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../config/env";

export const adminRouter = Router();

// Protect ALL admin routes with requireAdmin middleware
adminRouter.use(requireAdmin);

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
                        facebookPostId: p.facebookPostId,
                        location: p.location,
                        createdAt: p.createdAt
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

        const { caption } = req.body;
        const fbPostId = await postToFacebook(post, caption);

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

// ==================== ADMIN MANAGEMENT ROUTES ====================

// GET /admins - Get all admins and owners
adminRouter.get("/admins", async (req, res) => {
    try {
        const admins = await User.find({
            roles: { $in: ["ADMIN", "OWNER"] }
        })
            .select("-passwordHash")
            .sort({ createdAt: -1 })
            .lean();

        const adminList = admins.map((admin: any) => ({
            id: admin._id.toString(),
            email: admin.email,
            name: admin.fullName,
            roles: admin.roles || [],
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt,
            blocked: admin.blocked || false,
        }));

        res.json(adminList);
    } catch (error) {
        console.error("Error fetching admins:", error);
        res.status(500).json({ message: "Failed to fetch admins" });
    }
});

// POST /admins - Create new admin or promote existing user to admin (Admin or Owner can create)
adminRouter.post("/admins", async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        
        if (existingUser) {
            // User exists - promote to admin if not already admin/owner
            if (existingUser.roles && (existingUser.roles.includes("ADMIN") || existingUser.roles.includes("OWNER"))) {
                return res.status(400).json({ message: "User is already an admin or owner" });
            }

            // Update password and add ADMIN role
            const hashedPassword = await bcrypt.hash(password, 10);
            existingUser.passwordHash = hashedPassword;
            if (!existingUser.roles) {
                existingUser.roles = [];
            }
            if (!existingUser.roles.includes("ADMIN")) {
                existingUser.roles.push("ADMIN");
            }
            if (!existingUser.roles.includes("USER")) {
                existingUser.roles.push("USER");
            }
            if (name) {
                existingUser.fullName = name;
            }
            await existingUser.save();

            return res.status(200).json({
                message: "User promoted to admin successfully",
                admin: {
                    id: existingUser._id.toString(),
                    email: existingUser.email,
                    name: existingUser.fullName,
                    roles: existingUser.roles,
                },
            });
        }

        // User doesn't exist - create new admin user
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new User({
            email: email.toLowerCase().trim(),
            passwordHash: hashedPassword,
            fullName: name || email.split("@")[0],
            roles: ["ADMIN", "USER"],
            blocked: false,
        });

        await newAdmin.save();

        res.status(201).json({
            message: "Admin created successfully",
            admin: {
                id: newAdmin._id.toString(),
                email: newAdmin.email,
                name: newAdmin.fullName,
                roles: newAdmin.roles,
            },
        });
    } catch (error: any) {
        console.error("Error creating/promoting admin:", error);
        res.status(500).json({ message: error.message || "Failed to create admin" });
    }
});

// PUT /admins/:id/email - Change admin email
adminRouter.put("/admins/:id/email", async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        const currentUserId = req.user?.userId;
        const currentUserRoles = req.user?.roles || [];

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Check if user is admin or owner
        if (!user.roles || (!user.roles.includes("ADMIN") && !user.roles.includes("OWNER"))) {
            return res.status(400).json({ message: "User is not an admin" });
        }

        // Security check: Admins cannot modify owner accounts
        // Only owners can modify owner accounts (including their own)
        const isTargetOwner = user.roles.includes("OWNER");
        const isCurrentUserOwner = currentUserRoles.includes("OWNER");

        if (isTargetOwner && !isCurrentUserOwner) {
            return res.status(403).json({ message: "Only owner can modify owner accounts" });
        }

        // Check if email is already taken
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser && existingUser._id.toString() !== id) {
            return res.status(400).json({ message: "Email already in use" });
        }

        user.email = email.toLowerCase().trim();
        await user.save();

        res.json({
            message: "Email updated successfully",
            admin: {
                id: user._id.toString(),
                email: user.email,
                name: user.fullName,
            },
        });
    } catch (error: any) {
        console.error("Error updating admin email:", error);
        res.status(500).json({ message: error.message || "Failed to update email" });
    }
});

// PUT /admins/:id/password - Change admin password
adminRouter.put("/admins/:id/password", async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        const currentUserId = req.user?.userId;
        const currentUserRoles = req.user?.roles || [];

        if (!newPassword) {
            return res.status(400).json({ message: "New password is required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Check if user is admin or owner
        if (!user.roles || (!user.roles.includes("ADMIN") && !user.roles.includes("OWNER"))) {
            return res.status(400).json({ message: "User is not an admin" });
        }

        // Security check: Admins cannot modify owner accounts
        // Only owners can modify owner accounts (including their own)
        const isTargetOwner = user.roles.includes("OWNER");
        const isCurrentUserOwner = currentUserRoles.includes("OWNER");

        if (isTargetOwner && !isCurrentUserOwner) {
            return res.status(403).json({ message: "Only owner can modify owner accounts" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.passwordHash = hashedPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error: any) {
        console.error("Error updating admin password:", error);
        res.status(500).json({ message: error.message || "Failed to update password" });
    }
});

// DELETE /admins/:id - Remove admin (Only Owner can remove admins)
adminRouter.delete("/admins/:id", requireOwner, async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user?.userId;

        // Prevent owner from deleting themselves
        if (currentUserId === id) {
            return res.status(400).json({ message: "Cannot remove your own admin access" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Check if user is admin or owner
        if (!user.roles || (!user.roles.includes("ADMIN") && !user.roles.includes("OWNER"))) {
            return res.status(400).json({ message: "User is not an admin" });
        }

        // Remove ADMIN role (keep USER role if exists)
        user.roles = user.roles.filter((role: string) => role !== "ADMIN" && role !== "OWNER");
        
        // If no roles left, add USER role
        if (user.roles.length === 0) {
            user.roles = ["USER"];
        }

        await user.save();

        res.json({ message: "Admin access removed successfully" });
    } catch (error: any) {
        console.error("Error removing admin:", error);
        res.status(500).json({ message: error.message || "Failed to remove admin" });
    }
});

// GET /support - Get all support messages
adminRouter.get("/support", async (req, res) => {
    try {
        const messages = await SupportMessage.find({})
            .sort({ createdAt: -1 }) // Newest first
            .lean();

        const formattedMessages = messages.map((msg: any) => ({
            id: msg._id.toString(),
            name: msg.name,
            email: msg.email,
            subject: msg.subject,
            message: msg.message,
            status: msg.status,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt,
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error("Error fetching support messages:", error);
        res.status(500).json({ message: "Failed to fetch support messages" });
    }
});

// ==================== FACEBOOK INTEGRATION SETTINGS ====================

// GET /facebook-settings - Get Facebook page integration status (admin view)
adminRouter.get("/facebook-settings", async (req, res) => {
    try {
        const settings = await Settings.findOne({ key: "facebookIntegration" }).lean();

        if (!settings) {
            return res.json({
                configured: false,
                lastUpdatedAt: null,
                // Do not send full token to frontend for security reasons
                tokenPreview: null,
            });
        }

        const value: any = settings.value || {};
        const token: string | undefined = value.pageAccessToken;

        res.json({
            configured: !!token,
            lastUpdatedAt: settings.updatedAt,
            // Send only a small preview so admin can recognize which token is stored
            tokenPreview: token ? `${token.slice(0, 6)}...${token.slice(-4)}` : null,
        });
    } catch (error) {
        console.error("Error fetching Facebook settings:", error);
        res.status(500).json({ message: "Failed to fetch Facebook settings" });
    }
});

// PUT /facebook-settings - Update Facebook page access token
adminRouter.put("/facebook-settings", async (req, res) => {
    try {
        const { pageAccessToken } = req.body as { pageAccessToken?: string };

        if (!pageAccessToken || typeof pageAccessToken !== "string") {
            return res.status(400).json({ message: "pageAccessToken is required" });
        }

        const settings = await Settings.findOneAndUpdate(
            { key: "facebookIntegration" },
            {
                value: {
                    pageAccessToken,
                    // Optional: store a manual updatedAt inside value for clarity alongside timestamps
                    updatedAt: new Date().toISOString(),
                },
            },
            { upsert: true, new: true }
        );

        res.json({
            message: "Facebook page access token updated successfully",
            lastUpdatedAt: settings.updatedAt,
        });
    } catch (error) {
        console.error("Error updating Facebook settings:", error);
        res.status(500).json({ message: "Failed to update Facebook settings" });
    }
});

// GET /facebook-token-status - Live check with Facebook debug_token
adminRouter.get("/facebook-token-status", async (req, res) => {
    try {
        const appId = process.env.FACEBOOK_APP_ID;
        const appSecret = process.env.FACEBOOK_APP_SECRET;

        if (!appId || !appSecret) {
            return res.status(500).json({
                message: "FACEBOOK_APP_ID and FACEBOOK_APP_SECRET are not configured on the server",
            });
        }

        let pageToken: string;
        try {
            pageToken = await getFacebookPageAccessToken();
        } catch (e: any) {
            return res.status(400).json({
                message: e?.message || "Facebook page access token is not configured",
            });
        }

        const appAccessToken = `${appId}|${appSecret}`;
        const url = `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(
            pageToken
        )}&access_token=${encodeURIComponent(appAccessToken)}`;

        const response = await fetch(url);
        const data: any = await response.json();

        if (!response.ok) {
            console.error("Facebook debug_token error:", data);
            return res.status(500).json({
                message: data?.error?.message || "Failed to debug Facebook token",
            });
        }

        const info = data?.data || {};
        const isValid: boolean = !!info.is_valid;
        const expiresAtUnix: number | null =
            typeof info.expires_at === "number" ? info.expires_at : null;
        const expiresAtIso = expiresAtUnix ? new Date(expiresAtUnix * 1000).toISOString() : null;

        let secondsUntilExpiry: number | null = null;
        let daysUntilExpiry: number | null = null;
        if (expiresAtUnix) {
            const diffSec = expiresAtUnix - Math.floor(Date.now() / 1000);
            secondsUntilExpiry = diffSec;
            daysUntilExpiry = diffSec / (60 * 60 * 24);
        }

        res.json({
            isValid,
            expiresAtUnix,
            expiresAt: expiresAtIso,
            secondsUntilExpiry,
            daysUntilExpiry,
            scopes: info.scopes || [],
            type: info.type,
            userId: info.user_id,
            // When invalid, Facebook usually includes 'error' field inside data
            error: info.error || null,
            checkedAt: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error("Error checking Facebook token status:", error);
        res.status(500).json({
            message: error?.message || "Failed to check Facebook token status",
        });
    }
});

// ==================== MAINTENANCE MODE ROUTES ====================

// GET /maintenance-mode - Get maintenance mode status
adminRouter.get("/maintenance-mode", async (req, res) => {
    try {
        const settings = await Settings.findOne({ key: "maintenanceMode" });
        const isEnabled = settings?.value === true || false;
        res.json({ enabled: isEnabled });
    } catch (error) {
        console.error("Error fetching maintenance mode:", error);
        res.status(500).json({ message: "Failed to fetch maintenance mode status" });
    }
});

// PUT /maintenance-mode - Toggle maintenance mode
adminRouter.put("/maintenance-mode", async (req, res) => {
    try {
        const { enabled } = req.body;
        
        if (typeof enabled !== "boolean") {
            return res.status(400).json({ message: "enabled must be a boolean" });
        }

        const settings = await Settings.findOneAndUpdate(
            { key: "maintenanceMode" },
            { value: enabled },
            { upsert: true, new: true }
        );

        res.json({ 
            message: `Maintenance mode ${enabled ? "enabled" : "disabled"}`,
            enabled: settings.value 
        });
    } catch (error) {
        console.error("Error updating maintenance mode:", error);
        res.status(500).json({ message: "Failed to update maintenance mode" });
    }
});

// GET /system-health - Get system health status
adminRouter.get("/system-health", async (req, res) => {
    try {
        const startTime = Date.now();
        
        // Check database connection
        const dbStatus = mongoose.connection.readyState;
        const dbStates = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting"
        };
        
        let dbResponseTime = 0;
        let dbHealthy = false;
        
        try {
            if (mongoose.connection.db) {
                const dbStartTime = Date.now();
                // Simple ping to check database response
                await mongoose.connection.db.admin().ping();
                dbResponseTime = Date.now() - dbStartTime;
                dbHealthy = true;
            } else {
                dbHealthy = false;
                dbResponseTime = -1;
            }
        } catch (error) {
            dbHealthy = false;
            dbResponseTime = -1;
        }

        // Get database stats
        let dbStats = null;
        try {
            if (mongoose.connection.db) {
                const stats = await mongoose.connection.db.stats();
                dbStats = {
                    collections: stats.collections || 0,
                    dataSize: stats.dataSize || 0,
                    storageSize: stats.storageSize || 0,
                    indexes: stats.indexes || 0
                };
            }
        } catch (error) {
            console.error("Error fetching database stats:", error);
        }

        // Platform information
        const platform = {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            environment: env.nodeEnv,
            host: process.env.VERCEL ? "Vercel" : (process.env.RAILWAY_ENVIRONMENT ? "Railway" : "Unknown"),
            region: process.env.VERCEL_REGION || "Unknown"
        };

        // Memory usage
        const memoryUsage = process.memoryUsage();
        const memory = {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
            external: Math.round(memoryUsage.external / 1024 / 1024), // MB
            rss: Math.round(memoryUsage.rss / 1024 / 1024) // MB
        };

        // Uptime
        const uptime = {
            seconds: Math.floor(process.uptime()),
            formatted: formatUptime(process.uptime())
        };

        // API response time
        const apiResponseTime = Date.now() - startTime;

        // Overall health status
        const overallHealth = dbHealthy && dbStatus === 1 ? "healthy" : "degraded";

        res.json({
            status: overallHealth,
            timestamp: new Date().toISOString(),
            database: {
                status: dbStates[dbStatus as keyof typeof dbStates] || "unknown",
                connected: dbStatus === 1,
                healthy: dbHealthy,
                responseTime: dbResponseTime,
                stats: dbStats
            },
            platform,
            memory,
            uptime,
            api: {
                responseTime: apiResponseTime
            }
        });
    } catch (error) {
        console.error("Error fetching system health:", error);
        res.status(500).json({ 
            message: "Failed to fetch system health",
            error: env.nodeEnv === "development" ? (error as Error).message : undefined
        });
    }
});

// Helper function to format uptime
function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}
