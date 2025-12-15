import { applyCors } from "./_cors";
import { connectToDatabase } from "../src/config/db";
import { User } from "../src/models/User";

export default async function handler(req: any, res: any) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  await connectToDatabase();

  if (req.method === "POST") {
    const { email, name, phoneNumber } = req.body as {
      email?: string;
      name?: string;
      phoneNumber?: string | null;
    };

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    try {
      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          email,
          passwordHash: "firebase",
          fullName: name ?? email,
          phoneNumber: phoneNumber ?? undefined,
        } as any);
      } else if (phoneNumber != null) {
        user.phoneNumber = phoneNumber;
        if (name) {
          user.fullName = name;
        }
      }

      const saved = await user.save();

      return res.status(200).json({
        id: saved._id.toString(),
        email: saved.email,
        name: saved.fullName,
        phoneNumber: saved.phoneNumber ?? null,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error syncing user", err);
      return res.status(500).json({ message: "Failed to sync user" });
    }
  }

  res.setHeader("Allow", "POST,OPTIONS");
  return res.status(405).json({ message: "Method Not Allowed" });
}


