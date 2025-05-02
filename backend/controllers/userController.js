// backend/controllers/userController.js
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Order from '../models/orderModel.js';
import generateToken from "../utils/generateToken.js";

/* ─────────────────────────────────────────────
   tiny helper – ≥6 chars & ≥1 digit
──────────────────────────────────────────── */
const strongPassword = (pwd = "") => /^(?=.*\d).{6,}$/.test(pwd);

/* ─────────────  REGISTER  ───────────── */
export const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, whatAppNumber, email, password } = req.body;

  if (!strongPassword(password)) {
    res.status(400);
    throw new Error(
      "Password must be at least 6 characters and contain at least 1 number"
    );
  }

  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    firstName,
    lastName,
    whatAppNumber,
    email: email.toLowerCase(),
    password,
    userType: "Customer", // ✅ default role
    profileImage:
      req.body.profileImage ||
      `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(
        firstName + lastName
      )}`,
  });

  const token = generateToken(user._id);

  res
    .status(201)
    .cookie("algomianToken", token, cookieOpts)
    .json({ ...safeUser(user), token });
});

/* ─────────────  LOGIN  ───────────── */
export const authUser = asyncHandler(async (req, res) => {
  const { identifier = "", password } = req.body;

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { whatAppNumber: identifier }],
  });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user._id);
  res
    .cookie("algomianToken", token, cookieOpts)
    .json({ ...safeUser(user), token });
});

/* ————————————————— GET PROFILE ———————————————— */
export const getUserProfile = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

/* ————————————————— UPDATE PROFILE ————————————— */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  Object.assign(user, {
    firstName: req.body.firstName ?? user.firstName,
    lastName: req.body.lastName ?? user.lastName,
    whatAppNumber: req.body.whatAppNumber ?? user.whatAppNumber,
    email: req.body.email?.toLowerCase() ?? user.email,
    profileImage: req.body.profileImage ?? user.profileImage,
    jobTitle: req.body.jobTitle ?? user.jobTitle,
    userType: req.body.userType ?? user.userType, // ✅ allow change in dashboard
  });

  if (req.body.password) {
    if (!strongPassword(req.body.password)) {
      res.status(400);
      throw new Error("Weak password");
    }
    user.password = req.body.password;
  }

  const saved = await user.save();

  res.cookie("algomianToken", generateToken(saved._id), cookieOpts);
  res.json(safeUser(saved));
});

export const getCustomersList = asyncHandler(async (req, res) => {
  const customers = await User.find({ userType: 'Customer' })
    .select('-password'); // exclude password
  res.json(customers);
});

// export const getCustomers = asyncHandler(async (req, res) => {
//   const customers = await User.find({ userType: 'Customer' })
//     .populate({
//       path: 'orders',
//       select: 'createdAt status',
//       options: { sort: { createdAt: -1 } }, // Sort orders by creation date descending
//     });

//   const customerSummaries = customers.map((customer) => {
//     const totalOrders = customer.orders.length;
//     const lastOrder = customer.orders[0]; // Since orders are sorted descending
//     return {
//       _id: customer._id,
//       firstName: customer.firstName,
//       lastName: customer.lastName,
//       email: customer.email,
//       whatAppNumber: customer.whatAppNumber,
//       totalOrders,
//       lastOrderDate: lastOrder ? lastOrder.createdAt : null,
//       status: lastOrder ? lastOrder.status : null,
//     };
//   });

//   res.json(customerSummaries);

//   const enriched = customers.map((c) => {
//     const sortedOrders = [...(c.orders || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//     return {
//       ...c,
//       totalOrders: c.orders?.length || 0,
//       lastOrderDate: sortedOrders[0]?.createdAt || null,
//       status: sortedOrders[0]?.status || null,
//     };
//   });

//   res.json(enriched);
// });

export const getCustomers = asyncHandler(async (req, res) => {
  const customers = await User.find({ userType: "Customer" })
    .populate({
      path: "orders",
      select: "createdAt status",
      options: { sort: { createdAt: -1 } }, // latest order first
    });

  const customerSummaries = customers.map((customer) => {
    const totalOrders = customer.orders?.length || 0;
    const lastOrder = customer.orders?.[0];

    return {
      _id: customer._id,
      firstName: customer.firstName || "Unnamed",
      lastName: customer.lastName || "-",
      email: customer.email || "N/A",
      whatAppNumber: customer.whatAppNumber || "N/A",
      totalOrders,
      lastOrderDate: lastOrder?.createdAt || null,
      status: lastOrder?.status || null,
    };
  });

  res.status(200).json(customerSummaries);
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new Error("User not found");
  res.json(user);
});

export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.params.id });
  res.json(orders);
});
/* ─────────────────────────────────────────────
   helpers
──────────────────────────────────────────── */
const safeUser = (u) => ({
  _id: u._id,
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  userType: u.userType,
  profileImage: u.profileImage,
  jobTitle: u.jobTitle,
});

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};
