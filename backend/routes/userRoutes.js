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
} from "../controllers/userController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";
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

router.post("/register", registerUser);
router.post("/login", authUser);

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

router.get("/customers", protect, isAdmin, getCustomers);
router.get("/customerlist", protect, isAdmin, getCustomersList);

router.get("/:id", getUserById);
router.get("/:id/orders", getUserOrders);

export default router;
