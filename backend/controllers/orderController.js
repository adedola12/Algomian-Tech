import asyncHandler from "express-async-handler";
import Order        from '../models/orderModel.js';
import Product      from "../models/productModel.js";

/**
 * @desc   Create new order
 * @route  POST /api/orders
 * @access Private
 */
export const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems, shippingAddress, paymentMethod,
    itemsPrice, shippingPrice, taxPrice, totalPrice,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  // ensure products exist & fetch details
  const detailedItems = await Promise.all(orderItems.map(async item => {
    const prod = await Product.findById(item.product);
    if (!prod) throw new Error(`Product not found: ${item.product}`);
    return {
      product: prod._id,
      name:    prod.productName,
      qty:     item.qty,
      price:   item.price,
      image:   prod.images[0] || "",
    };
  }));

  const order = new Order({
    user:            req.user._id,
    orderItems:      detailedItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

/**
 * @desc   Get logged in user's orders
 * @route  GET /api/orders/myorders
 * @access Private
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
  res.json(orders);
});

/**
 * @desc   Get order by ID
 * @route  GET /api/orders/:id
 * @access Private (user can only fetch their own) / Admin can fetch any
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "firstName lastName email");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  // enforce ownership
  if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error("Not allowed");
  }
  res.json(order);
});

/**
 * @desc   Update order status (e.g. to Processing, Shipped, Delivered)
 * @route  PUT /api/orders/:id/status
 * @access Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, isPaid, isDelivered } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  order.status      = status      || order.status;
  order.isPaid      = isPaid      ?? order.isPaid;
  order.paidAt      = isPaid      ? Date.now() : order.paidAt;
  order.isDelivered = isDelivered ?? order.isDelivered;
  order.deliveredAt = isDelivered ? Date.now() : order.deliveredAt;

  const updated = await order.save();
  res.json(updated);
});

/**
 * @desc   Admin: get all orders
 * @route  GET /api/orders
 * @access Private/Admin
 */
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "firstName lastName email")
    .sort("-createdAt");
  res.json(orders);
});
