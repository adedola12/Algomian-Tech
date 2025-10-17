import asyncHandler from "express-async-handler";
import Location from "../models/locationModel.js";
import AuditLog from "../models/auditLogModel.js";

/**
 * GET /api/locations
 */
export const listLocations = asyncHandler(async (_req, res) => {
  const docs = await Location.find({}).sort({ name: 1 });
  res.json(docs.map(({ _id, name }) => ({ _id, name })));
});

/**
 * POST /api/locations   (Admin)
 * body: { name: string }
 */
export const addLocation = asyncHandler(async (req, res) => {
  const name = (req.body?.name || "").trim();
  if (!name) {
    res.status(400);
    throw new Error("Location name is required");
  }

  // check duplicates (case-insensitive)
  const exists = await Location.findOne({ name }).collation({
    locale: "en",
    strength: 2,
  });
  if (exists) {
    res.status(409);
    throw new Error("Location already exists");
  }

  const doc = await Location.create({ name });

  // audit (best-effort)
  try {
    await AuditLog.create({
      actor: req.user?._id,
      action: "location.create",
      targetType: "Location",
      targetId: doc._id,
      meta: { name: doc.name },
    });
  } catch (_) {}

  res.status(201).json({ _id: doc._id, name: doc.name });
});
