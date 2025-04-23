import asyncHandler from "express-async-handler";
import Product      from "../models/productModel.js";
import { uploadBufferToDrive } from "../utils/driveUpload.js";
import { v4 as uuid } from "uuid";

/* ─ helpers ─ */
const parseMaybeJSON = (val, fallback) => {
  try   { return JSON.parse(val); }
  catch { return fallback; }
};

/* ─────────────  CREATE  ───────────── */
export const createProduct = asyncHandler(async (req, res) => {
  const {
    productName, productCategory, brand,
    baseRam, baseStorage, baseCPU,
    costPrice, sellingPrice, quantity,
    availability, status, reorderLevel, stockLocation,
    productId, description,
  } = req.body;

  /* - images - */
  const imageLinks = [];
  if (req.files?.length) {
    for (const f of req.files) {
      const fileName = `${uuid()}.${f.originalname.split(".").pop()}`;
      imageLinks.push(await uploadBufferToDrive(f.buffer, fileName));
    }
  }

  /* - parse arrays that came as JSON strings - */
  const serialNumbers = parseMaybeJSON(req.body.serialNumbers, []);
  const variants      = parseMaybeJSON(req.body.variants, []);
  const features      = parseMaybeJSON(req.body.features, []);

  const product = await Product.create({
    productName, productCategory, brand,
    baseRam, baseStorage, baseCPU,
    costPrice, sellingPrice, quantity,
    availability, status, reorderLevel, stockLocation,
    productId, description,
    serialNumbers, variants, features,
    images: imageLinks,
  });

  res.status(201).json(product);
});

/* ─────────────  UPDATE  ───────────── */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  /* ─ upload any new images ─ */
  if (req.files?.length) {
    for (const f of req.files) {
      const fileName = `${uuid()}.${f.originalname.split(".").pop()}`;
      const link = await uploadBufferToDrive(f.buffer, fileName);
      product.images.push(link);
    }
  }

  /* plain scalar fields */
  [
    "productName", "productCategory", "brand",
    "baseRam", "baseStorage", "baseCPU",
    "costPrice", "sellingPrice", "quantity",
    "availability", "status", "reorderLevel",
    "stockLocation", "description",
  ].forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });

  /* arrays */
  if (req.body.serialNumbers)
    product.serialNumbers = parseMaybeJSON(req.body.serialNumbers, []);
  if (req.body.variants)
    product.variants      = parseMaybeJSON(req.body.variants, []);
  if (req.body.features)
    product.features      = parseMaybeJSON(req.body.features, []);

  const updated = await product.save();
  res.json(updated);
});

/* ─────────────  DELETE  ───────────── */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  await product.deleteOne();
  // (Optional) delete files from Drive here
  res.json({ message: "Product removed" });
});

/* ─────────────  READ (optional helpers) ───────────── */
export const getProducts = asyncHandler(async (_req, res) => {
  res.json(await Product.find().sort("-createdAt"));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});
