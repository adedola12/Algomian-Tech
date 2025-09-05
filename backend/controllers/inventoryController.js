// backend/controllers/inventoryController.js
import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";

export const downloadInventoryCsv = asyncHandler(async (_req, res) => {
  const products = await Product.find({}).select(
    "productName quantity sellingPrice reorderLevel availability createdAt updatedAt"
  );

  const rows = [
    [
      "Product Name",
      "Quantity",
      "Selling Price",
      "Reorder Level",
      "Availability",
      "Created At",
      "Updated At",
    ].join(","),
    ...products.map((p) =>
      [
        JSON.stringify(p.productName ?? ""), // quote-safe
        p.quantity ?? 0,
        p.sellingPrice ?? 0,
        p.reorderLevel ?? 0,
        JSON.stringify(p.availability ?? ""),
        new Date(p.createdAt).toISOString(),
        new Date(p.updatedAt).toISOString(),
      ].join(",")
    ),
  ].join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="inventory-export-${Date.now()}.csv"`
  );
  res.status(200).send(rows);
});
