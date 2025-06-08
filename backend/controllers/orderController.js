import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js"; // ✅ Add this
import Product from "../models/productModel.js";
import crypto from "crypto";
import { ALL_PERMISSIONS } from "../constants/permissions.js";
import { PERM } from "../constants/permKeys.js"; // 👈 REQUIRED!


import { PassThrough } from "stream";

const hasChangeStream = () => {
  // mongoose.connection.db.topology.s.hosts exists only on repl-set
  return !!mongoose.connection?.db?.topology?.s?.hosts;
};
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
        baseRam: prod.baseRam ?? "",
        baseStorage: prod.baseStorage ?? "",
        baseCPU: prod.baseCPU ?? "",
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
  const orders = await Order.find({ user: req.user._id }).populate(
    "user",
    "firstName lastName"
  );
  res.json(orders);
});

/**
 * @desc   Get order by ID
 * @route  GET /api/orders/:id
 * @access Private (user can only fetch their own) / Admin can fetch any
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "firstName lastName email"
  );
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const canSee =
    req.user._id.equals(order.user) ||
    ["Admin", "Manager", "SalesRep", "Logistics"].includes(req.user.userType);

  // enforce ownership
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    !req.perms?.includes(PERM.ORDER_MANAGE) &&
    !canSee
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
  if (req.body.orderItems) {
    order.orderItems = req.body.orderItems.map((l) => ({
      ...l, // qty / price / etc.
      baseRam: l.baseRam ?? "", // tolerate partial payloads
      baseStorage: l.baseStorage ?? "",
      baseCPU: l.baseCPU ?? "",
    }));
  }
  order.status = status || order.status;
  order.isPaid = isPaid ?? order.isPaid;
  order.paidAt = isPaid ? Date.now() : order.paidAt;
  order.isDelivered = isDelivered ?? order.isDelivered;
  order.deliveredAt = isDelivered ? Date.now() : order.deliveredAt;

  const updated = await order.save();
  res.json(updated);
});

export const updateOrderDetails = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  /* ---------- items ---------- */
  if (Array.isArray(req.body.orderItems)) {
    order.orderItems = req.body.orderItems.map((incoming) => {
      const prev = order.orderItems.find(
        (l) => l.product.toString() === incoming.product.toString()
      );

      /* keep mandatory fields from DB when the client omits them */
      return {
        ...prev?._doc, // name, maxQty, image …
        ...incoming, // qty, price, specs (may overwrite)
        name: incoming.name ?? prev?.name ?? "",
        maxQty: incoming.maxQty ?? prev?.maxQty ?? 0,
      };
    });
  }

  /* ---------- address / POS ---------- */
  if (req.body.shippingAddress)
    order.shippingAddress = {
      ...order.shippingAddress,
      ...req.body.shippingAddress,
    };

  if (req.body.pointOfSale !== undefined)
    order.pointOfSale = req.body.pointOfSale;

  const saved = await order.save();
  res.json(saved);
});

/**
 * @desc   Admin: get all orders
 * @route  GET /api/orders
 * @access Private/Admin
 */
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "firstName lastName");
  res.json(orders);
});

export const deleteOrder = async (id) => {
  const confirmed = window.confirm("Really delete this order?");
  if (!confirmed) return;

  try {
    await api.delete(`/api/orders/${id}`, { withCredentials: true });
    setOrders((prev) => prev.filter((order) => order._id !== id));
  } catch (err) {
    alert(
      "Failed to delete order: " + (err.response?.data?.message || err.message)
    );
  } finally {
    setActionsOpenFor(null); // close dropdown after action
  }
};

export const getNewOrdersCount = asyncHandler(async (req, res) => {
  let { since } = req.query;

  // tolerate bad / missing ISO
  const sinceDate = isNaN(Date.parse(since)) ? new Date(0) : new Date(since);

  const count = await Order.countDocuments({ createdAt: { $gt: sinceDate } });
  res.json({ count }); // never throws – always JSON
});

export const streamNewOrders = asyncHandler(async (req, res) => {
  if (!hasChangeStream()) {
    // keep the connection open ≈ empty event stream
    res
      .set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      })
      .flushHeaders();
    res.write(`event: unsupported\ndata: {}\n\n`);
    return; // 👈 nothing else, avoids 500
  }

  res
    .set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    })
    .flushHeaders();

  const change = Order.watch([{ $match: { operationType: "insert" } }]);
  change.on("change", (doc) => {
    res.write(
      `data: ${JSON.stringify({
        id: doc.fullDocument._id,
        createdAt: doc.fullDocument.createdAt,
        status: doc.fullDocument.status,
        total: doc.fullDocument.totalPrice,
      })}\n\n`
    );
  });

  req.on("close", () => {
    change.close().catch(() => {});
    res.end();
  });
});

/* ─────────────  APPROVE SALE  ─────────────
   PATCH  /api/orders/:id/approve
   Body   { note?: string }
   Needs  "sale.approve" permission
───────────────────────────────────────────*/
export const approveSale = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // only approve once
  if (order.isApproved) {
    return res.json({ message: "Order already approved" });
  }

  order.isApproved = true;
  order.approvedBy = req.user._id;
  order.approvedAt = new Date();
  order.approveNote = req.body.note || "";

  await order.save();
  res.json({ message: "Sale approved", order });
});
