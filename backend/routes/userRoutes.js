import express from "express";
import {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  getCustomersList,
  getCustomers,
  getUserById,
  getUserOrders,
  updateUserRole,
  adminCreateUser,
  deleteUser,
  changePassword,
  getPreferences,
  updatePreferences,getAllUsers
} from "../controllers/userController.js";
import {
  protect,
  isAdmin,
  adminOrManager,allowRoles
} from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";
import asyncHandler from "express-async-handler"; 
import User         from "../models/userModel.js"; 
import { v4 as uuid } from "uuid";

const router = express.Router();

// Helper Middleware to upload single image to Cloudinary
const uploadProfileImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const fileName = `user_profiles/${uuid()}`;
    const url = await uploadBufferToCloudinary(req.file.buffer, fileName);
    req.body.profileImage = url; // inject URL into request body
    next();
  } catch (error) {
    next(error);
  }
};

router
  .route("/preferences")
  .get(protect, getPreferences)
  .put(protect, updatePreferences);

  router.get(
    "/all",
  
    
    getAllUsers
  );
  
router.post("/register", registerUser);
router.post("/login", authUser);
router.post("/admin-create", protect, isAdmin, adminCreateUser);

router.post("/logout", (_, res) => {
  res.clearCookie("algomianToken").json({ message: "Logged out" });
});

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(
    protect,
    upload.single("profileImage"),
    uploadProfileImage,
    updateUserProfile
  );

router.put("/change-password", protect, changePassword);

router.get("/customers", protect, adminOrManager, getCustomers);
router.get("/customerlist", protect, adminOrManager, getCustomersList);

router.get(
    '/logistics-drivers',
    protect,
    (req, res, next) => allowRoles('Admin', 'SalesRep', 'Manager', 'Logistics')(req, res, next),
    asyncHandler(async (_req, res) => {
      const drivers = await User.find({ userType: 'Logistics' })
                                .select('_id firstName lastName whatAppNumber email');
      res.json(drivers);
    })
  );

router.get("/:id", getUserById);
router.get("/:id/orders", getUserOrders);

router.put("/:id/role", protect, isAdmin, updateUserRole);

router.delete("/:id", protect, isAdmin, deleteUser);

export default router;
