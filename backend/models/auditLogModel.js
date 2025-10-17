// models/auditLogModel.js
import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "order.create",
        "order.return",
        "order.delete",
        "order.restore",
        "product.create",
        "product.update",
        "product.delete",
        "product.transfer", // 👈 NEW
        "location.create", // 👈 NEW
      ],
    },
    targetType: { type: String, required: true }, // "Order" | "Product" | "Return"
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    meta: mongoose.Schema.Types.Mixed, // any extra context
    ip: String,
    ua: String,
  },
  { timestamps: true }
);

auditSchema.index({ action: 1, createdAt: -1 });
auditSchema.index({ actor: 1, createdAt: -1 });

export default mongoose.model("AuditLog", auditSchema);
