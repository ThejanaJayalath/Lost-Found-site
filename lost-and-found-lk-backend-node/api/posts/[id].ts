import { applyCors } from "../_cors";
import { connectToDatabase } from "../../src/config/db";
import { Post } from "../../src/models/Post";
import { Types } from "mongoose";

export default async function handler(req: any, res: any) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT,OPTIONS");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await connectToDatabase();

  const { id } = req.query as { id?: string };

  if (!id || !Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid post id" });
  }

  const {
    title,
    description,
    location,
    date,
    type,
    status,
    color,
    imei,
    serialNumber,
    idNumber,
    contactPhone,
    time,
    isLost,
  } = req.body;

  const update: any = {
    title,
    description,
    location,
    date,
    itemType: type,
    status,
    isLost,
    imei,
    serialNumber,
    idNumber,
    phoneNumber: contactPhone,
    time,
  };

  Object.keys(update).forEach(
    (k) => update[k] === undefined && delete update[k],
  );

  try {
    const post = await Post.findByIdAndUpdate(id, update, {
      new: true,
    }).lean();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({ message: "Post updated" });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error updating post", err);
    return res.status(500).json({ message: "Failed to update post" });
  }
}


