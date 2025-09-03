import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js"; // ✅ Add this
import Product from "../models/productModel.js";
import crypto from "crypto";
import { ALL_PERMISSIONS } from "../constants/permissions.js";
import { PERM } from "../constants/permKeys.js"; // 👈 REQUIRED!
import { sendWhatsApp } from "../utils/sendWhatsApp.js";

import { PassThrough } from "stream";

// const hasChangeStream = () => {
//   // mongoose.connection.db.topology.s.hosts exists only on repl-set
//   return !!mongoose.connection?.db?.topology?.s?.hosts;
// };
/**
 * @desc   Create new order
 * @route  POST /api/orders
 * @access Private
 */

// const makeOrderLine = async (src) => {
//   const prod = await Product.findById(src.product);
//   if (!prod) throw new Error(`Product not found: ${src.product}`);
//   if (prod.quantity < src.qty)
//     throw new Error(
//       `Insufficient stock for ${prod.productName} – have ${prod.quantity}`
//     );

//   return {
//     product: prod._id,
//     name: prod.productName,

//     baseRam: src.baseRam ?? "",
//     baseStorage: src.baseStorage ?? "",
//     baseCPU: src.baseCPU ?? "",

//     /* array of {label,cost} coming from UI */
//     variantSelections: Array.isArray(src.variantSelections)
//       ? src.variantSelections.map((v) => ({
//           label: v.label || "",
//           cost: Number(v.cost) || 0,
//         }))
//       : [],

//     qty: src.qty,
//     price: src.price,
//     image: prod.images?.[0] || "",
//     maxQty: prod.quantity,
//   };
// };

// export const addOrderItems = asyncHandler(async (req, res) => {
//   const {
//     orderItems = [],
//     shippingAddress = {},
//     paymentMethod,
//     orderType = "sale",
//     isPaid = true,
//     shippingPrice = 0,
//     taxPrice = 0,
//     pointOfSale,
//     selectedCustomerId,
//     customerName,
//     customerPhone,
//     deliveryMethod = "self",
//     parkLocation = "",
//     referralId,
//     referralName,
//     referralPhone,
//     receiverName = "",
//     receiverPhone = "",
//     receiptName = "",
//     receiptAmount = 0,
//     deliveryNote = "",
//     deliveryPaid = true,
//   } = req.body;

//   if (!orderItems || orderItems.length === 0) {
//     res.status(400);
//     throw new Error("No order items provided");
//   }
//   /* ───── explode every line (validates stock) ───── */
//   const detailedItems = await Promise.all(orderItems.map(makeOrderLine));
//   // const trackingId = crypto.randomBytes(4).toString("hex").toUpperCase();

//   let userId = req.user._id;
//   if (selectedCustomerId) {
//     const customer = await User.findById(selectedCustomerId);
//     if (!customer || customer.userType !== "Customer") {
//       res.status(400);
//       throw new Error("Invalid customer ID");
//     }
//     userId = customer._id;
//   } else if (customerName && customerPhone) {
//     const existingUser = await User.findOne({ whatAppNumber: customerPhone });

//     if (existingUser) {
//       userId = existingUser._id;
//     } else {
//       const [firstName, ...rest] = customerName.trim().split(" ");
//       const lastName = rest.join(" ") || "-";

//       const newCustomer = await User.create({
//         firstName: firstName || "Unnamed",
//         lastName: lastName || "-",
//         whatAppNumber: customerPhone,
//         email: `${customerPhone}@generated.com`,
//         password: customerPhone + "123",
//         userType: "Customer",
//       });

//       userId = newCustomer._id;
//     }
//   }

//   /* ----- referral: optional ----- */
//   let refUserId = null;
//   if (referralId) {
//     refUserId = referralId;
//   } else if (referralName && referralPhone) {
//     const existingRef = await User.findOne({ whatAppNumber: referralPhone });
//     if (existingRef) {
//       refUserId = existingRef._id;
//     } else {
//       const [first, ...rest] = referralName.trim().split(" ");
//       const newRef = await User.create({
//         firstName: first || "Ref",
//         lastName: rest.join(" ") || "-",
//         email: `${referralPhone}@ref.generated`,
//         password: referralPhone + "123",
//         userType: "Customer",
//         whatAppNumber: referralPhone,
//       });
//       refUserId = newRef._id;
//     }
//   }

//   /* money (base price + ALL variant costs) */
//   const itemsPrice = detailedItems.reduce(
//     (s, it) =>
//       s +
//       it.qty *
//         (it.price + it.variantSelections.reduce((p, v) => p + v.cost, 0)),
//     0
//   );

