import { applyCors } from "../_cors";
import { connectToDatabase } from "../../src/config/db";
import { FoundInteraction } from "../../src/models/FoundInteraction";
import { Post } from "../../src/models/Post";

export default async function handler(req: any, res: any) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST,OPTIONS");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await connectToDatabase();

  const { postId, finderEmail } = req.body as {
    postId?: string;
    finderEmail?: string;
  };

  if (!postId || !finderEmail) {
    return res.status(400).json({ message: "postId and finderEmail are required" });
  }

  try {
    const post = await Post.findById(postId).lean();
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const interaction = new FoundInteraction({
      post: post._id,
      finderName: finderEmail,
      finderContact: finderEmail,
    } as any);

    await interaction.save();

    return res.status(201).json({ id: interaction._id.toString() });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error creating found interaction", err);
    return res.status(500).json({ message: "Failed to create interaction" });
  }
}


