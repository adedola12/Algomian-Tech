import mongoose from "mongoose";

const accessPolicySchema = new mongoose.Schema(
  {
    userType: { type: String, required: true, unique: true }, // - Admin / Manager / …
    permissions: { type: [String], default: [] }, // - 'order.create', …
  },
  { timestamps: true }
);

export default mongoose.model("AccessPolicy", accessPolicySchema);
