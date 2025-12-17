import { Router } from "express";
import { Types } from "mongoose";
import { Post } from "../models/Post";
import { User } from "../models/User";

const router = Router();

// GET /api/posts?status=LOST|FOUND
router.get("/", async (req, res) => {
  try {
    const { status } = req.query as { status?: string };

    const query: any = {};

    if (status === "LOST") {
      query.isLost = true;
    } else if (status === "FOUND") {
      query.isLost = false;
    }

    // Show only ACTIVE posts by default
    query.status = "ACTIVE";

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Map Mongo document to frontend shape
    const mapped = posts.map((p: any) => ({
      id: p._id.toString(),
      title: p.title,
      description: p.description,
      location: p.location,
      date: p.date,
      images: [], // placeholder - your old backend may have had images
      type: p.itemType,
      status: p.status,
      color: "",
      imei: p.imei,
      serialNumber: p.serialNumber,
      idNumber: p.idNumber,
      contactPhone: p.phoneNumber,
      time: p.time,
    }));

    res.json(mapped);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error fetching posts", err);
    res.status(500).json({
      message: "Failed to fetch posts",
      error: (err as Error).message // Temporarily exposing error for debugging
    });
  }
});

// GET /api/posts/search?type=PHONE|LAPTOP&value=...
router.get("/search", async (req, res) => {
  try {
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

    res.json(mapped);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error searching posts", err);
    res.status(500).json({ message: "Failed to search posts" });
  }
});

// GET /api/posts/user/:userId
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

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

    res.json(mapped);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error fetching user posts", err);
    res.status(500).json({ message: "Failed to fetch user posts" });
  }
});

// POST /api/posts
router.post("/", async (req, res) => {
  try {
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
      userId,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = new Post({
      title,
      description,
      location,
      date,
      itemType: type,
      isLost,
      user: user._id,
      status: status ?? "ACTIVE",
      // Optional extra fields – stored loosely on the document
      imei,
      serialNumber,
      idNumber,
      phoneNumber: contactPhone,
      time,
    } as any);

    const saved = await post.save();

    res.status(201).json({ id: saved._id.toString() });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error creating post", err);
    res.status(500).json({
      message: "Failed to create post",
      error: (err as Error).message
    });
  }
});

// PUT /api/posts/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
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

    // Remove undefined fields so we don't overwrite with undefined
    Object.keys(update).forEach(
      (k) => update[k] === undefined && delete update[k],
    );

    const post = await Post.findByIdAndUpdate(id, update, {
      new: true,
    }).lean();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post updated" });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error updating post", err);
    res.status(500).json({ message: "Failed to update post" });
  }
});

export const postsRouter = router;


