import { Router } from "express";
import { Types } from "mongoose";
import { Post } from "../models/Post";

const router = Router();

// GET /api/posts?status=LOST|FOUND
router.get("/", async (req, res) => {
  try {
    const { status } = req.query as { status?: string };

    const query: any = {};

    // Legacy logic: Frontend sends "LOST" or "FOUND" in query, which maps to isLost boolean
    if (status === "LOST") {
      query.isLost = true;
    } else if (status === "FOUND") {
      query.isLost = false;
    }

    // In legacy, "status" field on DB was used for RESOLVED/ACTIVE.
    // We assume default show ACTIVE unless specified otherwise.
    // If frontend sends status=LOST, it means "Show me lost items that are ACTIVE".
    query.status = "ACTIVE";

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Map Mongo document to frontend shape
    // Legacy frontend expects "id", not "_id"
    // It also expects "type", not "itemType"
    // And "contactPhone", not just "phoneNumber" (though check model)
    const mapped = posts.map((p: any) => ({
      id: p._id.toString(),
      title: p.title,
      description: p.description,
      location: p.location,
      date: p.date,
      time: p.time,
      images: p.images || [],
      type: p.itemType, // "PHONE", "LAPTOP" etc
      status: p.status, // "ACTIVE", "RESOLVED"
      color: p.color,

      // User info
      userId: p.userId,
      userName: p.userName,
      userInitial: p.userInitial,

      // Type specific
      imei: p.imei,
      serialNumber: p.serialNumber,
      idNumber: p.idNumber,

      // Contact
      contactPhone: p.contactPhone || p.phoneNumber, // Fallback
    }));

    res.json(mapped);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error fetching posts", err);
    res.status(500).json({
      message: "Failed to fetch posts",
      error: (err as Error).message
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
    } else {
      // Generic search?
      // Legacy code seemed strict on type
    }

    // Also match correct itemType? 
    // Legacy search logic: Post post = postService.searchLostDevice(type, value);
    // It likely filtered by itemType too.
    query.itemType = type;

    const post = await Post.findOne(query).lean();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Reuse mapping logic or simplify
    const p: any = post;
    const mapped = {
      id: p._id.toString(),
      title: p.title,
      description: p.description,
      location: p.location,
      date: p.date,
      time: p.time,
      images: p.images || [],
      type: p.itemType,
      status: p.status,
      color: p.color,
      userId: p.userId,
      userName: p.userName,
      userInitial: p.userInitial,
      imei: p.imei,
      serialNumber: p.serialNumber,
      idNumber: p.idNumber,
      contactPhone: p.contactPhone || p.phoneNumber,
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

    // Legacy userId is a String, not necessarily ObjectId. Remove isValid check.
    if (!userId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const posts = await Post.find({ userId: userId })
      .sort({ createdAt: -1 })
      .lean();

    const mapped = posts.map((p: any) => ({
      id: p._id.toString(),
      title: p.title,
      description: p.description,
      location: p.location,
      date: p.date,
      time: p.time,
      images: p.images || [],
      type: p.itemType,
      status: p.status,
      color: p.color,
      userId: p.userId,
      userName: p.userName,
      userInitial: p.userInitial,
      imei: p.imei,
      serialNumber: p.serialNumber,
      idNumber: p.idNumber,
      contactPhone: p.contactPhone || p.phoneNumber,
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
      type, // "PHONE", "LAPTOP" etc
      status, // "LOST", "FOUND" from frontend usually
      color, // missing in previous implementation?
      imei,
      serialNumber,
      idNumber,
      contactPhone,
      time,
      isLost, // boolean

      // User info now passed from frontend
      userId,
      userName,
      userInitial
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Determine isLost if not explicitly sent
    let finalIsLost = isLost;
    if (finalIsLost === undefined) {
      if (status === "LOST") finalIsLost = true;
      else if (status === "FOUND") finalIsLost = false;
      else finalIsLost = true; // default
    }

    // Determine initial DB status
    // Common flow: Created -> ACTIVE
    const initialStatus = "ACTIVE";

    const post = new Post({
      title,
      description,
      location,
      date,
      time,
      itemType: type, // Store directly
      status: initialStatus,
      isLost: finalIsLost,

      userId,
      userName, // Store if provided
      userInitial,

      // Details
      color,
      imei,
      serialNumber,
      idNumber,

      contactPhone,
      images: [] // TODO: Image handling if frontend sends them
    });

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

    // Logic: Just update whatever is sent
    const update = req.body;

    // Remap keys if needed
    if (update.type) {
      update.itemType = update.type;
      delete update.type;
    }

    // Filter undefined
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

// DELETE /api/posts/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    await Post.findByIdAndDelete(id);
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Error deleting post", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
});

export const postsRouter = router;
