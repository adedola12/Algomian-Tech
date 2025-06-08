import React, { useEffect, useState, useMemo } from "react";
import {
  FiPackage,
  FiTruck,
  FiClock,
  FiDownload,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { fetchAllOrders } from "../../api";

/* ---------- helpers ---------------------------------------------------- */
const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const pctChange = (today, yesterday) =>
  yesterday === 0 ? null : ((today - yesterday) / yesterday) * 100;

export default function InvManTop() {
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchAllOrders()
      .then(setOrders)
      .catch((err) => console.error("Failed to load orders:", err));
  }, []);

  const { pendingCount, approvedCount, approvedToday, deltaApproved } =
    useMemo(() => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const pendingCount = orders.filter(
        (o) => o.status === "Pending" || o.status === "Processing"
      ).length;

      const approvedOrders = orders.filter((o) => o.status === "Shipped");
      const approvedCount = approvedOrders.length;

      const approvedToday = approvedOrders.filter(
        (o) => new Date(o.updatedAt) >= oneDayAgo
      ).length;

      // For simple comparison: change in shipped orders from yesterday
      const yesterdayStart = startOfDay(new Date(Date.now() - 86_400_000));
      const todayStart = startOfDay();

      const todayApproved = approvedOrders.filter(
        (o) => new Date(o.updatedAt) >= todayStart
      ).length;

      const yesterdayApproved = approvedOrders.filter(
        (o) =>
          new Date(o.updatedAt) >= yesterdayStart &&
          new Date(o.updatedAt) < todayStart
      ).length;

      const deltaApproved = pctChange(todayApproved, yesterdayApproved);

      return {
        pendingCount,
        approvedCount,
        approvedToday,
        deltaApproved,
      };
    }, [orders]);

  const handleExport = () => {
    if (!orders.length) return;
    const header = [
      "Tracking ID",
      "Customer",
      "Qty",
      "Point Of Sale",
      "Address",
      "Status",
      "Created At",
    ];
    const rows = orders.map((o) => [
      o.trackingId,
      `${o.user.firstName} ${o.user.lastName}`,
      o.orderItems.reduce((n, i) => n + i.qty, 0),
      o.pointOfSale,
      o.shippingAddress.address,
      o.status,
      new Date(o.createdAt).toLocaleString(),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: "shipments.csv",
    });
    a.click();
    URL.revokeObjectURL(url);
  };

  const StatCard = ({ label, value, delta, Icon }) => {
    const positive = delta !== null && delta >= 0;
    return (
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>

          {delta !== null && (
            <div
              className={`inline-flex items-center text-sm mt-2 ${
                positive ? "text-green-600" : "text-red-600"
              }`}
            >
              {positive ? (
                <FiArrowUp className="mr-1" />
              ) : (
                <FiArrowDown className="mr-1" />
              )}
              {Math.abs(delta).toFixed(1)}% today
            </div>
          )}
        </div>
        <Icon className="text-4xl text-gray-300" />
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Store Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor store &amp; delivery progress
          </p>
        </div>

        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <FiDownload className="mr-2 text-gray-500" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Pending Orders"
          value={pendingCount}
          delta={null}
          Icon={FiClock}
        />
        <StatCard
          label="Total Approved Orders"
          value={approvedCount}
          delta={null}
          Icon={FiTruck}
        />
        <StatCard
          label="Daily Approved Orders"
          value={approvedToday}
          delta={deltaApproved}
          Icon={FiPackage}
        />
      </div>
    </div>
  );
}
