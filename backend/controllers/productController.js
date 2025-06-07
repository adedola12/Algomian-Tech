import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";
import { v4 as uuid } from "uuid";

/* ─ helpers ─ */
export const parseMaybeJSON = (val, fallback = null) => {
  if (typeof val !== "string") return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback ?? val;
  } // ← if it’s plain text just return it
};

/* ─────────────  CREATE  ───────────── */
export const createProduct = asyncHandler(async (req, res) => {
  const {
    productName,
    productCondition,
    productCategory,
    brand,
    storageRam,
    Storage,
    supplier,
    costPrice,
    sellingPrice,
    quantity,
    availability,
    status,
    reorderLevel,
    stockLocation,
    productId,
    description,
  } = req.body;

  /* - images - */
  const imageLinks = [];
  if (req.files?.length) {
    for (const f of req.files) {
      const fileName = `${uuid()}`;
      imageLinks.push(await uploadBufferToCloudinary(f.buffer, fileName));
    }
  }

  /* - parse arrays that came as JSON strings - */
  // const serialNumbers = parseMaybeJSON(req.body.serialNumbers, []);
  const variants = parseMaybeJSON(req.body.variants, []);
  const features = parseMaybeJSON(req.body.features, []);
  const baseSpecs = parseMaybeJSON(req.body.baseSpecs, []);

  const product = await Product.create({
    productName,
    productCondition, // ⭐ REQUIRED field now included
    productCategory,
    brand,
    baseSpecs,
    storageRam, // ⭐
    Storage, // ⭐
    supplier, // ⭐
    costPrice: Number(costPrice),
    sellingPrice: Number(sellingPrice),
    quantity: Number(quantity),
    availability,
    status,
    reorderLevel: Number(reorderLevel),
    stockLocation,
    productId,
    description,
    variants,
    features,
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
      const fileName = `${uuid()}`;
      const link = await uploadBufferToCloudinary(f.buffer, fileName);
      product.images.push(link);
    }
  }

  /* plain scalar fields */
  [
    "productName",
    "productCategory",
    "brand",
    "costPrice",
    "sellingPrice",
    "quantity",
    "availability",
    "status",
    "reorderLevel",
    "stockLocation",
    "description",
  ].forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });

  /* arrays */
  if (req.body.serialNumbers !== undefined)
    product.serialNumbers = req.body.serialNumbers;
  if (req.body.productCondition !== undefined)
    product.productCondition = req.body.productCondition;

  if (req.body.storageRam !== undefined)
    product.storageRam = req.body.storageRam;

  if (req.body.Storage !== undefined) product.Storage = req.body.Storage;
  if (req.body.variants)
    product.variants = parseMaybeJSON(req.body.variants, []);
  if (req.body.features)
    product.features = parseMaybeJSON(req.body.features, []);
  if (req.body.baseSpecs)
    product.baseSpecs = parseMaybeJSON(req.body.baseSpecs, []);

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

/* ─────────────  READ LIST  ─────────────
   · ?search=laptop        – fuzzy search across name / brand / category
   · ?category=PC          – exact match on category
   · ?page=2&limit=20      – pagination
──────────────────────────────────────── */
export const getProducts = asyncHandler(async (req, res) => {
  const { search = "", category, page = 1, limit = 50 } = req.query;

  const q = {
    $and: [
      search
        ? {
            $or: [
              { productName: { $regex: search, $options: "i" } },
              { brand: { $regex: search, $options: "i" } },
              { productCategory: { $regex: search, $options: "i" } },
            ],
          }
        : {},
      category ? { productCategory: category } : {},
    ],
  };

  const skip = (+page - 1) * +limit;
  const total = await Product.countDocuments(q);
  const products = await Product.find(q)
    .sort("-createdAt")
    .skip(skip)
    .limit(+limit);

  res.json({ products, total, page: +page, pages: Math.ceil(total / limit) });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});
