import { applyCors } from "../../../../_cors";
import { connectToDatabase } from "../../../../../src/config/db";
import { FoundInteraction } from "../../../../../src/models/FoundInteraction";
import { Post } from "../../../../../src/models/Post";

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

  const { email } = req.query as { email?: string };

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const interactions = await FoundInteraction.find({
      finderContact: email,
    })
      .populate("post")
      .lean();

    const posts = interactions
      .map((i: any) => i.post)
      .filter(Boolean)
      .map((p: any) => ({
        id: p._id.toString(),
        title: p.title,
        description: p.description,
        location: p.location,
        date: p.date,
        images: [],
        type: p.itemType,
        status: p.status,
        color: "",
      }));

    return res.status(200).json(posts);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error fetching found interactions", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch found interactions" });
  }
}


