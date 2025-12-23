import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
}

/**
 * Generate JWT access token
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.accessTtl,
  } as SignOptions);
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.refreshTtl,
  } as SignOptions);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, env.jwt.secret) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

