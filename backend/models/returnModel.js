// models/returnModel.js
import mongoose from "mongoose";

const returnSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  totalValue: { type: Number, required: true },
  returnedAt: { type: Date, default: Date.now },
  items: [
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
  ],
});

export default mongoose.model("Return", returnSchema);
