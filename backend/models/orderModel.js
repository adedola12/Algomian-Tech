import mongoose from "mongoose";

const variantSelSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // “GPU: RTX 3050”
    cost: { type: Number, default: 0 },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    soldSpecs: [
      {
        serialNumber: String,
        baseRam: String,
        baseStorage: String,
        baseCPU: String,
      },
    ],
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    variantSelections: [variantSelSchema], // zero-or-many

    image: { type: String },
    maxQty: { type: Number, required: true },
    serialNumbers: [String],
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    trackingId: { type: String, required: true, unique: true },

    // Linked customer (when we have/created one)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // NEW: free-text customer details (always saved so we can display what was typed)
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },

    // NEW: who created the sale (seller / account user)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    referral: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    referralName: String,
    referralPhone: String,

    pointOfSale: { type: String },
    orderItems: [orderItemSchema],

    deliveryMethod: {
      type: String,
      enum: ["self", "logistics", "park"],
      default: "self",
    },

    shippingAddress: {
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "" },
    },

    receiverName: { type: String },
    receiverPhone: { type: String },
    receiptName: { type: String },
    receiptAmount: { type: Number, default: 0 },
    deliveryNote: { type: String },
    deliveryPaid: { type: Boolean, default: true },

    paymentMethod: {
      type: String,
      required: function () {
        return this.isPaid;
      },
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    taxPrice: { type: Number },
    totalPrice: { type: Number },

    status: {
      type: String,
      enum: ["Invoice", "Pending", "Processing", "Shipped", "Delivered"],
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