//   const items = Number(itemsPrice || 0);
//   const tax = Number(taxPrice || 0);
//   const shipping = Number(shippingPrice || 0);
//   const includeShipping = deliveryPaid ? shipping : 0;

//   const totalPrice = items + tax + includeShipping;
//   // const totalPrice = itemsPrice + Number(shippingPrice) + Number(taxPrice);

//   const base = {
//     trackingId: crypto.randomBytes(4).toString("hex").toUpperCase(),
//     user: userId,
//     referral: refUserId, // <— store reference
//     referralName: referralName || "", // keep raw text, useful for history
//     referralPhone: referralPhone || "",
//     pointOfSale,
//     orderItems: detailedItems,
//     shippingAddress,
//     itemsPrice,
//     shippingPrice,
//     taxPrice,
//     totalPrice,
//     deliveryMethod,
//     receiverName,
//     receiverPhone,
//     receiptName,
//     receiptAmount,
//     deliveryNote,
//     deliveryPaid,
//   };

//   // ─── specialise ────────────────────────────────
//   let doc;
//   if (orderType === "invoice") {
//     doc = {
//       ...base,
//       status: "Invoice",
//       isPaid: false,
//       paymentMethod: undefined, // not needed yet
//     };
//   } else {
//     doc = { ...base, paymentMethod };
//   }

//   // const order = await Order.create({
//   //   trackingId: crypto.randomBytes(4).toString("hex").toUpperCase(),
//   //   user: userId,
//   //   referral: refUserId, // <— store reference
//   //   referralName: referralName || "", // keep raw text, useful for history
//   //   referralPhone: referralPhone || "",
//   //   pointOfSale,
//   //   orderItems: detailedItems,
//   //   shippingAddress,
//   //   paymentMethod: isPaid ? paymentMethod : undefined,
//   //   isPaid,
//   //   itemsPrice,
//   //   shippingPrice,
//   //   taxPrice,
//   //   totalPrice,
//   // });

//   const order = await Order.create(doc);

//   const createdOrder = await order.save();

//   /* ───── WhatsApp notification (fire-and-forget) ───── */
//   (async () => {
//     try {
//       if (customerPhone) {
//         // normalise: 07067…  →  2347067…
//         const msisdn = customerPhone
//           .replace(/^0/, "234") // NG specific, tweak for other CCs
//           .replace(/\D/g, "");

//         const msg = [
//           `Hello ${customerName || "Customer"},`,
//           ``,
//           `Your order *${createdOrder.trackingId}* has been received ✅`,
//           `Status : ${createdOrder.status}`,
//           `Delivery: ${
//             deliveryMethod === "logistics"
//               ? `Logistics — ${shippingAddress.address}`
//               : deliveryMethod === "park"
//                 ? `Park Pick-Up — ${parkLocation}`
//                 : "Self Pick-Up"
//           }`,
//           `Total  : ₦${createdOrder.totalPrice.toLocaleString()}`,
//           ``,
//           `Thank you for shopping with us!`,
//         ].join("\n");

//         await sendWhatsApp({ to: msisdn, body: msg });
//       }
//     } catch (err) {
//       console.error("⚠️ WhatsApp message failed:", err.message);
//       // never block order creation – just log
//     }
//   })();

//   // Link to user
//   const linkedUser = await User.findById(userId);
//   if (linkedUser && Array.isArray(linkedUser.orders)) {
//     linkedUser.orders.push(createdOrder._id);
//     await linkedUser.save();
//   }

//   // Reduce stock and collect low stock warnings
//   const lowStockWarnings = [];

//   await Promise.all(
//     detailedItems.map(async (item) => {
//       const product = await Product.findById(item.product);
//       product.quantity -= item.qty;

//       if (product.quantity <= product.reorderLevel) {
//         product.availability = "restocking";
//         lowStockWarnings.push(
//           `⚠️ ${product.productName} is low on stock (${product.quantity} left)`
//         );
//       }

//       await product.save();
//     })
//   );

//   res.status(201).json({
//     message: "Order placed successfully",
//     order: createdOrder,
//     lowStockWarnings,
//   });
// });

// /**
//  * @desc   Get logged in user's orders
//  * @route  GET /api/orders/myorders
//  * @access Private
//  */

// export const getMyOrders = asyncHandler(async (req, res) => {
//   const orders = await Order.find({ user: req.user._id }).populate(
//     "user",
//     "firstName lastName"
//   );
//   res.json(orders);
// });

const hasChangeStream = () => {
  return !!mongoose.connection?.db?.topology?.s?.hosts;
};

