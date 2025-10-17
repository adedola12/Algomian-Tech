import express from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import {
  listLocations,
  addLocation,
} from "../controllers/locationController.js";

const router = express.Router();

router.get("/", protect, listLocations);
router.post("/", protect, allowRoles("Admin"), addLocation);

export default router;
