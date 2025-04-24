import express from "express";
import multer  from "multer";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router  = express.Router();
const upload  = multer({ storage: multer.memoryStorage() });

router.route("/")
  .get(getProducts)
  .post(protect, upload.array("images", 10), createProduct);

router.route("/:id")
  .get(getProduct)
  .put(protect, upload.array("images", 10), updateProduct)
  .delete(protect, deleteProduct);

export default router;
