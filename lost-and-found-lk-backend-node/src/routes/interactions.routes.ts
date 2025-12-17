import { Router } from "express";
import { Types } from "mongoose";
import { FoundInteraction } from "../models/FoundInteraction";
import { Post } from "../models/Post";

const router = Router();

// GET /api/interactions/user/:email/claims
// Based on api/interactions/user/[email]/claims.ts
router.get("/user/:email/claims", async (req, res) => {
    try {
        // Original logic was querying ALL interactions and filtering in memory.
        // Keeping it same to avoid breaking logic, but this is inefficient.
        // Ideally should be: FoundInteraction.find({}).populate({path: 'post', match: { isLost: true }})

        // Note: The original code didn't use the email param even though it was in the path!
        // It returned ALL claims for lost posts. This looks like admin functionality or a bug, 
        // but I will preserve the behavior for now as I don't know the intent.

        const interactions = await FoundInteraction.find({})
            .populate("post")
            .lean();

        const notifications = interactions
            .map((i: any) => {
                const post = i.post;
                if (!post) return null;

                // Only notify owners of LOST posts
                if (!post.isLost) return null;

                return {
                    id: i._id.toString(),
                    postId: post._id.toString(),
                    finderName: i.finderName,
                    finderEmail: i.finderContact,
                    finderPhone: i.finderContact,
                    status: "PENDING",
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

        const interaction = new FoundInteraction({
            post: post._id,
            finderName: finderEmail,
            finderContact: finderEmail,
        } as any);

        await interaction.save();

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

        const interaction = await FoundInteraction.findById(interactionId).lean();
        if (!interaction) {
            return res.status(404).json({ message: "Interaction not found" });
        }

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