// /* explode a requested order line into a stored line */
// const makeOrderLine = async (src) => {
//   const prod = await Product.findById(src.product);
//   if (!prod) throw new Error(`Product not found: ${src.product}`);
//   if (prod.quantity < src.qty)
//     throw new Error(
//       `Insufficient stock for ${prod.productName} – have ${prod.quantity}`
//     );

//   return {
//     product: prod._id,
//     name: prod.productName,
//     baseRam: src.baseRam ?? "",
//     baseStorage: src.baseStorage ?? "",
//     baseCPU: src.baseCPU ?? "",
//     variantSelections: Array.isArray(src.variantSelections)
//       ? src.variantSelections.map((v) => ({
//           label: v.label || "",
//           cost: Number(v.cost) || 0,
//         }))
//       : [],
//     qty: src.qty,
//     price: src.price,
//     image: prod.images?.[0] || "",
//     maxQty: prod.quantity,
//   };
// };

// export const addOrderItems = asyncHandler(async (req, res) => {
//   const {
//     orderItems = [],
//     shippingAddress = {},
//     paymentMethod,
//     orderType = "sale",
//     isPaid = true,
//     shippingPrice = 0,
//     taxPrice = 0,
//     pointOfSale,
//     selectedCustomerId,
//     customerName = "",
//     customerPhone = "",
//     deliveryMethod = "self",
//     parkLocation = "",
//     referralId,
//     referralName,
//     referralPhone,
//     receiverName = "",
//     receiverPhone = "",
//     receiptName = "",
//     receiptAmount = 0,
//     deliveryNote = "",
//     deliveryPaid = true,
//   } = req.body;

//   if (!orderItems || orderItems.length === 0) {
//     res.status(400);
//     throw new Error("No order items provided");
//   }

//   const detailedItems = await Promise.all(orderItems.map(makeOrderLine));

//   // Pick the customer to link (if any)
//   let userId = req.user._id; // will be overwritten when we have a real customer
//   if (selectedCustomerId) {
//     const customer = await User.findById(selectedCustomerId);
//     if (!customer || customer.userType !== "Customer") {
//       res.status(400);
//       throw new Error("Invalid customer ID");
//     }
//     userId = customer._id;
//   } else if (customerName && customerPhone) {
//     const existingUser = await User.findOne({ whatAppNumber: customerPhone });
//     if (existingUser) {
//       userId = existingUser._id;
//     } else {
//       const [firstName, ...rest] = customerName.trim().split(" ");
//       const lastName = rest.join(" ") || "-";
//       const newCustomer = await User.create({
//         firstName: firstName || "Unnamed",
//         lastName: lastName || "-",
//         whatAppNumber: customerPhone,
//         email: `${customerPhone}@generated.com`,
//         password: customerPhone + "123",
//         userType: "Customer",
//       });
//       userId = newCustomer._id;
//     }
//   }

//   /* money */
//   const itemsPrice = detailedItems.reduce(
//     (s, it) =>
//       s +
//       it.qty *
//         (it.price + it.variantSelections.reduce((p, v) => p + v.cost, 0)),
//     0
//   );
//   const items = Number(itemsPrice || 0);
//   const tax = Number(taxPrice || 0);
//   const shipping = Number(shippingPrice || 0);
//   const includeShipping = deliveryPaid ? shipping : 0;
//   const totalPrice = items + tax + includeShipping;

//   const base = {
//     trackingId: crypto.randomBytes(4).toString("hex").toUpperCase(),
//     user: userId, // linked customer (if any)
//     customerName, // NEW: always store what was typed
//     customerPhone, // NEW
//     createdBy: req.user._id, // NEW: who created the sale
//     referral: null,
//     referralName: referralName || "",
//     referralPhone: referralPhone || "",
//     pointOfSale,
//     orderItems: detailedItems,
//     shippingAddress,
//     itemsPrice,
//     shippingPrice,
//     taxPrice,
//     totalPrice,
//     deliveryMethod,
//     receiverName,
//     receiverPhone,
//     receiptName,
//     receiptAmount,
//     deliveryNote,
//     deliveryPaid,
//   };

//   // optional referral linking
//   if (referralId) {
//     base.referral = referralId;
//   } else if (referralName && referralPhone) {
//     const existingRef = await User.findOne({ whatAppNumber: referralPhone });
//     if (existingRef) {
//       base.referral = existingRef._id;
//     } else {
//       const [first, ...rest] = referralName.trim().split(" ");
//       const newRef = await User.create({
//         firstName: first || "Ref",
//         lastName: rest.join(" ") || "-",
//         email: `${referralPhone}@ref.generated`,
//         password: referralPhone + "123",
//         userType: "Customer",
//         whatAppNumber: referralPhone,
//       });
//       base.referral = newRef._id;
//     }
//   }

