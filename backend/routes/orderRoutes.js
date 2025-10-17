// routes/orderRoutes.js
import express from "express";
import {
  getOrders,
  addOrderItems,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  getNewOrdersCount,
  streamNewOrders,
  updateOrderDetails,
  approveSale,
  verifyInventory,
  returnOrder,
  deleteOrder,
  restoreOrder,
  addBulkOrders,
} from "../controllers/orderController.js";

import {
  protect,
  isAdmin,
  isSalesTeam,
  isInventory,
  canViewOrders,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* meta / streaming */
router.get("/new-count", protect, getNewOrdersCount);
router.get("/stream", protect, streamNewOrders);


router.post("/bulk", protect, isSalesTeam, addBulkOrders);

/* my orders */
router.get("/myorders", protect, getMyOrders);

/* list + create */
router.get("/", protect, canViewOrders, getOrders); // SalesRep + Admin
router.post("/", protect, isSalesTeam, addOrderItems); // Admin + SalesRep

/* single order read */
router.get("/:id", protect, getOrderById);

/* status/flags (make this Admin-only; change to isSalesTeam if desired) */
router.put("/:id/status", protect, isAdmin, updateOrderStatus);

/* partial update from UI (qty, shipping, etc.) */
router.patch("/:id", protect, isSalesTeam, updateOrderDetails);

/* approvals */
router.patch("/:id/approve", protect, authorize("sale.approve"), approveSale);

/* inventory check (e.g., serial assignment) */
router.patch("/:id/verify-inventory", protect, isInventory, verifyInventory);

/* returns (restock + log) */
router.patch("/:id/return", protect, authorize("order.return"), returnOrder);

/* delete (soft delete) + restore */
router.delete("/:id", protect, authorize("order.delete"), deleteOrder);
router.patch("/:id/restore", protect, isAdmin, restoreOrder);


export default router;
