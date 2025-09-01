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

export const getGroupedStock = asyncHandler(async (req, res) => {
  const grouped = await Product.aggregate([
    {
      $addFields: {
        normalizedName: { $toLower: "$productName" },
      },
    },
    {
      $group: {
        _id: "$normalizedName", // 👈 Group by lowercase name
        displayName: { $first: "$productName" }, // For display
        totalQuantity: { $sum: "$quantity" },
        reorderLevel: { $first: "$reorderLevel" },
        productIds: { $push: "$_id" },
        brand: { $first: "$brand" },
        category: { $first: "$productCategory" },
        createdAt: { $first: "$createdAt" },
      },
    },
    { $sort: { displayName: 1 } },
  ]);

  // Calculate grand total
  const totalStock = grouped.reduce((sum, item) => sum + item.totalQuantity, 0);

  res.json({ grouped, totalStock });
});

/* ─────────────  CREATE  ───────────── */
export const createProduct = asyncHandler(async (req, res) => {
  /* ---------- DUPLICATE CHECK (case-insensitive) ---------- */
  const { productName = "" } = req.body;
  // const existing = await Product.findOne({
  //   productName: { $regex: `^${productName}$`, $options: "i" },
  // });

  // if (existing) {
  //   res
  //     .status(409) // Conflict
  //     .json({
  //       message: `“${existing.productName}” already exists. Use Update instead.`,
  //       productId: existing._id,
  //     });
  //   return;
  // }

  const {
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
    stockLocation: stockLocation?.trim?.() ? stockLocation : "Lagos",
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

export const getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct("brand");
  res.json(brands.length ? brands : ["HP", "Dell", "Lenovo"]);
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct("productCategory");
  res.json(
    categories.length ? categories : ["Laptops", "Monitors", "Accessories"]
  );
});

export const getProducts = asyncHandler(async (req, res) => {
  const { search = "", category = "", page = 1, limit = 50 } = req.query;

  /* ── turn "i7 16GB"  ->  ["i7", "16GB"] ──────────────────────────── */
  const tokens = search
    .trim()
    .split(/\s+/) // split by 1-or-more spaces
    .filter(Boolean) // remove empties
    .slice(0, 5); // safety: max 5 tokens

  /* one sub-query per token – ALL tokens must be satisfied (AND) */
  const tokenConditions = tokens.map((t) => {
    const term = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    return {
      $or: [
        /* simple text columns */
        { productName: term },
        { brand: term },
        { productCategory: term },

        /* flat spec helpers */
        { storageRam: term },
        { Storage: term },

        /* look inside every element of baseSpecs[] */
        {
          baseSpecs: {
            $elemMatch: {
              $or: [
                { baseCPU: term },
                { baseRam: term },
                { baseStorage: term },
                { serialNumber: term },
              ],
            },
          },
        },
      ],
    };
  });

  /* optional category filter stays the same ------------------------- */
  const q = {
    $and: [
      ...(tokenConditions.length ? tokenConditions : [{}]),
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

export const getBaseSpecs = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product.baseSpecs || []);
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

export const bulkCreateProduct = asyncHandler(async (req, res) => {
  const { products = [] } = req.body;

  if (!Array.isArray(products) || !products.length) {
    res.status(400);
    throw new Error("No valid product data submitted.");
  }

  const created = await Product.insertMany(
    products.map((p) => ({
      productName: p.productName,
      brand: p.brand,
      baseSpecs: [
        {
          baseCPU: p.baseCPU || "",
          baseRam: p.baseRam || "",
          baseStorage: p.baseStorage || "",
          serialNumber: p.serialNumber || "",
        },
      ],
      supplier: p.supplier || "",
      productCategory: "Laptops",
      productCondition: "UK Used",
      quantity: 1,
      availability: "restocking",
      status: "Status",
      productId: uuid(), // ✅ add this line to avoid duplicate nulls
      stockLocation: "Lagos",
    })),
    { ordered: false }
  );

  res.status(201).json({
    added: created.length,
    message: "Bulk products added successfully.",
  });
});
