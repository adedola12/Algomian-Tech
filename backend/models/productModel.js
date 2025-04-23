import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    attribute : { type: String, required: true },
    value     : { type: String, required: true },
    inputCost : { type: Number, default: 0 },
  },
  { _id: false }
);

const specSchema = new mongoose.Schema(
  {
    key   : { type: String, required: true },
    value : { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    productName     : { type: String, required: true },
    productCategory : { type: String, required: true },
    brand           : { type: String, required: true },

    /* base specs */
    baseRam     : String,
    baseStorage : String,
    baseCPU     : String,

    /* pricing & qty */
    costPrice    : { type: Number, required: true },
    sellingPrice : { type: Number, required: true },
    quantity     : { type: Number, default: 1 },
    serialNumbers: [String],

    /* stock info */
    availability : {
      type   : String,
      enum   : ["inStock", "restocking", "inactive"],
      default: "inStock",
    },
    status       : String,
    reorderLevel : { type: Number, default: 0 },
    stockLocation: String,

    productId : { type: String, unique: true },

    /* arrays */
    variants : [variantSchema],
    features : [specSchema],
    images   : [String],              // Drive links

    description: String,
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
