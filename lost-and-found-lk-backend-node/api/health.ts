import { connectToDatabase } from "../src/config/db";
import { env } from "../src/config/env";

function applyCors(req: any, res: any) {
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

export default async function handler(req: any, res: any) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET,OPTIONS");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectToDatabase();
    return res.status(200).json({ status: "UP" });
  } catch (err) {
    return res.status(500).json({ status: "DOWN" });
  }
}


