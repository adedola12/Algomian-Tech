import jwt          from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User         from '../models/userModel.js';
import generateToken from '../utils/generateToken.js'; 

export const authUser = asyncHandler(async (req, res, next) => {
  const { identifier = "", password } = req.body;

  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { whatAppNumber: identifier },
    ],
  });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    return res.json({ message: "Invalid credentials" }); // ✅ stops here
  }

  // await user.populate("roles", "name permissions");

  const token = generateToken(user._id); // <- ensure you have this util
  const safeUser = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    userType: user.userType,
    profileImage: user.profileImage,
  };

  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };

  // ✅ only one response sent here
  // res.cookie("algomianToken", token, cookieOpts).status(200).json({
  //   ...safeUser,
  //   token,

  //   perms: [...new Set(user.roles.flatMap(r => r.permissions))],
  // });

  res.cookie("algomianToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    token,
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    userType: user.userType,
  });
});
  
/* ──────────────────────────────────────────────────────────
   protect - verifies JWT (header OR http-only cookie)
───────────────────────────────────────────────────────────*/
export const protect = asyncHandler(async (req, res, next) => {
  let token = null;

  // 1. Check Bearer token
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2. Fallback to httpOnly cookie
  else if (req.cookies?.algomianToken) {
    token = req.cookies.algomianToken;
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized, token invalid");
  }
});

// Example: check if Admin
export const isAdmin = (req, res, next) => {
  if (req.user?.userType === "Admin") return next();
  res.status(403);
  throw new Error("Access denied: Admin only");
};

// Example: allow Admin or SalesRep
export const isSalesTeam = (req, res, next) => {
  const allowed = ["Admin", "SalesRep"];
  if (allowed.includes(req.user?.userType)) return next();
  res.status(403);
  throw new Error("Access denied: Sales team only");
};

/* ──────────────────────────────────────────────────────────
   legacy “admin-only” helper – keep if you still need it
───────────────────────────────────────────────────────────*/
export const admin = (req, res, next) => {
  if (req.user && req.user.roles.some(r => r.name === 'Admin')) {
    return next();
  }
  res.status(403);
  throw new Error('Not authorized as admin');
};

// 👇 Authorize middleware: checks if user has specific permission
export const authorize = (...requiredPerms) => (req, res, next) => {
  if (!req.perms) {
    return res.status(403).json({ message: "Forbidden – insufficient privileges" });
  }

  const hasPermission = requiredPerms.every(p => req.perms.includes(p));
  if (!hasPermission) {
    return res.status(403).json({ message: "Forbidden – insufficient privileges" });
  }

  next();
};