// backend/models/locationModel.js
import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // ⬅ removed unique:true
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Case-insensitive unique index on name
locationSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

export default mongoose.model("Location", locationSchema);
