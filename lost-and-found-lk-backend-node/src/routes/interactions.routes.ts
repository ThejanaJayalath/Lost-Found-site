import { Router } from "express";
import { Types } from "mongoose";
import { FoundInteraction } from "../models/FoundInteraction";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { sendFoundItemNotification } from "../utils/emailService";

const router = Router();

// GET /api/interactions/user/:email/claims
// Based on api/interactions/user/[email]/claims.ts
router.get("/user/:email/claims", async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // 1. Find User to get ID
        const user = await import("../models/User").then(m => m.User.findOne({ email }).lean());

        if (!user) {
            // If user not found, they definitely have no posts/claims
            return res.status(200).json([]);
        }

        // 2. Find all posts by this user
        // Post.userId is string in model, user._id is ObjectId
        const userPosts = await Post.find({ userId: user._id.toString() }).select('_id').lean();
        const postIds = userPosts.map(p => p._id);

        if (postIds.length === 0) {
            return res.status(200).json([]);
        }

        // 3. Find interactions for these posts
        const interactions = await FoundInteraction.find({
            post: { $in: postIds }
        })
            .populate("post")
            .lean();

        const notifications = interactions
            .map((i: any) => {
                const post = i.post;
                if (!post) return null;

                // Double check (should be redundant due to query, but safe)
                // Also ensure we only show claims for LOST items
                if (!post.isLost) return null;

                return {
                    id: i._id.toString(),
                    postId: post._id.toString(),
                    finderName: i.finderName,
                    finderEmail: i.finderContact,
                    finderPhone: i.finderContact, // Mapping contact to phone as per original
                    status: i.status || "PENDING", // Ensure status is returned
                };
            })
            .filter(Boolean);

        return res.status(200).json(notifications);
    } catch (err: any) {
        console.error("Error fetching claim notifications", err);
        return res.status(500).json({
            message: "Failed to fetch claim notifications",
            error: (err as Error).message,
        });
    }
});

// GET /api/interactions/user/:email/found
// Based on api/interactions/user/[email]/found.ts
router.get("/user/:email/found", async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const interactions = await FoundInteraction.find({
            finderContact: email,
        })
            .populate("post")
            .lean();

        const posts = interactions
            .map((i: any) => i.post)
            .filter(Boolean)
            .map((p: any) => ({
                id: p._id.toString(),
                title: p.title,
                description: p.description,
                location: p.location,
                date: p.date,
                images: [],
                type: p.itemType,
                status: p.status,
                color: "",
            }));

        return res.status(200).json(posts);
    } catch (err: any) {
        console.error("Error fetching found interactions", err);
        return res.status(500).json({
            message: "Failed to fetch found interactions",
            error: (err as Error).message,
        });
    }
});

// POST /api/interactions/found
// Based on api/interactions/found.ts
router.post("/found", async (req, res) => {
    try {
        const { postId, finderEmail } = req.body;

        if (!postId || !finderEmail) {
            return res.status(400).json({ message: "postId and finderEmail are required" });
        }

        const post = await Post.findById(postId).lean();
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Only send notifications for LOST items
        if (!post.isLost || post.status !== "LOST") {
            return res.status(400).json({ message: "Can only report found for LOST items" });
        }

        const interaction = new FoundInteraction({
            post: post._id,
            finderName: finderEmail,
            finderContact: finderEmail,
        } as any);

        await interaction.save();

        // Send email notification to owner (don't fail if email fails)
        try {
            // Get owner's email from User model using post.userId
            const owner = await User.findById(post.userId).lean();
            
            if (owner && owner.email) {
                // Get finder's name if available
                const finder = await User.findOne({ email: finderEmail }).lean();
                const finderName = finder?.fullName || undefined;

                await sendFoundItemNotification({
                    ownerEmail: owner.email,
                    ownerName: owner.fullName || "User",
                    finderEmail: finderEmail,
                    finderName: finderName,
                    postTitle: post.title,
                    postDescription: post.description,
                    postLocation: post.location,
                    postDate: post.date,
                    contactPhone: post.contactPhone,
                });
            } else {
                console.warn(`⚠️  Could not find owner email for post ${postId}. User ID: ${post.userId}`);
            }
        } catch (emailError) {
            console.error("❌ Email notification failed, but interaction was saved:", emailError);
            // Continue - interaction is saved even if email fails
        }

        return res.status(201).json({ id: interaction._id.toString() });
    } catch (err: any) {
        console.error("Error creating found interaction", err);
        return res.status(500).json({
            message: "Failed to create interaction",
            error: (err as Error).message,
        });
    }
});

// POST /api/interactions/:interactionId/confirm
// Based on api/interactions/[interactionId]/confirm.ts
router.post("/:interactionId/confirm", async (req, res) => {
    try {
        const { interactionId } = req.params;

        if (!interactionId || !Types.ObjectId.isValid(interactionId)) {
            return res.status(400).json({ message: "Invalid interaction id" });
        }

        const interaction = await FoundInteraction.findById(interactionId);
        if (!interaction) {
            return res.status(404).json({ message: "Interaction not found" });
        }

        interaction.status = "ACCEPTED";
        await interaction.save();

        await Post.findByIdAndUpdate(interaction.post, {
            status: "RESOLVED",
        });

        return res.status(200).json({ message: "Claim confirmed" });
    } catch (err: any) {
        console.error("Error confirming interaction", err);
        return res.status(500).json({
            message: "Failed to confirm interaction",
            error: (err as Error).message,
        });
    }
});

export const interactionsRouter = router;
