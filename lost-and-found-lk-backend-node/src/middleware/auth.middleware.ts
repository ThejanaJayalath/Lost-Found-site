import { Request, Response, NextFunction } from "express";
import { verifyToken, JWTPayload } from "../utils/jwt";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
  } catch (error) {
    res.status(401).json({ message: "Authentication failed" });
    return;
  }
};

/**
 * Admin authorization middleware - must be authenticated AND have ADMIN or OWNER role
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    const { verifyToken } = require("../utils/jwt");
    const decoded = verifyToken(token);
    req.user = decoded;

    // Check if user has ADMIN or OWNER role
    if (!req.user.roles || (!req.user.roles.includes("ADMIN") && !req.user.roles.includes("OWNER"))) {
      res.status(403).json({ message: "Admin access required" });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};

/**
 * Owner authorization middleware - must be authenticated AND have OWNER role
 */
export const requireOwner = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    const { verifyToken } = require("../utils/jwt");
    const decoded = verifyToken(token);
    req.user = decoded;

    // Check if user has OWNER role
    if (!req.user.roles || !req.user.roles.includes("OWNER")) {
      res.status(403).json({ message: "Owner access required" });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};

