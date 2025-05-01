import express from "express";
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrders,
} from "../controllers/orderController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";
import PERM from "../models/permissionEnum.js";

const router = express.Router();

router.route("/")
  .get(protect, authorize(PERM.ORDER_MANAGE), getOrders)
  .post(protect, addOrderItems);

router.route("/myorders").get(protect, getMyOrders);

router.route("/:id")
  .get(protect, getOrderById)
  .delete(protect, authorize(PERM.ORDER_MANAGE), deleteOrder);

router.route("/:id/status")
  .put(protect, authorize(PERM.ORDER_MANAGE), updateOrderStatus);

export default router;
