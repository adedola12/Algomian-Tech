// controllers/reportController.js
import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import Return from "../models/returnModel.js";
import User from "../models/userModel.js";
import AuditLog from "../models/auditLogModel.js"; // if you have it; else skip audit parts

export const getAgentKpis = asyncHandler(async (req, res) => {
  // lock down to Admins (or use your authorize middleware)
  if ((req.user?.userType || "").toLowerCase() !== "admin") {
    res.status(403);
    throw new Error("Admins only");
  }

  // Sales per agent (createdBy)
  const salesAgg = await Order.aggregate([
    {
      $group: {
        _id: "$createdBy",
        salesCount: { $sum: 1 },
        salesTotal: { $sum: { $ifNull: ["$totalPrice", 0] } },
      },
    },
  ]);

  // Returns per agent – prefer Return.performedBy; fallback to the order's createdBy
  const returnsAgg = await Return.aggregate([
    {
      $lookup: {
        from: "orders",
        localField: "orderId",
        foreignField: "_id",
        as: "order",
      },
    },
    { $unwind: { path: "$order", preserveNullAndEmptyArrays: true } },
    {
      $addFields: { actor: { $ifNull: ["$performedBy", "$order.createdBy"] } },
    },
    {
      $group: {
        _id: "$actor",
        returns: { $sum: 1 },
        returnedValue: { $sum: { $ifNull: ["$totalValue", 0] } },
      },
    },
  ]);

  // Optional: product adds & order deletes via AuditLog (if you have it)
  const productAddsAgg = AuditLog?.aggregate
    ? await AuditLog.aggregate([
        { $match: { action: "product.create" } },
        { $group: { _id: "$actor", productsAdded: { $sum: 1 } } },
      ])
    : [];

  const orderDeletesAgg = AuditLog?.aggregate
    ? await AuditLog.aggregate([
        { $match: { action: "order.delete" } },
        { $group: { _id: "$actor", ordersDeleted: { $sum: 1 } } },
      ])
    : [];

  // collect all agent ids
  const ids = new Set(
    [
      ...salesAgg.map((d) => String(d._id || "")),
      ...returnsAgg.map((d) => String(d._id || "")),
      ...productAddsAgg.map((d) => String(d._id || "")),
      ...orderDeletesAgg.map((d) => String(d._id || "")),
    ].filter(Boolean)
  );

  const users = await User.find({ _id: { $in: [...ids] } }).select(
    "firstName lastName userType"
  );

  // index helpers
  const byId = (arr) => new Map(arr.map((d) => [String(d._id), d]));
  const salesMap = byId(salesAgg);
  const returnsMap = byId(returnsAgg);
  const addsMap = byId(productAddsAgg);
  const delMap = byId(orderDeletesAgg);
  const usersMap = new Map(users.map((u) => [String(u._id), u]));

  const rows = [...ids].map((id) => {
    const u = usersMap.get(id);
    const s = salesMap.get(id) || {};
    const r = returnsMap.get(id) || {};
    const a = addsMap.get(id) || {};
    const d = delMap.get(id) || {};
    return {
      userId: id,
      name: u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "Unknown",
      role: u?.userType || "—",
      salesCount: s.salesCount || 0,
      salesTotal: s.salesTotal || 0,
      returns: r.returns || 0,
      returnedValue: r.returnedValue || 0,
      productsAdded: a.productsAdded || 0,
      ordersDeleted: d.ordersDeleted || 0,
    };
  });

  res.json({ rows });
});
