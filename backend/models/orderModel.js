import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name:     { type: String, required: true },
    qty:      { type: Number, required: true },
    price:    { type: Number, required: true },
    image:    { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems:      [orderItemSchema],
    shippingAddress: {
      address:   { type: String, required: true },
      city:      { type: String, required: true },
      postalCode:{ type: String, required: true },
      country:   { type: String, required: true },
    },
    paymentMethod:   { type: String, required: true },
    itemsPrice:      { type: Number, required: true },
    shippingPrice:   { type: Number, required: true },
    taxPrice:        { type: Number, required: true },
    totalPrice:      { type: Number, required: true },
    status:          { type: String, enum: ["Pending","Processing","Shipped","Delivered"], default: "Pending" },
    isPaid:          { type: Boolean, default: false },
    paidAt:          { type: Date },
    isDelivered:     { type: Boolean, default: false },
    deliveredAt:     { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
