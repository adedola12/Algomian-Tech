import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

// Admin stats controller
export const getAdminStats = asyncHandler(async (req, res) => {
  // Total product value
  const products = await Product.find();
  const productTotal = products.reduce((acc, p) => acc + (p.sellingPrice || 0), 0);

  // Total sold today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = await Order.find({
    createdAt: { $gte: today },
  });

  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  // Compare with yesterday
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const yesterdayOrders = await Order.find({
    createdAt: { $gte: yesterday, $lt: today },
  });

  const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  const salesChange = yesterdayRevenue === 0 ? 100 : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

  // Enroute = Shipped orders total
  const shippedOrders = await Order.find({ status: "Shipped" });
  const shippedRevenue = shippedOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  const shippedToday = todayOrders.filter(o => o.status === "Shipped");
  const shippedTodayTotal = shippedToday.reduce((sum, o) => sum + o.totalPrice, 0);
  const shippedChange = shippedTodayTotal === 0 ? 0 : (shippedTodayTotal / shippedRevenue) * 100;

  res.json({
    productTotal,
    todayRevenue,
    salesChange,
    shippedRevenue,
    shippedChange,
  });
});