//   const doc =
//     orderType === "invoice"
//       ? { ...base, status: "Invoice", isPaid: false, paymentMethod: undefined }
//       : { ...base, paymentMethod };

//   const order = await Order.create(doc);
//   const createdOrder = await order.save();

//   // WhatsApp fire-and-forget (unchanged)
//   (async () => {
//     try {
//       if (customerPhone) {
//         const msisdn = customerPhone.replace(/^0/, "234").replace(/\D/g, "");
//         const msg = [
//           `Hello ${customerName || "Customer"},`,
//           ``,
//           `Your order *${createdOrder.trackingId}* has been received ✅`,
//           `Status : ${createdOrder.status}`,
//           `Delivery: ${
//             deliveryMethod === "logistics"
//               ? `Logistics — ${shippingAddress.address}`
//               : deliveryMethod === "park"
//                 ? `Park Pick-Up — ${parkLocation}`
//                 : "Self Pick-Up"
//           }`,
//           `Total  : ₦${createdOrder.totalPrice.toLocaleString()}`,
//           ``,
//           `Thank you for shopping with us!`,
//         ].join("\n");
//         await sendWhatsApp({ to: msisdn, body: msg });
//       }
//     } catch (err) {
//       console.error("⚠️ WhatsApp message failed:", err.message);
//     }
//   })();

//   // Link order to user (if it's genuinely a customer)
//   const linkedUser = await User.findById(userId);
//   if (linkedUser && Array.isArray(linkedUser.orders)) {
//     linkedUser.orders.push(createdOrder._id);
//     await linkedUser.save();
//   }

//   // Stock updates (unchanged)
//   const lowStockWarnings = [];
//   await Promise.all(
//     detailedItems.map(async (item) => {
//       const product = await Product.findById(item.product);
//       product.quantity -= item.qty;
//       if (product.quantity <= product.reorderLevel) {
//         product.availability = "restocking";
//         lowStockWarnings.push(
//           `⚠️ ${product.productName} is low on stock (${product.quantity} left)`
//         );
//       }
//       await product.save();
//     })
//   );

//   res.status(201).json({
//     message: "Order placed successfully",
//     order: createdOrder,
//     lowStockWarnings,
//   });
// });

const makeOrderLine = async (src) => {
  const prod = await Product.findById(src.product);
  if (!prod) throw new Error(`Product not found: ${src.product}`);
  if (prod.quantity < src.qty) {
    throw new Error(
      `Insufficient stock for ${prod.productName} – have ${prod.quantity}`
    );
  }
  return {
    product: prod._id,
    name: prod.productName,
    baseRam: src.baseRam ?? "",
    baseStorage: src.baseStorage ?? "",
    baseCPU: src.baseCPU ?? "",
    variantSelections: Array.isArray(src.variantSelections)
      ? src.variantSelections.map((v) => ({
          label: v.label || "",
          cost: Number(v.cost) || 0,
        }))
      : [],
    qty: src.qty,
    price: src.price,
    image: prod.images?.[0] || "",
    maxQty: prod.quantity,
  };
};

const slug = (s = "") =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Create new order (auto-create/link customer even when only name is given)
 * POST /api/orders
 */
