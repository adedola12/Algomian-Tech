import express from "express";
import { protect, isAdmin, isGen } from "../middleware/authMiddleware.js";

import {
  listPolicies,
  getPolicy,
  upsertPolicy,
} from "../controllers/accessPolicyController.js";

const router = express.Router();
router.use(protect, isAdmin); // 👑 admin-only

router.route("/").get(listPolicies); // GET  /api/access
router
  .route("/:type")
  .get(getPolicy) // GET  /api/access/Manager
  .put(upsertPolicy); // PUT  /api/access/Manager



export default router;
