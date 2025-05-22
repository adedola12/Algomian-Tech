import asyncHandler from "express-async-handler";
import Order        from '../models/orderModel.js';
import User from "../models/userModel.js"; // ✅ Add this
import Product      from "../models/productModel.js";
import crypto       from "crypto";

/**
 * @desc   Create new order
 * @route  POST /api/orders
 * @access Private
 */

export const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    shippingPrice = 0,
    taxPrice = 0,
    pointOfSale,
    selectedCustomerId,
    customerName,
    customerPhone,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items provided");
  }

  const trackingId = crypto.randomBytes(4).toString("hex").toUpperCase();

  const detailedItems = await Promise.all(
    orderItems.map(async (item) => {
      const prod = await Product.findById(item.product);
      if (!prod) {
        res.status(400);
        throw new Error(`Product not found: ${item.product}`);
      }
      if (prod.quantity < item.qty) {
        res.status(400);
        throw new Error(
          `Insufficient stock for ${prod.productName}. Available: ${prod.quantity}, Requested: ${item.qty}`
        );
      }
      return {
        product: prod._id,
        name: prod.productName,
        qty: item.qty,
        price: item.price,
        image: prod.images?.[0] || "",
        maxQty: prod.quantity,
      };
    })
  );

  let userId = req.user._id;
  if (selectedCustomerId) {
    const customer = await User.findById(selectedCustomerId);
    if (!customer || customer.userType !== "Customer") {
      res.status(400);
      throw new Error("Invalid customer ID");
    }
    userId = customer._id;
  } else if (customerName && customerPhone) {
    const existingUser = await User.findOne({ whatAppNumber: customerPhone });

    if (existingUser) {
      userId = existingUser._id;
    } else {
      const [firstName, ...rest] = customerName.trim().split(" ");
      const lastName = rest.join(" ") || "-";

      const newCustomer = await User.create({
        firstName: firstName || "Unnamed",
        lastName: lastName || "-",
        whatAppNumber: customerPhone,
        email: `${customerPhone}@generated.com`,
        password: customerPhone + "123",
        userType: "Customer",
      });

      userId = newCustomer._id;
    }
  }

  const itemsPrice = detailedItems.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );
  const totalPrice = itemsPrice + Number(shippingPrice) + Number(taxPrice);

  const order = new Order({
    trackingId,
    user: userId,
    pointOfSale,
    orderItems: detailedItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  const createdOrder = await order.save();

  // Link to user
  const linkedUser = await User.findById(userId);
  if (linkedUser && Array.isArray(linkedUser.orders)) {
    linkedUser.orders.push(createdOrder._id);
    await linkedUser.save();
  }

  // Reduce stock and collect low stock warnings
  const lowStockWarnings = [];

  await Promise.all(
    detailedItems.map(async (item) => {
      const product = await Product.findById(item.product);
      product.quantity -= item.qty;

      if (product.quantity <= product.reorderLevel) {
        product.availability = "restocking";
        lowStockWarnings.push(
          `⚠️ ${product.productName} is low on stock (${product.quantity} left)`
        );
      }

      await product.save();
    })
  );

  res.status(201).json({
    message: "Order placed successfully",
    order: createdOrder,
    lowStockWarnings,
  });
});


/**
 * @desc   Get logged in user's orders
 * @route  GET /api/orders/myorders
 * @access Private
 */



export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order
    .find({ user: req.user._id })
    .populate("user","firstName lastName")
  res.json(orders)
})


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

    const canSee =
       req.user._id.equals(order.user) ||
       ['Admin', 'Manager', 'SalesRep', 'Logistics'].includes(req.user.userType);

  // enforce ownership
  if (order.user._id.toString() !== req.user._id.toString() && !req.perms?.includes(PERM.ORDER_MANAGE) && !canSee
  ) {
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
  const orders = await Order
    .find({})
    .populate('user', 'firstName lastName');
  res.json(orders);
});

export const deleteOrder = async (id) => {
  const confirmed = window.confirm("Really delete this order?");
  if (!confirmed) return;

  try {
    await api.delete(`/api/orders/${id}`, { withCredentials: true });
    setOrders((prev) => prev.filter((order) => order._id !== id));
  } catch (err) {
    alert("Failed to delete order: " + (err.response?.data?.message || err.message));
  } finally {
    setActionsOpenFor(null);  // close dropdown after action
  }
};
