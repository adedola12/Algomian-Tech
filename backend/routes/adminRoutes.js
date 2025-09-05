import express from "express";
import PERM from "../models/permissionEnum.js";
import { getAdminStats } from "../controllers/adminStatsController.js";
import {
  protect,
  authorize,
  isGen,
  isAdmin,
  adminOrManager,
} from "../middleware/authMiddleware.js";
import {
  inviteUser,
  listUsers,
  updateUserRoles,
} from "../controllers/adminUserController.js";
import { getInventoryStats } from "../controllers/adminController.js";
import { downloadInventoryCsv } from "../controllers/inventoryController.js"; // ✅ NEW

const router = express.Router();

/*──── users ────*/
router
  .route("/users")
  .post(protect, authorize(PERM.USER_MANAGE), inviteUser)
  .get(protect, authorize(PERM.USER_MANAGE), listUsers);

// router.get("/stats", protect, adminOrManager, getAdminStats);
// router.get("/stats", protect, authorize("stats.view"), getAdminStats);

router.get("/stats", protect, authorize("stats.view"), getInventoryStats);

/* ✅ inventory download (CSV) */
router.get(
  "/inventory/download",
  protect,
  authorize("inventory.download"),
  downloadInventoryCsv
);

export default router;
