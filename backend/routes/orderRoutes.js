import express from 'express';
import {
  getOrders,
  addOrderItems,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, isAdmin, isSalesTeam } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, isSalesTeam, getOrders); // SalesRep + Admin
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, isAdmin, updateOrderStatus); // Admin only
router.route('/:id').delete(protect, isAdmin, deleteOrder);
router.route('/').post(protect, isSalesTeam, addOrderItems); // Admin + SalesRep
// routes/orderRoutes.js
// router.get("/", protect, isAdmin, getOrders);


export default router;
