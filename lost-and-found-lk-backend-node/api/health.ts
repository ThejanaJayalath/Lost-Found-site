import { connectToDatabase } from "../src/config/db";
import { applyCors } from "./_cors";

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


