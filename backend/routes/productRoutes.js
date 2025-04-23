import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";

const router  = express.Router();
const upload  = multer({ storage: multer.memoryStorage() });

/*  combine multiple images:  upload.array("images", 10)  */
router
  .route("/")
  .get( getProducts )
  .post(
    protect,
    upload.array("images", 10),        // field name in <input name="images" />
    createProduct
  );

router
  .route("/:id")
  .get( getProduct )
  .put(
    protect,
    upload.array("images", 10),
    updateProduct
  )
  .delete( protect, deleteProduct );

export default router;
