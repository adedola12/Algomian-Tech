// backend/utils/passwordToken.js
import crypto from "crypto";

export const generateResetToken = () => {
  // 32-byte random string → hex
  const rawToken = crypto.randomBytes(32).toString("hex");

  // SHA-256 hash stored in DB (never save the raw token!)
  const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

  return { rawToken, hashed };
};
