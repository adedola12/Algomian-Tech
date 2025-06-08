import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Return from "../models/returnModel.js";

export const getInventoryStats = asyncHandler(async (req, res) => {
  const products = await Product.find();
  const orders = await Order.find();
  const returns = await Return.find();

  // Get today's and yesterday's boundaries
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Total product value (current)
  const productTotal = products.reduce(
    (sum, p) => sum + (p.quantity || 0) * (p.sellingPrice || 0),
    0
  );

  // Optionally: calculate yesterdayProductTotal (this requires stored snapshot/logging).
  // Here’s a quick workaround:
  const yesterdayOrders = orders.filter(
    (o) => o.createdAt >= yesterday && o.createdAt < today
  );

  const soldYesterdayTotal = yesterdayOrders.reduce(
    (sum, o) =>
      sum + o.orderItems.reduce((s, item) => s + item.qty * item.price, 0),
    0
  );

  // Naive assumption: if yesterday's inventory dropped by value of sold items
  const estimatedYesterdayProductTotal = productTotal + soldYesterdayTotal;

  const productChange =
    estimatedYesterdayProductTotal === 0
      ? 0
      : ((productTotal - estimatedYesterdayProductTotal) /
          estimatedYesterdayProductTotal) *
        100;

  // Other metrics (already handled)
  const soldTotal = orders.reduce(
    (sum, o) =>
      sum + o.orderItems.reduce((s, item) => s + item.qty * item.price, 0),
    0
  );

  const todayOrders = orders.filter((o) => o.createdAt >= today);
  const todaySold = todayOrders.reduce(
    (sum, o) => sum + o.orderItems.reduce((s, i) => s + i.qty * i.price, 0),
    0
  );

  const soldChange =
    soldYesterdayTotal === 0
      ? todaySold > 0
        ? 100
        : 0
      : ((todaySold - soldYesterdayTotal) / soldYesterdayTotal) * 100;

  const returnedTotal = returns.reduce(
    (sum, r) => sum + (r.totalValue || 0),
    0
  );

  const todayReturns = returns.filter((r) => r.returnedAt >= today);
  const yesterdayReturns = returns.filter(
    (r) => r.returnedAt >= yesterday && r.returnedAt < today
  );

  const todayRefundTotal = todayReturns.reduce(
    (sum, r) => sum + (r.totalValue || 0),
    0
  );
  const yesterdayRefundTotal = yesterdayReturns.reduce(
    (sum, r) => sum + (r.totalValue || 0),
    0
  );

  const refundChange =
    yesterdayRefundTotal === 0
      ? todayRefundTotal > 0
        ? 100
        : 0
      : ((todayRefundTotal - yesterdayRefundTotal) / yesterdayRefundTotal) *
        100;

  const shippedTotal = orders
    .filter((o) => o.status === "Shipped")
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const shippedTodayTotal = todayOrders
    .filter((o) => o.status === "Shipped")
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const shippedYesterdayTotal = yesterdayOrders
    .filter((o) => o.status === "Shipped")
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const shippedChange =
    shippedYesterdayTotal === 0
      ? shippedTodayTotal > 0
        ? 100
        : 0
      : ((shippedTodayTotal - shippedYesterdayTotal) / shippedYesterdayTotal) *
        100;

  res.json({
    productTotal,
    soldTotal,
    returnedTotal,
    shippedTotal,
    refundChange,
    soldChange,
    shippedChange,
    productChange,
  });
});
