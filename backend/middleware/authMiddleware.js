/* src/middleware/authMiddleware.js */
import jwt          from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User         from '../models/userModel.js';

/* ──────────────────────────────────────────────────────────
   protect - verifies JWT (header OR http-only cookie)
───────────────────────────────────────────────────────────*/
export const protect = asyncHandler(async (req, res, next) => {
  let token = '';

  // 1) try Bearer header
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2) fall back to httpOnly cookie
  else if (req.cookies?.algomianToken) {
    token = req.cookies.algomianToken;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  // 3) verify & attach user
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id)
                         .select('-password')
                         .populate({
                           path   : 'roles',
                           select : 'name permissions store',
                         });
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

/* ──────────────────────────────────────────────────────────
   authorize('permission-a','permission-b', …)
───────────────────────────────────────────────────────────*/
export const authorize = (...requiredPerms) => (req, res, next) => {
  const userPerms = new Set(
    req.user?.roles?.flatMap(r => r.permissions) || []
  );

  const allowed = requiredPerms.every(perm => userPerms.has(perm));

  if (!allowed) {
    res.status(403);
    throw new Error('Forbidden – insufficient privileges');
  }

  next();
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
