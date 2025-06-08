import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    baseRam: { type: String, default: "" },
    baseStorage: { type: String, default: "" },
    baseCPU: { type: String, default: "" },

    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    maxQty: { type: Number, required: true }, // ← NEW
  },
  { _id: false }
);
const orderSchema = new mongoose.Schema(
  {
    trackingId: { type: String, required: true, unique: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pointOfSale: { type: String },
    orderItems: [orderItemSchema],

    shippingAddress: {
      address: {
        type: String,
        required: function () {
          return this.deliveryMethod !== "self"; // custom rule
        },
      },

      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    paymentMethod: { type: String, required: true },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered"],
      default: "Pending",
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    logistics: { type: mongoose.Schema.Types.ObjectId, ref: "Logistics" },

    isApproved: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    approveNote: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
