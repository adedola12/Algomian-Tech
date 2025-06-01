import express from "express";
import {
  createShipment,
  getShipmentByOrder,
  updateShipmentStatus,
  updateDeliveryContact,
  driverLogist,
} from "../controllers/logisticsController.js";
import {
  protect,
  isSalesTeam,
  isLogistics,
} from "../middleware/authMiddleware.js"; // adjust as needed

const router = express.Router();

router.post("/", protect, isLogistics, createShipment);
router.get("/order/:orderId", protect, getShipmentByOrder);
router.put(
  "/order/:orderId/status",
  protect,
  isLogistics,
  updateShipmentStatus
);
router.patch(
  "/order/:orderId/contact",
  protect,
  isLogistics,
  updateDeliveryContact
);

router.get("/my", protect, isLogistics, driverLogist);

export default router;
