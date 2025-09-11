// routes/reportRoutes.js
import express from "express";
import {
  protect,
  allowRoles,
  authorize,
} from "../middleware/authMiddleware.js";
import { getAgentKpis } from "../controllers/reportController.js";

const router = express.Router();

// Admin-only (pick whichever gate you prefer)
router.get("/agent-kpis", protect, allowRoles("Admin"), getAgentKpis);
// or: router.get("/agent-kpis", protect, authorize("uac.view"), getAgentKpis);

export default router;
