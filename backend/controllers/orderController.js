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


/**
 * @desc   Create new order
 * @route  POST /api/orders
 * @access Private
 */



// export const addOrderItems = asyncHandler(async (req, res) => {
//   const {
//     orderItems,
//     shippingAddress,
//     paymentMethod,
//     shippingPrice = 0,
//     taxPrice = 0,
//     pointOfSale,
//     selectedCustomerId,
//     customerName,
//     customerPhone,
//   } = req.body;

//   if (!orderItems || orderItems.length === 0) {
//     res.status(400);
//     throw new Error("No order items");
//   }

//   const trackingId = crypto.randomBytes(4).toString("hex").toUpperCase();

//   // 1) Build product lines
//   const detailedItems = await Promise.all(
//     orderItems.map(async (item) => {
//       const prod = await Product.findById(item.product);
//       if (!prod) {
//         res.status(400);
//         throw new Error(`Product not found: ${item.product}`);
//       }
//       return {
//         product: prod._id,
//         name: prod.productName,
//         qty: item.qty,
//         price: item.price,
//         image: prod.images?.[0] || "",
//         maxQty: prod.quantity,
//       };
//     })
//   );

//   // 2) Resolve or create customer user
//   let userId = req.user._id;

//   if (selectedCustomerId) {
//     const customer = await User.findById(selectedCustomerId);
//     if (!customer || customer.userType !== "Customer") {
//       res.status(400);
//       throw new Error("Invalid selected customer ID");
//     }
//     userId = customer._id;
//   } else if (customerName && customerPhone) {
//     const [firstName, ...rest] = customerName.trim().split(" ");
//     const lastName = rest.join(" ") || "-";

//     const existingUser = await User.findOne({ whatAppNumber: customerPhone });

//     if (existingUser) {
//       userId = existingUser._id;
//     } else {
//       const newCustomer = await User.create({
//         firstName,
//         lastName,
//         whatAppNumber: customerPhone,
//         email: `${customerPhone}@generated.com`,
//         password: customerPhone + "123",
//         userType: "Customer",
//       });
//       userId = newCustomer._id;
//     }
//   }

//   // 3) Price calculations
//   const itemsPrice = detailedItems.reduce(
//     (sum, item) => sum + item.qty * item.price,
//     0
//   );
//   const totalPrice = itemsPrice + Number(shippingPrice) + Number(taxPrice);

//   // 4) Create order
//   const order = new Order({
//     trackingId,
//     user: userId,
//     pointOfSale,
//     orderItems: detailedItems,
//     shippingAddress,
//     paymentMethod,
//     itemsPrice,
//     shippingPrice,
//     taxPrice,
//     totalPrice,
//   });

//   const createdOrder = await order.save();

//   // 5) Link order to user's orders list
//   await User.findByIdAndUpdate(userId, {
//     $push: { orders: createdOrder._id },
//   });

//   res.status(201).json(createdOrder);
// });

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

  // Build the detailed item list
  const detailedItems = await Promise.all(
    orderItems.map(async (item) => {
      const prod = await Product.findById(item.product);
      if (!prod) {
        res.status(400);
        throw new Error(`Product not found: ${item.product}`);
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

  // Determine user (customer)
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

  // Add order to user.orders array if field exists
  const linkedUser = await User.findById(userId);
  if (linkedUser && Array.isArray(linkedUser.orders)) {
    linkedUser.orders.push(createdOrder._id);
    await linkedUser.save();
  }

  res.status(201).json(createdOrder);
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
  // enforce ownership
  if (order.user._id.toString() !== req.user._id.toString() && !req.perms?.includes(PERM.ORDER_MANAGE)
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

export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  await order.remove();
  res.json({ message: "Order removed" });
});