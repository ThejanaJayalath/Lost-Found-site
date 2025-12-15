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
    // For now, reuse FoundInteraction as a simple "claim"
    const interactions = await FoundInteraction.find({})
      .populate("post")
      .lean();

    const notifications = interactions
      .map((i: any) => {
        const post = i.post;
        if (!post) return null;

        // Only notify owners of LOST posts
        if (!post.isLost) return null;

        return {
          id: i._id.toString(),
          postId: post._id.toString(),
          finderName: i.finderName,
          finderEmail: i.finderContact,
          finderPhone: i.finderContact,
          status: "PENDING",
        };
      })
      .filter(Boolean);

    return res.status(200).json(notifications);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error fetching claim notifications", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch claim notifications" });
  }
}


