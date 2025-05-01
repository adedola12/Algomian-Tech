// ---------------------------------------------
//  backend/controllers/userController.js
// ---------------------------------------------
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

/* ─────────────────────────────────────────────
   tiny helper – ≥6 chars & ≥1 digit
   ──────────────────────────────────────────── */
const strongPassword = (pwd = "") => /^(?=.*\d).{6,}$/.test(pwd);

/* ─────────────  REGISTER  ───────────── */
export const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, whatAppNumber, email, password, userType } =
    req.body;

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
    userType,
    profileImage:
      req.body.profileImage ||
      `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(firstName + lastName)}`,
  });

  const adminRole = await Role.findOne({ name: "Admin" });
  if (adminRole) user.roles.push(adminRole._id);
  await user.save();

  const token = generateToken(user._id);
  res
    .status(201)
    .cookie("algomianToken", token, cookieOpts) // ↓ see bottom
    .json({ ...safeUser(user), token });
});

/* ─────────────  LOGIN  ───────────── */
export const authUser = asyncHandler(async (req, res) => {
  const { identifier = "", password } = req.body; // email OR phone

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

  const populated = await user.populate("roles", "name permissions");
  res.cookie("algomianToken", token, cookieOpts).json({
    ...safeUser(populated),
    token,
    roles: populated.roles,
    perms: [...new Set(populated.roles.flatMap((r) => r.permissions))],
  });
});

/* ————————————————— GET PROFILE ———————————————— */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("roles", "name permissions");
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
    roles: req.body.roleIds ?? user.roles, // ← keep roles
  });

  if (req.body.password) {
    if (!/^(?=.*\d).{6,}$/.test(req.body.password)) {
      res.status(400);
      throw new Error("Weak password");
    }
    user.password = req.body.password;
  }

  const saved = await user.save();
  const full = await saved.populate("roles", "name permissions");

  /* refresh cookie token (optional) */
  res.cookie("algomianToken", generateToken(full._id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json(full); // ← only ONE response
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
});

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};
