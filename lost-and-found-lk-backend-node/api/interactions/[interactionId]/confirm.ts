import { applyCors } from "../../_cors";
import { connectToDatabase } from "../../../src/config/db";
import { FoundInteraction } from "../../../src/models/FoundInteraction";
import { Post } from "../../../src/models/Post";
import { Types } from "mongoose";

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

  const { interactionId } = req.query as { interactionId?: string };

  if (!interactionId || !Types.ObjectId.isValid(interactionId)) {
    return res.status(400).json({ message: "Invalid interaction id" });
  }

  try {
    const interaction = await FoundInteraction.findById(interactionId).lean();
    if (!interaction) {
      return res.status(404).json({ message: "Interaction not found" });
    }

    await Post.findByIdAndUpdate(interaction.post, {
      status: "RESOLVED",
    });

    return res.status(200).json({ message: "Claim confirmed" });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error confirming interaction", err);
    return res.status(500).json({ message: "Failed to confirm interaction" });
  }
}


