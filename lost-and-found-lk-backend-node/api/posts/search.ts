import { applyCors } from "../_cors";
import { connectToDatabase } from "../../src/config/db";
import { Post } from "../../src/models/Post";

export default async function handler(req: any, res: any) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET,OPTIONS");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await connectToDatabase();

  const { type, value } = req.query as { type?: string; value?: string };

  if (!type || !value) {
    return res.status(400).json({ message: "Missing type or value" });
  }

  const query: any = { status: "ACTIVE" };

  if (type === "PHONE") {
    query.imei = value;
  } else if (type === "LAPTOP") {
    query.serialNumber = value;
  }

  try {
    const post = await Post.findOne(query).lean();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const mapped = {
      id: post._id.toString(),
      title: post.title,
      description: post.description,
      location: post.location,
      date: post.date,
      images: [],
      type: post.itemType,
      status: post.status,
      color: "",
      imei: post.imei,
      serialNumber: post.serialNumber,
      idNumber: post.idNumber,
      contactPhone: post.phoneNumber,
      time: post.time,
    };

    return res.status(200).json(mapped);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error searching posts", err);
    return res.status(500).json({ message: "Failed to search posts" });
  }
}


