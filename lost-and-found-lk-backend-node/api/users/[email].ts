import { applyCors } from "../_cors";
import { connectToDatabase } from "../../src/config/db";
import { User } from "../../src/models/User";

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
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      id: user._id.toString(),
      email: user.email,
      name: user.fullName,
      phoneNumber: user.phoneNumber ?? null,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error fetching user", err);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
}


