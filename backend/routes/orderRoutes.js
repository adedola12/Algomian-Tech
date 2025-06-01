import express from "express";
import {
  getOrders,
  addOrderItems,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  deleteOrder,
  getNewOrdersCount,
  streamNewOrders,
  updateOrderDetails,
  approveSale,
} from "../controllers/orderController.js";
import {
  protect,
  isAdmin,
  isSalesTeam,
  canViewOrders,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/new-count", protect, getNewOrdersCount);
router.get("/stream", protect, streamNewOrders);
router.route("/myorders").get(protect, getMyOrders);

router.route("/").get(protect, canViewOrders, getOrders); // SalesRep + Admin
router.route("/").post(protect, isSalesTeam, addOrderItems); // Admin + SalesRep
router.route("/:id").get(protect, getOrderById);
router.route("/:id/status").put(protect, isSalesTeam, updateOrderStatus); // Admin only
router.route("/:id").delete(protect, deleteOrder);
router.patch("/:id", protect, isSalesTeam, updateOrderDetails);
router.patch(
  "/:id/approve",
  protect,
  authorize("sale.approve"), // <── new gate
  approveSale
);

// routes/orderRoutes.js
// router.get("/", protect, isAdmin, getOrders);

export default router;
