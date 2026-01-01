import { Router } from "express";
import { SupportMessage } from "../models/SupportMessage";
import { sendSupportNotification } from "../utils/emailService";

const router = Router();

/**
 * POST /api/support
 * Submit a support message
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required: name, email, subject, message",
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Trim and validate lengths
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    if (trimmedSubject.length < 3) {
      return res.status(400).json({ message: "Subject must be at least 3 characters" });
    }

    if (trimmedMessage.length < 10) {
      return res.status(400).json({ message: "Message must be at least 10 characters" });
    }

    // Create support message
    const supportMessage = new SupportMessage({
      name: trimmedName,
      email: trimmedEmail,
      subject: trimmedSubject,
      message: trimmedMessage,
      status: "new",
    });

    // Save to database
    const savedMessage = await supportMessage.save();

    // Send email notification (don't fail if email fails)
    try {
      await sendSupportNotification({
        name: trimmedName,
        email: trimmedEmail,
        subject: trimmedSubject,
        message: trimmedMessage,
      });
    } catch (emailError) {
      console.error("Email notification failed, but message was saved:", emailError);
      // Continue - message is saved even if email fails
    }

    res.status(201).json({
      message: "Support message submitted successfully",
      id: savedMessage._id.toString(),
    });
  } catch (err) {
    console.error("Error creating support message:", err);
    res.status(500).json({
      message: "Failed to submit support message",
      error: (err as Error).message,
    });
  }
});

export const supportRouter = router;

