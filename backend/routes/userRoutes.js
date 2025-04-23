// ---------------------------------------------
//  backend/routes/userRoutes.js
// ---------------------------------------------
import express                     from "express";
import {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";
import { protect }        from "../middleware/authMiddleware.js";
import { upload, uploadToDrive }   from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login",    authUser);
router.post("/logout",   (_, res) => {
  res.clearCookie("algomianToken").json({ message: "Logged out" });
});

router
  .route("/profile")
  .get( protect, getUserProfile )
  .put(
    protect,
    upload.single("profileImage"),
    uploadToDrive("profileImage"),
    updateUserProfile
  );

export default router;
