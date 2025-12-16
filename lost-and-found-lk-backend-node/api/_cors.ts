import { env } from "../src/config/env";

export function applyCors(req: any, res: any) {
  const origin = req.headers.origin as string | undefined;
  const allowed = env.cors.allowedOrigins;

  // Allow origin if it's in the allowed list, or allow all in development
  if (origin && (allowed.includes(origin) || env.nodeEnv === "development")) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (!origin || env.nodeEnv === "development") {
    // In development or if no origin header, allow all
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  
  // Don't set COOP headers to allow Firebase Auth popups
  // COOP headers would block window.close() calls in popups
}


