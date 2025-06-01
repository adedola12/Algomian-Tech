import asyncHandler from "express-async-handler";
import AccessPolicy from "../models/accessPolicyModel.js";

/* GET /api/access */
export const listPolicies = asyncHandler(async (_req, res) => {
  res.json(await AccessPolicy.find().sort("userType"));
});

/* GET /api/access/:type  */
export const getPolicy = asyncHandler(async (req, res) => {
  const doc = await AccessPolicy.findOne({ userType: req.params.type });
  res.json(doc || { userType: req.params.type, permissions: [] });
});

/* PUT /api/access/:type  { permissions:[…] } */
export const upsertPolicy = asyncHandler(async (req, res) => {
  const doc = await AccessPolicy.findOneAndUpdate(
    { userType: req.params.type },
    { permissions: req.body.permissions || [], userType: req.params.type },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json(doc);
});

