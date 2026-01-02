import { Router } from "express";
import { User } from "../models/User";

const router = Router();

// POST /api/users
// Sync user from frontend (create or update)
router.post("/", async (req, res) => {
    try {
        const { email, name, phoneNumber, termsAgreed } = req.body;

        if (!email || typeof email !== "string") {
            return res.status(400).json({ message: "Email is required" });
        }

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                email,
                passwordHash: "firebase",
                fullName: name || email,
                phoneNumber: phoneNumber || undefined,
                termsAgreed: termsAgreed || false,
            } as any);
        } else {
            if (user.blocked) {
                return res.status(403).json({ message: "User is blocked" });
            }
            if (phoneNumber != null) {
                user.phoneNumber = phoneNumber;
            }
            if (name && name.trim()) {
                user.fullName = name;
            }
            if (termsAgreed !== undefined) {
                user.termsAgreed = termsAgreed;
            }
        }

        const saved = await user.save();

        return res.status(200).json({
            id: saved._id.toString(),
            email: saved.email,
            name: saved.fullName,
            phoneNumber: saved.phoneNumber || null,
            termsAgreed: saved.termsAgreed || false,
        });
    } catch (err: any) {
        console.error("Error syncing user:", err);
        return res.status(500).json({
            message: "Failed to sync user",
            error: (err as Error).message,
        });
    }
});

// GET /api/users/:email
router.get("/:email", async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email }).lean();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.blocked) {
            return res.status(403).json({ message: "User is blocked" });
        }

        return res.status(200).json({
            id: user._id.toString(),
            email: user.email,
            name: user.fullName,
            phoneNumber: user.phoneNumber ?? null,
            termsAgreed: user.termsAgreed ?? false,
        });
    } catch (err: any) {
        console.error("Error fetching user", err);
        return res.status(500).json({
            message: "Failed to fetch user",
            error: (err as Error).message,
        });
    }
});

// PUT /api/users/:email
// Update user profile (phone number, terms agreement)
router.put("/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const { phoneNumber, termsAgreed } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.blocked) {
            return res.status(403).json({ message: "User is blocked" });
        }

        if (phoneNumber != null) {
            user.phoneNumber = phoneNumber;
        }
        if (termsAgreed !== undefined) {
            user.termsAgreed = termsAgreed;
        }

        const saved = await user.save();

        return res.status(200).json({
            id: saved._id.toString(),
            email: saved.email,
            name: saved.fullName,
            phoneNumber: saved.phoneNumber || null,
            termsAgreed: saved.termsAgreed || false,
        });
    } catch (err: any) {
        console.error("Error updating user", err);
        return res.status(500).json({
            message: "Failed to update user",
            error: (err as Error).message,
        });
    }
});

export const usersRouter = router;
