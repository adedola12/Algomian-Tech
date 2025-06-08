import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

import Return from "../models/returnModel.js"; // if you create a return log model

export const returnOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const returnItems = [];

  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    product.quantity += item.qty;

    if (Array.isArray(item.soldSpecs)) {
      product.baseSpecs.push(...item.soldSpecs);
    }

    await product.save();

    returnItems.push({
      product: item.product,
      productName: item.name,
      qty: item.qty,
      specs: item.soldSpecs,
    });
  }

  await Return.create({
    orderId: order._id,
    user: order.user,
    totalValue: order.totalPrice,
    returnedAt: new Date(),
    items: returnItems,
  });

  await order.deleteOne();

  res.json({ message: "Order returned and logged successfully." });
});

export const getReturns = asyncHandler(async (req, res) => {
  const returns = await Return.find()
    .populate("user", "firstName lastName")
    .sort({ returnedAt: -1 });

  res.json(returns);
});
