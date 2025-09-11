// backend/controllers/userController.js
import asyncHandler from "express-async-handler";
import AccessPolicy from "../models/accessPolicyModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import generateToken from "../utils/generateToken.js";
import { DEFAULT_PERMS_BY_TYPE } from "../utils/defaultPerms.js";

/* ─────────────────────────────────────────────
   tiny helper – ≥6 chars & ≥1 digit
──────────────────────────────────────────── */
const strongPassword = (pwd = "") => /^(?=.*\d).{6,}$/.test(pwd);

/* ─────────────  REGISTER  ───────────── */
export const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, whatAppNumber, email, password } = req.body;

  console.log("[REQUEST BODY]", req.body); // 👈 debug line

  if (!strongPassword(password)) {
    res.status(400);
    throw new Error(
      "Password must be at least 6 characters and contain at least 1 number"
    );
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    console.error("[USER EXISTS]");
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    firstName,
    lastName,
    whatAppNumber,
    email: email.toLowerCase(),
    password,
    location: req.body.location?.trim?.() || "Lagos",
    userType: "Customer",
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

  const perms = DEFAULT_PERMS_BY_TYPE[user.userType] ?? [];

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // const token = generateToken(user._id);
  const policy = await AccessPolicy.findOne({ userType: user.userType });
  // const token = generateToken(user._id, perms || policy?.permissions || []);
  // res
  //   .cookie("algomianToken", token, cookieOpts)
  //   .json({ ...safeUser(user), token });

  const finalPerms = // 1️⃣  prefer the saved policy
    policy?.permissions && policy.permissions.length
      ? policy.permissions
      : perms; // fallback to hard-coded defaults

  const token = generateToken(user._id, finalPerms); // 2️⃣

  res.cookie("algomianToken", token, cookieOpts).json({
    ...safeUser(user),
    permissions: finalPerms,
    token,
  });
});

export const adminCreateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, whatAppNumber, email, password, userType } =
    req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    firstName,
    lastName,
    whatAppNumber,
    email: email.toLowerCase(),
    password,
    userType,
    location: req.body.location?.trim?.() || "Lagos",
    profileImage:
      req.body.profileImage ||
      `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(firstName + lastName)}`,
  });

  res.status(201).json({
    message: "User created by admin",
    user: safeUser(user),
  });
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

  // res.json(addPerms(user.toObject()));
});

/* ───────────  FORGOT PASSWORD  ─────────── */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { identifier = "" } = req.body;
  if (!identifier) {
    res.status(400);
    throw new Error("Please supply your e-mail or phone number.");
  }

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { whatAppNumber: identifier }],
  });

  if (!user) {
    // Don't reveal existence
    return res.json({
      message: "If the account exists, a reset link was sent.",
    });
  }

  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const html = `
    <p>Hello ${user.firstName},</p>
    <p>You requested a password reset. Click the link below to choose a new password:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>This link expires in 10 minutes. If you did not request this, you can safely ignore this e-mail.</p>`;

  await sendEmail({
    to: user.email,
    subject: "Password reset – Algomian Tech",
    html,
  });

  res.json({ message: "If the account exists, a reset link was sent." });
});

/* ───────────  RESET PASSWORD  ─────────── */
export const resetPassword = asyncHandler(async (req, res) => {
  /* hash the token from the URL and look it up */
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Token is invalid or has expired");
  }

  const { newPassword } = req.body;
  if (!newPassword || !strongPassword(newPassword)) {
    res.status(400);
    throw new Error("Password must be ≥6 chars and contain ≥1 digit");
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: "Password updated – you can now log in." });
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
    location: req.body.location ?? user.location,
  });

  if (req.body.password) {
    if (!strongPassword(req.body.password)) {
      res.status(400);
      throw new Error("Weak password");
    }
    user.password = req.body.password;
  }

  const saved = await user.save();

  // res.cookie("algomianToken", generateToken(saved._id), cookieOpts);
  // res.json(safeUser(saved));

  const policy = await AccessPolicy.findOne({ userType: saved.userType });
  const finalPerms = policy?.permissions?.length
    ? policy.permissions
    : (DEFAULT_PERMS_BY_TYPE[saved.userType] ?? []);

  /* brand-new JWT that contains the fresh permissions */
  const token = generateToken(saved._id, finalPerms);

  res.cookie("algomianToken", token, cookieOpts).json({
    ...safeUser(saved),
    permissions: finalPerms,
    token,
  });
});

export const getCustomersList = asyncHandler(async (req, res) => {
  const customers = await User.find({ userType: "Customer" }).select(
    "-password"
  ); // exclude password
  res.json(customers);
});

export const getCustomers = asyncHandler(async (req, res) => {
  const customers = await User.find({ userType: "Customer" }).populate({
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
  // res.json(addPerms(user.toObject()));
});

export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.params.id });
  res.json(orders);
});

export const getPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("preferences");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user.preferences);
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.preferences = { ...user.preferences.toObject(), ...req.body };
  await user.save();
  res.status(200).json(user.preferences);
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password"); // strip hashes
  res.status(200).json(users);
});

// Add to backend/controllers/userController.js
export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.userType = req.body.userType;
  await user.save();
  res.status(200).json({ message: "User role updated successfully" });
});

// export const deleteUser = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.params.id);
//   if (!user) {
//     res.status(404);
//     throw new Error("User not found");
//   }
//   await user.deleteOne();
//   res.json({ message: "User deleted" });
// });

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Both current & new passwords are required");
  }

  if (!strongPassword(newPassword)) {
    res.status(400);
    throw new Error(
      "New password must be ≥ 6 chars and contain at least one digit"
    );
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const ok = await user.matchPassword(currentPassword);
  if (!ok) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  // refresh JWT so the user stays logged-in
  res.cookie("algomianToken", generateToken(user._id), cookieOpts);
  res.status(200).json({ message: "Password updated" });
});

export const updateUserPermissions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new Error("User not found");

  user.permissions = req.body.permissions; // <- save new list
  await user.save();

  // issue brand-new token that contains the updated perms / userType
  const token = generateJwt(user._id, user.userType, user.permissions);

  res.json({
    message: "Permissions updated",
    token, // <── send it back
    user: {
      _id: user._id,
      userType: user.userType,
      permissions: user.permissions,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  });
});

// controllers/userController.js

export const refreshPermissions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const policy = await AccessPolicy.findOne({ userType: user.userType });
  const finalPerms =
    (policy?.permissions?.length
      ? policy.permissions
      : DEFAULT_PERMS_BY_TYPE[user.userType]) ?? [];
  const token = generateToken(user._id, finalPerms);
  res.cookie("algomianToken", token, cookieOpts).json({
    ...safeUser(user),
    permissions: finalPerms,
    token,
  });
});

/* ————————————————— DELETE USER (Customers only) ————————————— */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Only allow deleting Customer accounts via this endpoint
  if (user.userType !== "Customer") {
    res.status(403);
    throw new Error("Only customer accounts can be deleted here");
  }

  await user.deleteOne();
  res.json({ message: "Customer deleted" });
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
  location: u.location,
});

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};
