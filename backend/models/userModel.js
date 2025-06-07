// backend/models/userModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    whatAppNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: "" },
    jobTitle: { type: String, default: "" },
    userType: {
      type: String,
      enum: [
        "Admin",
        "Manager",
        "SalesRep",
        "Customer",
        "Logistics",
        "Procurement",
        "Inventory",
      ],
      default: "Customer",
    },

    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    preferences: {
      timeZone: { type: String, default: "Africa/Lagos" },
      autoTimeZone: { type: Boolean, default: false },
      productIdMode: {
        type: String,
        enum: ["auto", "manual"],
        default: "auto",
      },
      lowStockAlert: { type: Boolean, default: true },
      includeTax: { type: Boolean, default: true },
      emailNotification: { type: Boolean, default: false },
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, await bcrypt.genSalt(12));
  next();
});

userSchema.methods.matchPassword = function (pw) {
  return bcrypt.compare(pw, this.password);
};

userSchema.methods.generateResetToken = function () {
  // Generate raw reset token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash the token to store in DB (security best practice)
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expiration time (e.g., 10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken; // Return the raw token to email to the user
};

export default mongoose.model("User", userSchema);
