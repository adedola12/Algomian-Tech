// InventTop.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiDownload, FiBox } from "react-icons/fi";
import api from "../api";

const InventTop = () => {
  const [totalValue, setTotalValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [stats, setStats] = useState({
    soldProducts: 0,
    percentage: 0,
    shippedRevenue: 0,
    shippedChange: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/api/admin/stats", {
          withCredentials: true,
        });
        setTotalValue(data.productTotal);
        setStats({
          soldProducts: data.todayRevenue,
          percentage: data.salesChange.toFixed(1),
          shippedRevenue: data.shippedRevenue,
          shippedChange: data.shippedChange.toFixed(1),
        });
      } catch (err) {
        console.error(err);
        setError("Could not load inventory stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatNGN = (n) =>
    "NGN " +
    n.toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  // if (!perms.includes("stats.view")) return null;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Inventory</h2>
        <div className="flex gap-3">
          <button className="border border-purple-600 text-purple-700 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-purple-50 transition">
            <FiDownload />
            Export
          </button>
          <Link
            to="/inventory/add-product"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-semibold transition"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Product Value */}
        <div className="bg-white shadow-sm border rounded-lg p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Total Products</p>
            {loading ? (
              <h3 className="text-xl font-bold text-gray-800">Loading…</h3>
            ) : error ? (
              <h3 className="text-xl font-bold text-red-600">Error</h3>
            ) : (
              <h3 className="text-xl font-bold text-gray-800">
                {formatNGN(totalValue)}
              </h3>
            )}
            <p className="text-xs text-green-500 mt-1">
              ↑ {stats.percentage}% high today
            </p>
          </div>
          <div className="text-gray-400 text-2xl">
            <FiBox />
          </div>
        </div>

        {/* Sold Products */}
        <div className="bg-white shadow-sm border rounded-lg p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Sold Products</p>
            <h3 className="text-xl font-bold text-gray-800">
              {formatNGN(stats.soldProducts)}
            </h3>
            <p className="text-xs text-green-500 mt-1">
              ↑ {stats.percentage}% high today
            </p>
          </div>
          <div className="text-gray-400 text-2xl">
            <FiBox />
          </div>
        </div>

        {/* Refunded Items Placeholder */}
        <div className="bg-white shadow-sm border rounded-lg p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Refunded Items</p>
            <h3 className="text-xl font-bold text-gray-800">—</h3>
            <p className="text-xs text-gray-400 mt-1">No data yet</p>
          </div>
          <div className="text-gray-400 text-2xl">
            <FiBox />
          </div>
        </div>

        {/* Enroute Items (Shipped Orders) */}
        <div className="bg-white shadow-sm border rounded-lg p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Enroute Items</p>
            <h3 className="text-xl font-bold text-gray-800">
              {formatNGN(stats.shippedRevenue)}
            </h3>
            <p className="text-xs text-green-500 mt-1">
              ↑ {stats.shippedChange}% shipped today
            </p>
          </div>
          <div className="text-gray-400 text-2xl">
            <FiBox />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventTop;
