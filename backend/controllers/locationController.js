import asyncHandler from "express-async-handler";
import Location from "../models/locationModel.js";
import AuditLog from "../models/auditLogModel.js";

export const listLocations = asyncHandler(async (_req, res) => {
  const rows = await Location.find({ active: true }).sort({ name: 1 });
  res.json(rows);
});

export const addLocation = asyncHandler(async (req, res) => {
  const { name = "" } = req.body;
  const trimmed = name.trim();
  if (!trimmed) {
    res.status(400);
    throw new Error("Location name is required");
  }
  const loc = await Location.create({ name: trimmed });
  await AuditLog.create({
    actor: req.user._id,
    action: "location.create",
    targetType: "Location",
    targetId: loc._id,
    meta: { name: trimmed },
  });
  res.status(201).json(loc);
});
