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
});

/* ─────────────  PROFILE  ───────────── */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

/* ─────────────  UPDATE PROFILE  ───────────── */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.firstName = req.body.firstName || user.firstName;
  user.lastName = req.body.lastName || user.lastName;
  user.whatAppNumber = req.body.whatAppNumber || user.whatAppNumber;
  user.email = req.body.email?.toLowerCase() || user.email;
  user.profileImage = req.body.profileImage || user.profileImage;

  if (req.body.password) {
    if (!strongPassword(req.body.password)) {
      res.status(400);
      throw new Error(
        "Password must be at least 6 characters and contain at least 1 number"
      );
    }
    user.password = req.body.password;
  }

  const updated = await user.save();
  const token = generateToken(updated._id);

  res
    .cookie("algomianToken", token, cookieOpts)
    .json({ ...safeUser(updated), token });
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