export const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems = [],
    shippingAddress = {},
    paymentMethod,
    orderType = "sale",
    isPaid = true,
    shippingPrice = 0,
    taxPrice = 0,
    pointOfSale,

    // from UI (always send current inputs)
    selectedCustomerId,
    customerName = "",
    customerPhone = "",
    customerEmail = "",

    // delivery / referral / meta
    deliveryMethod = "self",
    parkLocation = "",
    referralId,
    referralName,
    referralPhone,
    receiverName = "",
    receiverPhone = "",
    receiptName = "",
    receiptAmount = 0,
    deliveryNote = "",
    deliveryPaid = true,
  } = req.body;

  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items provided");
  }

  // Build & validate lines
  const detailedItems = await Promise.all(orderItems.map(makeOrderLine));

  // ---------------- Determine / ensure a customer ----------------
  let userDoc = null;

  if (selectedCustomerId) {
    const existing = await User.findById(selectedCustomerId);
    if (!existing || existing.userType !== "Customer") {
      res.status(400);
      throw new Error("Invalid customer ID");
    }
    userDoc = existing;
  } else {
    // Try find by phone/email, else create by name
    let found =
      (customerPhone &&
        (await User.findOne({ whatAppNumber: customerPhone }))) ||
      (customerEmail &&
        (await User.findOne({ email: String(customerEmail).toLowerCase() })));

    if (found) {
      userDoc = found;
    } else if (customerName.trim()) {
      const [firstName, ...rest] = customerName.trim().split(/\s+/);
      const lastName = rest.join(" ") || "-";
      const tag = crypto.randomBytes(3).toString("hex");

      const emailToUse = String(customerEmail || "").trim()
        ? String(customerEmail).toLowerCase()
        : `${slug(firstName + "-" + lastName) || "customer"}.${tag}@cust.generated`;

      const phoneToUse = customerPhone || `N/A-${tag}`;

      userDoc = await User.create({
        firstName: firstName || "Unnamed",
        lastName,
        whatAppNumber: phoneToUse,
        email: emailToUse,
        password: `Temp${tag}9`,
        userType: "Customer",
      });
    } else {
      // fallback: link the order to the actor so it can still be saved
      userDoc = await User.findById(req.user._id);
    }
  }

  // ---------------- If cashier edited details, update the customer ----------------
  try {
    if (userDoc && userDoc.userType === "Customer") {
      const updates = {};
      // name
      if (customerName.trim()) {
        const [f, ...r] = customerName.trim().split(/\s+/);
        const ln = r.join(" ") || "-";
        if (f && f !== userDoc.firstName) updates.firstName = f;
        if (ln && ln !== userDoc.lastName) updates.lastName = ln;
      }
      // phone (skip if taken by someone else)
      if (customerPhone && customerPhone !== userDoc.whatAppNumber) {
        const phoneTaken = await User.findOne({
          whatAppNumber: customerPhone,
          _id: { $ne: userDoc._id },
        });
        if (!phoneTaken) updates.whatAppNumber = customerPhone;
      }
      // email (lowercase; skip if taken)
      const normEmail = (customerEmail || "").trim().toLowerCase();
      if (normEmail && normEmail !== userDoc.email) {
        const emailTaken = await User.findOne({
          email: normEmail,
          _id: { $ne: userDoc._id },
        });
        if (!emailTaken) updates.email = normEmail;
      }

      if (Object.keys(updates).length) {
        Object.assign(userDoc, updates);
        await userDoc.save();
      }
    }
  } catch (e) {
    // Never block the sale because of a profile update hiccup
    console.warn("Customer profile update skipped:", e.message);
  }

  const userId = userDoc?._id;

  // ---------------- Totals ----------------
  const itemsPrice = detailedItems.reduce(
    (s, it) =>
      s +
      it.qty *
        (it.price + it.variantSelections.reduce((p, v) => p + v.cost, 0)),
    0
  );
  const items = Number(itemsPrice || 0);
  const tax = Number(taxPrice || 0);
  const shipping = Number(shippingPrice || 0);
  const includeShipping = deliveryPaid ? shipping : 0;
  const totalPrice = items + tax + includeShipping;

  // ---------------- Build order doc ----------------
  const base = {
    trackingId: crypto.randomBytes(4).toString("hex").toUpperCase(),
    user: userId,
    customerName, // keep what the cashier typed for the receipt
    customerPhone,
    createdBy: req.user._id,

    referral: null,
    referralName: referralName || "",
    referralPhone: referralPhone || "",

    pointOfSale,
    orderItems: detailedItems,

    shippingAddress,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,

    deliveryMethod,
    receiverName,
    receiverPhone,
    receiptName,
    receiptAmount,
    deliveryNote,
    deliveryPaid,
  };

  // Link/create referral if provided
  if (referralId) {
    base.referral = referralId;
  } else if (referralName && referralPhone) {
    let ref =
      (await User.findOne({ whatAppNumber: referralPhone })) ||
      (await User.findOne({ email: `${referralPhone}@ref.generated` }));
    if (!ref) {
      const [f, ...r] = referralName.trim().split(/\s+/);
      ref = await User.create({
        firstName: f || "Ref",
        lastName: r.join(" ") || "-",
        email: `${referralPhone}@ref.generated`.toLowerCase(),
        password: `Temp${crypto.randomBytes(2).toString("hex")}9`,
        userType: "Customer",
        whatAppNumber: referralPhone,
      });
    }
    base.referral = ref._id;
  }

  const doc =
    orderType === "invoice"
      ? { ...base, status: "Invoice", isPaid: false, paymentMethod: undefined }
      : { ...base, paymentMethod, isPaid };

  const order = await Order.create(doc);
  const createdOrder = await order.save();

  // Link order to customer's history
  if (userDoc && Array.isArray(userDoc.orders)) {
    userDoc.orders.push(createdOrder._id);
    await userDoc.save();
  }

  // Reduce stock & set restocking if needed
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

  // Optional: WhatsApp (kept simple)
  try {
    if (customerPhone) {
      const msisdn = customerPhone.replace(/^0/, "234").replace(/\D/g, "");
      const msg = [
        `Hello ${customerName || "Customer"},`,
        ``,
        `Your order *${createdOrder.trackingId}* has been received ✅`,
        `Status : ${createdOrder.status}`,
        `Total  : ₦${createdOrder.totalPrice.toLocaleString()}`,
        ``,
        `Thank you for shopping with us!`,
      ].join("\n");
      await sendWhatsApp({ to: msisdn, body: msg });
    }
  } catch (e) {
    console.error("WhatsApp message failed:", e.message);
  }

  res.status(201).json({
    message: "Order placed successfully",
    order: createdOrder,
    lowStockWarnings,
  });
});

