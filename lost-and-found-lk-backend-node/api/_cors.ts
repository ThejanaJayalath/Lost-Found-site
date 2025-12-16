import type { VercelRequest, VercelResponse } from "@vercel/node";
import { env } from "../src/config/env";

export function applyCors(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin as string | undefined;
  const allowed = env.cors.allowedOrigins;

  // Allow origin if it's in the allowed list, or allow all in development/production
  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (origin) {
    // For Vercel deployments, allow the request origin
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // Fallback: allow all origins (for development)
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
  
  // Don't set COOP headers to allow Firebase Auth redirects
  // COOP headers would block window.close() calls in popups
}


