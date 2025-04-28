
import jwt          from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User         from "../models/userModel.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization?.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.algomianToken) {
    token = req.cookies.algomianToken;
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});


export const admin = (req, res, next) => {
  if (req.user && req.user.userType === "Admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as admin");
  }
};