/**
 * Create new order (auto-suggest/auto-create customer)
 * POST /api/orders
 */
// export const addOrderItems = asyncHandler(async (req, res) => {
//   const {
//     orderItems = [],
//     shippingAddress = {},
//     paymentMethod,
//     orderType = "sale",
//     isPaid = true,
//     shippingPrice = 0,
//     taxPrice = 0,
//     pointOfSale,

//     // 🔽 from UI
//     selectedCustomerId,
//     customerName = "",
//     customerPhone = "",
//     customerEmail = "",

//     // delivery / referral / meta
//     deliveryMethod = "self",
//     parkLocation = "",
//     referralId,
//     referralName,
//     referralPhone,
//     receiverName = "",
//     receiverPhone = "",
//     receiptName = "",
//     receiptAmount = 0,
//     deliveryNote = "",
//     deliveryPaid = true,
//   } = req.body;

//   if (!orderItems || orderItems.length === 0) {
//     res.status(400);
//     throw new Error("No order items provided");
//   }

//   // build lines (validates stock)
//   const detailedItems = await Promise.all(orderItems.map(makeOrderLine));

//   // ───────────────────────────────────────────
//   // 1) Determine/ensure the customer for this sale
//   // ───────────────────────────────────────────
//   let userId = req.user._id; // default to the logged-in user (will be overwritten)
//   if (selectedCustomerId) {
//     const customer = await User.findById(selectedCustomerId);
//     if (!customer || customer.userType !== "Customer") {
//       res.status(400);
//       throw new Error("Invalid customer ID");
//     }
//     userId = customer._id;
//   } else if (customerName && (customerPhone || customerEmail)) {
//     // try by phone, then by email
//     let customer =
//       (customerPhone &&
//         (await User.findOne({ whatAppNumber: customerPhone }))) ||
//       (customerEmail &&
//         (await User.findOne({ email: String(customerEmail).toLowerCase() })));

//     if (!customer) {
//       // create a new profile
//       const [firstName, ...rest] = customerName.trim().split(" ");
//       const lastName = rest.join(" ") || "-";
//       const emailToUse =
//         String(customerEmail || "").trim() ||
//         `${(customerPhone || "nouser").replace(/\D/g, "")}@generated.com`;

//       customer = await User.create({
//         firstName: firstName || "Unnamed",
//         lastName,
//         whatAppNumber: customerPhone || "",
//         email: emailToUse.toLowerCase(),
//         // simple default (hashed by userModel pre-save); you can swap to a truly random one if you prefer
//         password: (customerPhone || "Pass") + "123",
//         userType: "Customer",
//       });
//     }
//     userId = customer._id;
//   }
//   // else: if neither id nor enough info to create, we still save free-text below,
//   //       but link to the logged-in user as a fallback.

//   // ───────────────────────────────────────────
//   // 2) Money math
//   // ───────────────────────────────────────────
//   const itemsPrice = detailedItems.reduce(
//     (s, it) =>
//       s +
//       it.qty *
//         (it.price + it.variantSelections.reduce((p, v) => p + v.cost, 0)),
//     0
//   );
//   const items = Number(itemsPrice || 0);
//   const tax = Number(taxPrice || 0);
//   const shipping = Number(shippingPrice || 0);
//   const includeShipping = deliveryPaid ? shipping : 0;
//   const totalPrice = items + tax + includeShipping;

//   // Base doc persisted for all orders (we *always* keep what was typed)
//   const base = {
//     trackingId: crypto.randomBytes(4).toString("hex").toUpperCase(),
//     user: userId, // linked customer
//     customerName,
//     customerPhone,
//     createdBy: req.user._id,

