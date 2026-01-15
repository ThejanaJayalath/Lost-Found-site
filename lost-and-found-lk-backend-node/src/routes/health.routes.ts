import { Router } from "express";
import { Settings } from "../models/Settings";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ status: "UP" });
});

// Public endpoint to check maintenance mode (no auth required)
router.get("/maintenance-mode", async (_req, res) => {
  try {
    const settings = await Settings.findOne({ key: "maintenanceMode" });
    const isEnabled = settings?.value === true || false;
    res.json({ enabled: isEnabled });
  } catch (error) {
    console.error("Error fetching maintenance mode:", error);
    // Default to false if there's an error
    res.json({ enabled: false });
  }
});

export const healthRouter = router;


