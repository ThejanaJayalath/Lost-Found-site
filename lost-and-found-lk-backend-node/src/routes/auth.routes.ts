import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

const router = Router();

/**
 * POST /api/auth/admin/login
 * Admin login endpoint
 */
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is blocked
    if (user.blocked) {
      return res.status(403).json({ message: "Account is blocked" });
    }

    // Check if user has ADMIN or OWNER role
    if (!user.roles || (!user.roles.includes("ADMIN") && !user.roles.includes("OWNER"))) {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Verify password
    // If passwordHash is "firebase", it means user hasn't set a password yet
    // For initial admin setup, we'll allow setting password
    if (user.passwordHash === "firebase" || !user.passwordHash) {
      // First time login - hash and save the provided password
      const hashedPassword = await bcrypt.hash(password, 10);
      user.passwordHash = hashedPassword;
      await user.save();
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate tokens
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Return tokens and user info (without password)
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.fullName,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/auth/admin/refresh
 * Refresh access token
 */
router.post("/admin/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Verify refresh token
    const { verifyToken } = await import("../utils/jwt");
    const decoded = verifyToken(refreshToken);

    // Verify user still exists and is admin or owner
    const user = await User.findById(decoded.userId);

    if (!user || user.blocked || (!user.roles?.includes("ADMIN") && !user.roles?.includes("OWNER"))) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Generate new access token
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
    };

    const accessToken = generateAccessToken(tokenPayload);

    res.json({ accessToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

export const authRouter = router;

