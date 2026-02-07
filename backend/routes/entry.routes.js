import { Router } from "express";
import { scanEntry, getEntries, sendReminders } from "../controllers/entry.controller.js";
import { requirePortalSession } from "../middleware/portal.middleware.js";

const router = Router();

router.use(requirePortalSession);

router.post("/scan", scanEntry);
router.get("/", getEntries);
router.post("/send-reminders", sendReminders);

export default router;
