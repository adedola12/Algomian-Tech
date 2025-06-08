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

const router = express.Router();

/*──── users ────*/
router
  .route("/users")
  .post(protect, authorize(PERM.USER_MANAGE), inviteUser)
  .get(protect, authorize(PERM.USER_MANAGE), listUsers);

// router.get("/stats", protect, adminOrManager, getAdminStats);
// router.get("/stats", protect, authorize("stats.view"), getAdminStats);

router.get("/stats", protect, authorize("stats.view"), getInventoryStats);

export default router;
