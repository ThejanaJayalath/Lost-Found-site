import { applyCors } from "../../_cors";
import { connectToDatabase } from "../../../src/config/db";
import { Post } from "../../../src/models/Post";
import { Types } from "mongoose";

export default async function handler(
  req: any,
  res: any,
) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET,OPTIONS");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await connectToDatabase();

  const { userId } = req.query as { userId?: string };

  if (!userId || !Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  try {
    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    const mapped = posts.map((p: any) => ({
      id: p._id.toString(),
      title: p.title,
      description: p.description,
      location: p.location,
      date: p.date,
      images: [],
      type: p.itemType,
      status: p.status,
      color: "",
      imei: p.imei,
      serialNumber: p.serialNumber,
      idNumber: p.idNumber,
      contactPhone: p.phoneNumber,
      time: p.time,
    }));

    return res.status(200).json(mapped);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error fetching user posts", err);
    return res.status(500).json({ message: "Failed to fetch user posts" });
  }
}


