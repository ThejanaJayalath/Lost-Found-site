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

    // Legacy Logic: 
    // If status is provided (e.g. ?status=LOST), filter by that status.
    // If NO status is provided, return all posts.
    if (status) {
      query.status = status;
    }

    // NOTE: We REMOVED the "query.status = ACTIVE" default because 
    // the legacy backend does not use "ACTIVE". It uses LOST/FOUND/RESOLVED.

    const posts = await Post.find(query)
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

    // Legacy search matches logic: findByImeiIgnoreCaseAndStatus(..., PostStatus.LOST)
    // So we must enforce status=LOST for searches.
    const query: any = { status: "LOST" };

    if (type === "PHONE") {
      query.imei = value;
    } else if (type === "LAPTOP") {
      query.serialNumber = value;
    }
    query.itemType = type;

    const post = await Post.findOne(query).lean();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

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
      userName,
      userInitial,
      images
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Determine status (default to LOST if not provided)
    // If logic: if "isLost" is true -> "LOST", else "FOUND". 
    // Or just respect "status" field if valid.
    let finalStatus = status;
    if (!finalStatus) {
      // Inference if missing
      if (isLost === true) finalStatus = "LOST";
      else if (isLost === false) finalStatus = "FOUND";
      else finalStatus = "LOST";
    }

    // Determine isLost boolean for helper
    let finalIsLost = isLost;
    if (finalIsLost === undefined) {
      if (finalStatus === "LOST") finalIsLost = true;
      else finalIsLost = false;
    }

    // Look up user info if not sent from frontend (Legacy did this in Service)
    let finalUserName = userName;
    let finalUserInitial = userInitial;

    if (!finalUserName) {
      // Try to fetch from DB user collection if exists
      try {
        const user = await User.findById(userId);
        if (user && user.fullName) {
          finalUserName = user.fullName;
          finalUserInitial = user.fullName.substring(0, 1).toUpperCase();
        } else {
          finalUserInitial = "U";
        }
      } catch (e) {
        // ignore if user not found in DB, just save what we have
        finalUserInitial = "U";
      }
    }

    const post = new Post({
      title,
      description,
      location,
      date,
      time,
      itemType: type,
      status: finalStatus,
      isLost: finalIsLost,

      userId,
      userName: finalUserName,
      userInitial: finalUserInitial,

      color,
      imei,
      serialNumber,
      idNumber,

      contactPhone,
      images: images || []
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

    const update = req.body;

    // Remap keys if needed
    if (update.type) {
      update.itemType = update.type;
      delete update.type;
    }

    Object.keys(update).forEach(
      (k) => update[k] === undefined && delete update[k],
    );

    // If updating status, ensure isLost syncs
    if (update.status === "LOST") update.isLost = true;
    if (update.status === "FOUND" || update.status === "RESOLVED") update.isLost = false;

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
