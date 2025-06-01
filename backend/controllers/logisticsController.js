import asyncHandler from "express-async-handler";
import Logistics from "../models/logisticsModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";

/* ------------------------------------------------------------------ */
/*  POST /api/logistics  – Create or overwrite shipment for an order  */
/* ------------------------------------------------------------------ */
export const createShipment = asyncHandler(async (req, res) => {
  const {
    orderId,
    assignedTo, // may be undefined
    driverName = "", // NEW
    driverContact = "",
    shippingMethod,
    sendingPark,
    destinationPark,
    trackingId,
    dispatchDate,
    expectedDate,
  } = req.body;

  /* ––– make sure order exists ––– */
  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  /* ––– figure out “assignedTo” –––––––––––––––––––––––––––––––– */
  let assignee = assignedTo;
  if (!assignee && (driverName || driverContact)) {
    const normPhone = driverContact.replace(/\D/g, "");

    // a) reuse existing “Logistics” user
    const existing = await User.findOne({
      userType: "Logistics",
      $or: [{ whatAppNumber: normPhone }, { email: driverContact }],
    });

    // b) or create on-the-fly
    if (!existing) {
      const [firstName, ...rest] = driverName.trim().split(" ");
      const lastName = rest.join(" ") || "-";

      const slug = (firstName || "driver").toLowerCase();

      const newU = await User.create({
        firstName: firstName || "Driver",
        lastName,
        whatAppNumber: normPhone || driverContact,
        email: `${slug}AlgoLog@driver.gen`, // e.g. saniAlgoLog@driver.gen
        password: "AlgoLog",
        userType: "Logistics",
      });
      assignee = newU._id;
    } else assignee = existing._id;
  }

  /* ––– UPSERT shipment ––– */
  const logistic = await Logistics.findOneAndUpdate(
    { order: orderId },
    {
      order: orderId,
      assignedTo: assignee,
      driverName,
      shippingMethod,
      sendingPark,
      destinationPark,
      trackingId,
      driverContact,
      dispatchDate,
      expectedDate,
      status: "Processing",
      $addToSet: { timeline: { status: "Processing" } },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  /* ––– mark order as SHIPPED the first time a shipment is created ––– */
  if (order.status !== "Shipped") {
    order.status = "Shipped";
    order.shippedAt = new Date();
    order.logistics = logistic._id; // ⬅ optional: link back
    await order.save();
  }

  res.status(201).json(logistic);
});

/* ------------------------------------------------------------------ */
/*  GET /api/logistics/order/:orderId  – fetch shipment by order id   */
/* ------------------------------------------------------------------ */
export const getShipmentByOrder = asyncHandler(async (req, res) => {
  const shipment = await Logistics.findOne({
    order: req.params.orderId,
  }).populate("assignedTo", "firstName lastName");

  if (!shipment) {
    return res.status(204).end();
  }
  res.json(shipment);
});

/* ─ controllers/logisticsController.js ─────────────────────────── */
export const updateShipmentStatus = asyncHandler(async (req, res) => {
  // :orderId comes from the URL
  const { status } = req.body; // 'Processing' | 'RiderOnWay' | 'InTransit' | 'Delivered'
  const logistic = await Logistics.findOne({ order: req.params.orderId });
  if (!logistic) {
    res.status(404);
    throw new Error("Shipment not found");
  }

  // push timeline only when status really changes
  if (logistic.status !== status) {
    logistic.status = status;
    logistic.timeline.push({ status });
    await logistic.save();
  }

  /* if the shipment reached Delivered – also close the Order */
  if (status === "Delivered") {
    const order = await Order.findById(req.params.orderId);
    if (order && order.status !== "Delivered") {
      order.status = "Delivered";
      order.deliveredAt = new Date();
      await order.save();
    }
  }
  res.json(logistic);
});

export const updateDeliveryContact = asyncHandler(async (req, res) => {
  const { deliveryAddress, deliveryPhone, deliveryEmail } = req.body;

  const logistic = await Logistics.findOneAndUpdate(
    { order: req.params.orderId },
    {
      deliveryAddress,
      deliveryPhone,
      deliveryEmail,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.json(logistic);
});

export const driverLogist =  asyncHandler(async (req, res) => {
  const list = await Logistics
                 .find({ assignedTo: req.user._id })
                 .populate('order', 'trackingId status orderItems user shippingAddress');
  res.json(list);
})
