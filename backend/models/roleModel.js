import mongoose from "mongoose";
import PERM from "./permissionEnum.js";

const roleSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    name: { type: String, required: true },
    permissions: {
      // array of strings from permissionEnum
      type: [String],
      enum: Object.values(PERM),
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Role", roleSchema);
