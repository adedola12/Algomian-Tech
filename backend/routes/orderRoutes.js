import express from "express";
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getOrders,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, admin, getOrders)             // admin only
  .post(protect, addOrderItems);              // create order

router.route("/myorders")
  .get(protect, getMyOrders);

router.route("/:id")
  .get(protect, getOrderById);

router.route("/:id/status")
  .put(protect, admin, updateOrderStatus);    // admin can change status

export default router;