//     referral: null,
//     referralName: referralName || "",
//     referralPhone: referralPhone || "",

//     pointOfSale,
//     orderItems: detailedItems,

//     shippingAddress,
//     itemsPrice,
//     shippingPrice,
//     taxPrice,
//     totalPrice,

//     deliveryMethod,
//     receiverName,
//     receiverPhone,
//     receiptName,
//     receiptAmount,
//     deliveryNote,
//     deliveryPaid,
//   };

//   // optional referral user linking
//   if (referralId) {
//     base.referral = referralId;
//   } else if (referralName && referralPhone) {
//     let ref =
//       (await User.findOne({ whatAppNumber: referralPhone })) ||
//       (await User.findOne({ email: `${referralPhone}@ref.generated` }));
//     if (!ref) {
//       const [first, ...rest] = referralName.trim().split(" ");
//       ref = await User.create({
//         firstName: first || "Ref",
//         lastName: rest.join(" ") || "-",
//         email: `${referralPhone}@ref.generated`.toLowerCase(),
//         password: (referralPhone || "Pass") + "123",
//         userType: "Customer",
//         whatAppNumber: referralPhone,
//       });
//     }
//     base.referral = ref._id;
//   }

//   // order kind
//   const doc =
//     orderType === "invoice"
//       ? { ...base, status: "Invoice", isPaid: false, paymentMethod: undefined }
//       : { ...base, paymentMethod, isPaid };

//   const order = await Order.create(doc);
//   const createdOrder = await order.save();

//   // Link order to the *customer* profile for history
//   const linkedUser = await User.findById(userId);
//   if (linkedUser && Array.isArray(linkedUser.orders)) {
//     linkedUser.orders.push(createdOrder._id);
//     await linkedUser.save();
//   }

//   // Stock adjustments (unchanged)
//   const lowStockWarnings = [];
//   await Promise.all(
//     detailedItems.map(async (item) => {
//       const product = await Product.findById(item.product);
//       product.quantity -= item.qty;
//       if (product.quantity <= product.reorderLevel) {
//         product.availability = "restocking";
//         lowStockWarnings.push(
//           `⚠️ ${product.productName} is low on stock (${product.quantity} left)`
//         );
//       }
//       await product.save();
//     })
//   );

//   // (Optional) WhatsApp fire-and-forget — keep your existing implementation
//   try {
//     if (customerPhone) {
//       const msisdn = customerPhone.replace(/^0/, "234").replace(/\D/g, "");
//       const msg = [
//         `Hello ${customerName || "Customer"},`,
//         ``,
//         `Your order *${createdOrder.trackingId}* has been received ✅`,
//         `Status : ${createdOrder.status}`,
//         `Total  : ₦${createdOrder.totalPrice.toLocaleString()}`,
//         ``,
//         `Thank you for shopping with us!`,
//       ].join("\n");
//       await sendWhatsApp({ to: msisdn, body: msg });
//     }
//   } catch (e) {
//     console.error("WhatsApp message failed:", e.message);
//   }

//   res.status(201).json({
//     message: "Order placed successfully",
//     order: createdOrder,
//     lowStockWarnings,
//   });
// });

/* get my orders (unchanged) */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate(
    "user",
    "firstName lastName"
  );
  res.json(orders);
});

/* order by id (populate createdBy so editor can use if needed) */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "firstName lastName email whatAppNumber")
    .populate("createdBy", "firstName lastName email");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const canSee =
    req.user._id.equals(order.user) ||
    ["Admin", "Manager", "SalesRep", "Logistics"].includes(req.user.userType);

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

/* admin list: populate both linked customer and sales rep */
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "firstName lastName")
    .populate("createdBy", "firstName");
  res.json(orders);
});

/* explode a requested order line into a stored line (unchanged) */
// const makeOrderLine = async (src) => {
//   const prod = await Product.findById(src.product);
//   if (!prod) throw new Error(`Product not found: ${src.product}`);
//   if (prod.quantity < src.qty) {
//     throw new Error(
//       `Insufficient stock for ${prod.productName} – have ${prod.quantity}`
//     );
//   }
//   return {
//     product: prod._id,
//     name: prod.productName,
//     baseRam: src.baseRam ?? "",
//     baseStorage: src.baseStorage ?? "",
//     baseCPU: src.baseCPU ?? "",
//     variantSelections: Array.isArray(src.variantSelections)
//       ? src.variantSelections.map((v) => ({
//           label: v.label || "",
//           cost: Number(v.cost) || 0,
//         }))
//       : [],
//     qty: src.qty,
//     price: src.price,
//     image: prod.images?.[0] || "",
//     maxQty: prod.quantity,
//   };
// };

