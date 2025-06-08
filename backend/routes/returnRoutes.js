import express from "express";
import { protect, isAdmin, isLogistics } from "../middleware/authMiddleware.js";
import { returnOrder, getReturns } from "../controllers/returnController.js";

const router = express.Router();

router.post("/:id/return", protect, isLogistics, returnOrder);
router.get("/", protect, isLogistics, getReturns);

export default router;
