/*  controllers/userController.js  */
import asyncHandler from "express-async-handler";
import User          from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

/* ──────────────────────────────────────────
   Helpers
   ────────────────────────────────────────── */
const strongPassword = (pwd = "") =>
  /^(?=.*\d).{6,}$/.test(pwd);              // ≥6 chars & ≥1 digit


/* ──────────────────────────────────────────
   Register
   ────────────────────────────────────────── */
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
    email,
    password,            // hashed automatically by the schema hook
    userType,            // default = "Customer"
    profileImage: req.body.profileImage || "",
  });

  res.status(201).json({
    _id:    user._id,
    firstName:  user.firstName,
    lastName:   user.lastName,
    email:      user.email,
    userType:   user.userType,
    profileImage: user.profileImage,
    token:      generateToken(user._id),
  });
});


/* ──────────────────────────────────────────
   Login  (email OR whatsapp number)
   ────────────────────────────────────────── */
export const authUser = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;

  const user = await User.findOne({
    $or: [{ email }, { whatAppNumber: phone }],
  });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  res.json({
    _id:    user._id,
    firstName:  user.firstName,
    lastName:   user.lastName,
    email:      user.email,
    userType:   user.userType,
    profileImage: user.profileImage,
    token:      generateToken(user._id),
  });
});


/* ──────────────────────────────────────────
   Get profile  (protected)
   ────────────────────────────────────────── */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});


/* ──────────────────────────────────────────
   Update profile  (protected)
   ────────────────────────────────────────── */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.firstName     = req.body.firstName     || user.firstName;
  user.lastName      = req.body.lastName      || user.lastName;
  user.whatAppNumber = req.body.whatAppNumber || user.whatAppNumber;
  user.email         = req.body.email         || user.email;
  user.profileImage  = req.body.profileImage  || user.profileImage;

  if (req.body.password) {
    if (!strongPassword(req.body.password)) {
      res.status(400);
      throw new Error(
        "Password must be at least 6 characters and contain at least 1 number"
      );
    }
    user.password = req.body.password;              // will be hashed by hook
  }

  const updated = await user.save();

  res.json({
    _id:    updated._id,
    firstName:  updated.firstName,
    lastName:   updated.lastName,
    email:      updated.email,
    userType:   updated.userType,
    profileImage: updated.profileImage,
    token:      generateToken(updated._id),
  });
});
