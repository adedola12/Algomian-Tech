import mongoose from "mongoose";

const logisticsSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // 1 shipment ↔︎ 1 order
    },

    /** who is in charge of delivery (optional) */
    assignedTo: {
      // e.g. User id of rider
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    /** business data filled in the Create-Shipment form */
    shippingMethod: {
      type: String,
      enum: ["Logistics", "Park Pick Up", "Self Pick Up"],
    },
    sendingPark: { type: String },
    destinationPark: { type: String },
    trackingId: { type: String },
    driverContact: { type: String },
    driverName    : { type:String },   
    dispatchDate: { type: Date },
    expectedDate: { type: Date },
    deliveryAddress: { type: String },
    deliveryPhone: { type: String },
    deliveryEmail: { type: String },
    /** live status for UI timeline */
    status: {
      type: String,
      enum: ["Received", "Processing", "RiderOnWay", "InTransit", "Delivered"],
      default: "Received",
    },

    timeline: [
      {
        status: { type: String },
        time: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Logistics", logisticsSchema);
