import { env } from "../src/config/env";

export function applyCors(req: any, res: any) {
  const origin = req.headers.origin as string | undefined;
  const allowed = env.cors.allowedOrigins;

  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
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
}