/**
 * @desc   Get order by ID
 * @route  GET /api/orders/:id
 * @access Private (user can only fetch their own) / Admin can fetch any
 */
// export const getOrderById = asyncHandler(async (req, res) => {
//   const order = await Order.findById(req.params.id).populate(
//     "user",
//     "firstName lastName email"
//   );
//   if (!order) {
//     res.status(404);
//     throw new Error("Order not found");
//   }

//   const canSee =
//     req.user._id.equals(order.user) ||
//     ["Admin", "Manager", "SalesRep", "Logistics"].includes(req.user.userType);

//   // enforce ownership
//   if (
//     order.user._id.toString() !== req.user._id.toString() &&
//     !req.perms?.includes(PERM.ORDER_MANAGE) &&
//     !canSee
//   ) {
//     res.status(403);
//     throw new Error("Not allowed");
//   }
//   res.json(order);
// });

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

  if (isDelivered && status === "Delivered") {
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      product.baseSpecs = product.baseSpecs.map((spec) => {
        if (spec.assigned && item.serialNumbers?.includes(spec.serialNumber)) {
          return { ...spec, assigned: false }; // unassign spec
        }
        return spec;
      });

      await product.save();
    }
  }

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

  /* ---------- delivery + prices + flags ---------- */
  if (req.body.deliveryMethod) order.deliveryMethod = req.body.deliveryMethod;
  if (req.body.receiverName !== undefined)
    order.receiverName = req.body.receiverName;
  if (req.body.receiverPhone !== undefined)
    order.receiverPhone = req.body.receiverPhone;
  if (req.body.receiptName !== undefined)
    order.receiptName = req.body.receiptName;
  if (req.body.receiptAmount !== undefined)
    order.receiptAmount = Number(req.body.receiptAmount || 0);
  if (req.body.deliveryNote !== undefined)
    order.deliveryNote = req.body.deliveryNote;
  if (req.body.deliveryPaid !== undefined)
    order.deliveryPaid = !!req.body.deliveryPaid;

  if (req.body.itemsPrice !== undefined)
    order.itemsPrice = Number(req.body.itemsPrice || 0);
  if (req.body.taxPrice !== undefined)
    order.taxPrice = Number(req.body.taxPrice || 0);
  if (req.body.shippingPrice !== undefined)
    order.shippingPrice = Number(req.body.shippingPrice || 0);
  if (req.body.paymentMethod !== undefined)
    order.paymentMethod = req.body.paymentMethod || undefined;
  if (req.body.isPaid !== undefined) {
    order.isPaid = !!req.body.isPaid;
    order.paidAt = order.isPaid ? order.paidAt || Date.now() : undefined;
  }

  const items = Number(order.itemsPrice || 0);
  const tax = Number(order.taxPrice || 0);
  const shipping = Number(order.shippingPrice || 0);
  const includeShipping = order.deliveryPaid ? shipping : 0;
  order.totalPrice = items + tax + includeShipping;

  const saved = await order.save();
  res.json(saved);
});

/**
 * @desc   Admin: get all orders
 * @route  GET /api/orders
 * @access Private/Admin
 */
// export const getOrders = asyncHandler(async (req, res) => {
//   const orders = await Order.find({}).populate("user", "firstName lastName");
//   res.json(orders);
// });

export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  await order.deleteOne();
  res.json({ message: "Order deleted" });
});

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

export const verifyInventory = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const { items } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;

    let modified = false;

    product.baseSpecs = product.baseSpecs.map((spec) => {
      if (item.selectedSerials.includes(spec.serialNumber)) {
        if (!spec.assigned) {
          modified = true;
          return { ...spec, assigned: true };
        }
      }
      return spec;
    });

    if (modified) {
      product.quantity -= item.selectedSerials.length;
      await product.save();
    }

    const orderItem = order.orderItems.find(
      (i) => i.product.toString() === item.productId
    );

    if (orderItem) {
      // Optional: Keep legacy support if needed
      orderItem.serialNumbers = item.selectedSerials;

      const matchedSpecs = product.baseSpecs.filter((spec) =>
        item.selectedSerials.includes(spec.serialNumber)
      );

      orderItem.soldSpecs = matchedSpecs.map((spec) => ({
        serialNumber: spec.serialNumber,
        baseRam: spec.baseRam || "",
        baseStorage: spec.baseStorage || "",
        baseCPU: spec.baseCPU || "",
      }));
    }
  }

  order.status = "Processing";
  await order.save();

  res.json({
    message: "Inventory verified and order moved to Processing",
    order,
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
