// routes/productRoutes.js
import express from "express";
import multer from "multer";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProduct,
  getBrands,
  getCategories,
  getBaseSpecs,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router
  .route("/")
  .get(getProducts) //  ← LIST
  .post(protect, upload.array("images", 10), createProduct);

router.get("/brands", getBrands);
router.get("/categories", getCategories);

router
  .route("/:id")
  .get(getProduct) //  ← SINGLE
  .put(protect, upload.array("images", 10), updateProduct)
  .delete(protect, deleteProduct);

router.get("/:id/base-specs", protect, getBaseSpecs);

export default router;
