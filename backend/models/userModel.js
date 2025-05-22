// backend/models/userModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  whatAppNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: "" },
  jobTitle: { type: String, default: "" },
  userType: {
    type: String,
    enum: ["Admin", "Manager", "SalesRep", "Customer", "Logistics"],
    default: "Customer",
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    }
  ],
   preferences: {
       timeZone:         { type: String,  default: "Africa/Lagos" },
       autoTimeZone:     { type: Boolean, default: false },
       productIdMode:    { type: String,  enum: ["auto", "manual"], default: "auto" },
       lowStockAlert:    { type: Boolean, default: true },
       includeTax:       { type: Boolean, default: true },
       emailNotification:{ type: Boolean, default: false },
     },
}, { timestamps: true });


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, await bcrypt.genSalt(12));
  next();
});

userSchema.methods.matchPassword = function (pw) {
  return bcrypt.compare(pw, this.password);
};

export default mongoose.model("User", userSchema);
