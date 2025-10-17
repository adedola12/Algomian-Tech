import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import Location from "../models/locationModel.js";
import AuditLog from "../models/auditLogModel.js";
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

const isBlank = (v) =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "");
const toNumOrUndef = (v) => {
  if (isBlank(v)) return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
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

  await AuditLog.create({
    actor: req.user._id,
    action: "product.create",
    targetType: "Product",
    targetId: product._id,
    meta: { name: product.productName },
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

  /* upload any new images */
  if (req.files?.length) {
    for (const f of req.files) {
      const fileName = `${uuid()}`;
      const link = await uploadBufferToCloudinary(f.buffer, fileName);
      product.images.push(link);
    }
  }

  /* strings: only set when not blank */
  const stringFields = [
    "productName",
    "productCategory",
    "brand",
    "availability",
    "status",
    "stockLocation",
    "description",
    "productCondition",
    "storageRam",
    "Storage",
    "supplier",
    "productId",
  ];
  stringFields.forEach((f) => {
    if (req.body.hasOwnProperty(f) && !isBlank(req.body[f])) {
      product[f] = req.body[f];
    }
  });

  /* numbers: only set when clean number provided */
  const numericFields = [
    "costPrice",
    "sellingPrice",
    "quantity",
    "reorderLevel",
  ];
  numericFields.forEach((f) => {
    if (req.body.hasOwnProperty(f)) {
      const n = toNumOrUndef(req.body[f]);
      if (n !== undefined) product[f] = n;
      // if undefined or NaN/blank -> ignore (keep existing value)
    }
  });

  /* arrays / objects */
  if (req.body.variants !== undefined)
    product.variants = parseMaybeJSON(req.body.variants, []);
  if (req.body.features !== undefined)
    product.features = parseMaybeJSON(req.body.features, []);
  if (req.body.baseSpecs !== undefined)
    product.baseSpecs = parseMaybeJSON(req.body.baseSpecs, []);
  if (req.body.removedImages) {
    const removed = parseMaybeJSON(req.body.removedImages, []);
    if (Array.isArray(removed) && removed.length) {
      product.images = (product.images || []).filter(
        (u) => !removed.includes(u)
      );
    }
  }

  const updated = await product.save();

  await AuditLog.create({
    actor: req.user._id,
    action: "product.update",
    targetType: "Product",
    targetId: updated._id,
    meta: { name: updated.productName },
  });

  res.json(updated);
});

/* ─────────────  DELETE  ───────────── */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await AuditLog.create({
    actor: req.user._id,
    action: "product.delete",
    targetType: "Product",
    targetId: product._id,
    meta: { name: product.productName },
  });

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

// export const getProducts = asyncHandler(async (req, res) => {
//   const { search = "", category = "", page = 1, limit = 50 } = req.query;

//   /* ── turn "i7 16GB"  ->  ["i7", "16GB"] ──────────────────────────── */
//   const tokens = search
//     .trim()
//     .split(/\s+/) // split by 1-or-more spaces
//     .filter(Boolean) // remove empties
//     .slice(0, 5); // safety: max 5 tokens

//   /* one sub-query per token – ALL tokens must be satisfied (AND) */
//   const tokenConditions = tokens.map((t) => {
//     const term = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
//     return {
//       $or: [
//         /* simple text columns */
//         { productName: term },
//         { brand: term },
//         { productCategory: term },

//         /* flat spec helpers */
//         { storageRam: term },
//         { Storage: term },

//         /* look inside every element of baseSpecs[] */
//         {
//           baseSpecs: {
//             $elemMatch: {
//               $or: [
//                 { baseCPU: term },
//                 { baseRam: term },
//                 { baseStorage: term },
//                 { serialNumber: term },
//               ],
//             },
//           },
//         },
//       ],
//     };
//   });

//   /* optional category filter stays the same ------------------------- */
//   const q = {
//     $and: [
//       ...(tokenConditions.length ? tokenConditions : [{}]),
//       category ? { productCategory: category } : {},
//     ],
//   };

//   const skip = (+page - 1) * +limit;
//   const total = await Product.countDocuments(q);
//   const products = await Product.find(q)
//     .sort("-createdAt")
//     .skip(skip)
//     .limit(+limit);

//   res.json({ products, total, page: +page, pages: Math.ceil(total / limit) });
// });

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

// controllers/productController.js
// export const getProducts = asyncHandler(async (req, res) => {
//   const {
//     search = "",
//     category = "",
//     page = 1,
//     limit = 50,
//     inStockOnly,
//     stockLocation,
//   } = req.query;

//   // If a logged-in Sales/Manager is asking, force their location.
//   const role = (req.user?.userType || "").toLowerCase();
//   const mustRestrict = role === "salesrep" || role === "manager";
//   const enforcedLocation = mustRestrict ? req.user?.location || "Lagos" : null;

//   const tokens = search.trim().split(/\s+/).filter(Boolean).slice(0, 5);

//   const tokenConditions = tokens.map((t) => {
//     const term = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
//     return {
//       $or: [
//         { productName: term },
//         { brand: term },
//         { productCategory: term },
//         { storageRam: term },
//         { Storage: term },
//         {
//           baseSpecs: {
//             $elemMatch: {
//               $or: [
//                 { baseCPU: term },
//                 { baseRam: term },
//                 { baseStorage: term },
//                 { serialNumber: term },
//               ],
//             },
//           },
//         },
//       ],
//     };
//   });

//   const q = {
//     $and: [
//       ...(tokenConditions.length ? tokenConditions : [{}]),
//       category ? { productCategory: category } : {},
//       // 👇 only items with stock when flag is truthy (e.g. "1", "true")
//       // inStockOnly ? { quantity: { $gt: 0 } } : {},
//       enforcedLocation
//         ? { stockLocation: enforcedLocation } // forced for Sales/Manager
//         : stockLocation
//           ? { stockLocation } // optional filter for others
//           : {},
//       stockLocation ? { stockLocation } : {},
//     ],
//   };

//   const skip = (+page - 1) * +limit;
//   const total = await Product.countDocuments(q);
//   const products = await Product.find(q)
//     .sort("-createdAt")
//     .skip(skip)
//     .limit(+limit);

//   res.json({ products, total, page: +page, pages: Math.ceil(total / limit) });
// });
// controllers/productController.js
export const getProducts = asyncHandler(async (req, res) => {
  const {
    search = "",
    category = "",
    page = 1,
    limit = 50,
    inStockOnly,
    stockLocation,
  } = req.query;

  // Force location for SalesRep/Manager
  const role = (req.user?.userType || "").toLowerCase();
  const mustRestrict = role === "salesrep" || role === "manager";
  const enforcedLocation = mustRestrict ? req.user?.location || "Lagos" : null;

  const tokens = search.trim().split(/\s+/).filter(Boolean).slice(0, 5);
  const tokenConditions = tokens.map((t) => {
    const term = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    return {
      $or: [
        { productName: term },
        { brand: term },
        { productCategory: term },
        { storageRam: term },
        { Storage: term },
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

  const q = {
    $and: [
      ...(tokenConditions.length ? tokenConditions : [{}]),
      category ? { productCategory: category } : {},
      inStockOnly ? { quantity: { $gt: 0 } } : {}, // ✅ keep this
      enforcedLocation
        ? { stockLocation: enforcedLocation } // ✅ force for Sales/Manager
        : stockLocation
          ? { stockLocation }
          : {}, // optional for others
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

export const bulkCreateProduct = asyncHandler(async (req, res) => {
  const { products = [] } = req.body;

  if (!Array.isArray(products) || !products.length) {
    res.status(400);
    throw new Error("No valid product data submitted.");
  }

  // Pre-validate: we only require productName. Collect skipped rows here.
  const docs = [];
  const skipped = []; // rows we didn't attempt because productName is missing

  products.forEach((p, idx) => {
    const name = (p.productName || "").trim();
    if (!name) {
      skipped.push({
        name: p.productName || `(row ${idx + 1})`,
        reason: "Missing productName",
      });
      return;
    }

    docs.push({
      productName: name,
      brand: p.brand || "", // ⬅️ can be blank
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
      productId: uuid(),
      stockLocation: "Lagos",
    });
  });

  let created = [];
  let failed = [];

  if (docs.length) {
    try {
      created = await Product.insertMany(docs, { ordered: false });
    } catch (err) {
      // Mongoose continues insertion with ordered:false but throws. Gather successes & failures.
      created = err.insertedDocs || [];

      // Common shapes where writeErrors live:
      const writeErrors =
        err?.writeErrors ||
        err?.result?.result?.writeErrors ||
        err?.result?.writeErrors ||
        [];

      failed = writeErrors.map((we) => {
        const idx = we.index ?? -1;
        return {
          name: docs[idx]?.productName || `(row ${idx + 1})`,
          reason: we.errmsg || we.err?.message || "Validation/duplicate error",
        };
      });

      // If we somehow got a validation error set without writeErrors
      if (!failed.length && err?.errors) {
        // Fallback: treat all docs as failed if none inserted
        if (!created.length) {
          failed = docs.map((d, i) => ({
            name: d.productName || `(row ${i + 1})`,
            reason: "Validation error",
          }));
        }
      }
    }
  }

  const added = created.length;

  res.status(201).json({
    added,
    failed, // [{name, reason}]
    skipped, // [{name, reason}]
    message: `Bulk products added: ${added}`,
  });
});

export const transferProducts = asyncHandler(async (req, res) => {
  const { fromLocation = "", toLocation = "", items = [] } = req.body;

  if (!fromLocation || !toLocation || fromLocation === toLocation) {
    res.status(400);
    throw new Error("Provide different source and destination locations");
  }
  if (!Array.isArray(items) || !items.length) {
    res.status(400);
    throw new Error("No items to transfer");
  }

  // ensure destination exists (source may only exist on Product rows)
  const dest = await Location.findOne({ name: toLocation });
  if (!dest) {
    res.status(400);
    throw new Error("Destination location does not exist");
  }

  const session = await mongoose.startSession();
  const results = [];
  try {
    await session.withTransaction(async () => {
      for (const it of items) {
        const { productId, qty } = it;
        const moveQty = Math.max(0, Number(qty || 0));
        if (!productId || moveQty <= 0) {
          results.push({ ok: false, productId, error: "Invalid item/qty" });
          continue;
        }

        // source doc
        const src = await Product.findOne({
          _id: productId,
          stockLocation: fromLocation,
        }).session(session);
        if (!src) {
          results.push({
            ok: false,
            productId,
            error: "Source product not found at that location",
          });
          continue;
        }
        if ((src.quantity || 0) < moveQty) {
          results.push({
            ok: false,
            productId,
            error: `Insufficient qty. Have ${src.quantity}`,
          });
          continue;
        }

        // target "same product" matcher – keep this simple: name + brand + category + condition
        const match = {
          productName: src.productName,
          brand: src.brand || "",
          productCategory: src.productCategory || "",
          productCondition: src.productCondition || "New",
          stockLocation: toLocation,
        };

        let destDoc = await Product.findOne(match).session(session);
        if (!destDoc) {
          // clone minimal fields into new doc at destination
          destDoc = await Product.create(
            [
              {
                ...match,
                quantity: 0,
                sellingPrice: src.sellingPrice,
                costPrice: src.costPrice,
                availability: src.availability,
                status: src.status,
                reorderLevel: src.reorderLevel,
                supplier: src.supplier,
                storageRam: src.storageRam,
                Storage: src.Storage,
                images: src.images || [],
                baseSpecs: [], // optional: serials stick to per-location; keep empty here
                productId: src.productId,
                description: src.description,
              },
            ],
            { session }
          ).then((a) => a[0]);
        }

        // apply move
        src.quantity = (src.quantity || 0) - moveQty;
        destDoc.quantity = (destDoc.quantity || 0) + moveQty;
        await Promise.all([src.save({ session }), destDoc.save({ session })]);

        // audit
        await AuditLog.create(
          [
            {
              actor: req.user._id,
              action: "product.transfer",
              targetType: "Product",
              targetId: src._id,
              meta: {
                from: fromLocation,
                to: toLocation,
                productName: src.productName,
                qty: moveQty,
                destProductId: destDoc._id,
              },
            },
          ],
          { session }
        );

        results.push({ ok: true, productId, toProductId: destDoc._id });
      }
    });

    res.json({ results });
  } finally {
    session.endSession();
  }
});
