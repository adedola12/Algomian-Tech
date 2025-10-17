// controllers/reportController.js
import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import Return from "../models/returnModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js"; // ✅ FIX: import Product
import AuditLog from "../models/auditLogModel.js";

/* ─────────────  KPIs  ───────────── */
export const getAgentKpis = asyncHandler(async (req, res) => {
  if ((req.user?.userType || "").toLowerCase() !== "admin") {
    res.status(403);
    throw new Error("Admins only");
  }

  const salesAgg = await Order.aggregate([
    {
      $match: { isDeleted: { $ne: true } }, // ignore trashed orders
    },
    {
      $group: {
        _id: "$createdBy",
        salesCount: { $sum: 1 },
        salesTotal: { $sum: { $ifNull: ["$totalPrice", 0] } },
      },
    },
  ]);

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

/* ─────────────  Recent activity per agent  ───────────── */
export const getAgentActivity = asyncHandler(async (req, res) => {
  if ((req.user?.userType || "").toLowerCase() !== "admin") {
    res.status(403);
    throw new Error("Admins only");
  }

  const { userId, limit = 50 } = req.query;
  if (!userId) {
    res.status(400);
    throw new Error("userId is required");
  }

  const logs = await AuditLog.find({ actor: userId })
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  // collect ids to hydrate titles
  const ids = { Order: [], Product: [], Return: [] };
  for (const l of logs) ids[l.targetType]?.push(l.targetId);

  const [orders, products, returns] = await Promise.all([
    ids.Order.length
      ? Order.find({ _id: { $in: ids.Order } }).select(
          "trackingId customerName isDeleted"
        )
      : Promise.resolve([]),
    ids.Product.length
      ? Product.find({ _id: { $in: ids.Product } }).select("productName")
      : Promise.resolve([]),
    ids.Return.length
      ? Return.find({ _id: { $in: ids.Return } }).select("orderId totalValue")
      : Promise.resolve([]),
  ]);

  const oMap = new Map(orders.map((d) => [String(d._id), d]));
  const pMap = new Map(products.map((d) => [String(d._id), d]));
  const rMap = new Map(returns.map((d) => [String(d._id), d]));

  const items = logs.map((l) => {
    let title = "";
    if (l.targetType === "Order") {
      const o = oMap.get(String(l.targetId));
      title = o
        ? `${o.trackingId} — ${o.customerName || ""}${
            o.isDeleted ? " (trashed)" : ""
          }`
        : l.meta?.trackingId || String(l.targetId);
    } else if (l.targetType === "Product") {
      title = pMap.get(String(l.targetId))?.productName || l.meta?.name || "";
    } else if (l.targetType === "Return") {
      const r = rMap.get(String(l.targetId));
      title = `Return of ${r?.orderId || l.meta?.orderId || ""}`;
    } else {
      title = l.meta?.title || ""; // safety for unknown targetType
    }

    return {
      id: l._id,
      action: l.action,
      targetType: l.targetType,
      targetId: l.targetId,
      title,
      createdAt: l.createdAt,
    };
  });

  res.json({ items });
});

export const getTransferActivity = asyncHandler(async (req, res) => {
  const { limit = 100 } = req.query;
  const items = await AuditLog.find({ action: "product.transfer" })
    .sort({ createdAt: -1 })
    .limit(Number(limit));
  res.json({ items });
});
