// models/returnModel.js
import mongoose from "mongoose";

const returnItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productName: String,
    qty: Number,
    specs: [
      {
        serialNumber: String,
        baseRam: String,
        baseStorage: String,
        baseCPU: String,
      },
    ],
  },
  { _id: false }
);

// models/returnModel.js
const returnSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // the customer
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // the staff who did the return
    totalValue: Number,
    returnedAt: { type: Date, default: Date.now },
    items: [returnItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Return", returnSchema);
