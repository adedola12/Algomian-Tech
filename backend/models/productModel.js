import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    attribute: { type: String },
    value: { type: String },
    inputCost: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    productCondition: {
      type: String,
      enum: ["New", "UK Used", "Fairly Used"],
      required: true,
    },
    productCategory: { type: String, required: true },
    brand: { type: String, required: true },

    /* base specs */
    baseSpecs: [
      {
        baseRam: String,
        baseStorage: String,
        baseCPU: String,
        serialNumber: String,
      },
    ],

    /* pricing & qty */
    quantity: { type: Number, default: 1 },
    costPrice: { type: Number },
    stockLocation: { type: String, default: "Lagos" },
    supplier: String,

    storageRam: String,
    Storage: String,
    sellingPrice: { type: Number },
    variants: [variantSchema],

    /* stock info */
    availability: {
      type: String,
      enum: ["inStock", "restocking", "inactive"],
      default: "inStock",
    },
    status: String,
    reorderLevel: { type: Number, default: 0 },

    productId: { type: String },

    /* arrays */
    // features: [specSchema],
    images: [String], // Drive links

    description: String,
  },
  { timestamps: true }
);

// productSchema.index(
//   { productName: 1 },
//   { unique: true, collation: { locale: "en", strength: 2 } } // case-insensitive
// );

export default mongoose.model("Product", productSchema);
