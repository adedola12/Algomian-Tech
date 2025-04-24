// InventTop.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiDownload, FiBox } from "react-icons/fi";
import api from "../api";    // ← your axios/fetch wrapper

const InventTop = () => {
  const [totalValue, setTotalValue] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState();

  // other summary cards remain static for now
  const summaryData = [
    { label: "Sold Products",    value: "93,342,705" },
    { label: "Refunded Items",   value: "93,342,705" },
    { label: "Enroute Items",    value: "93,342,705" },
  ];

  useEffect(() => {
    const fetchAndSum = async () => {
      try {
        const { data } = await api.get("/api/products"); 
        // assuming your GET /api/products returns { products: [...], total, ... }
        const sum = data.products.reduce(
          (acc, prod) => acc + Number(prod.sellingPrice || 0),
          0
        );
        setTotalValue(sum);
      } catch (err) {
        console.error(err);
        setError("Could not load products");
      } finally {
        setLoading(false);
      }
    };

    fetchAndSum();
  }, []);

  // formatting helper
  const formatNGN = (n) =>
    "NGN " +
    n.toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

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
        {/* 1st card: dynamic totalValue */}
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
            <p className="text-xs text-green-500 mt-1">↑ 5% high today</p>
          </div>
          <div className="text-gray-400 text-2xl">
            <FiBox />
          </div>
        </div>

        {/* the rest remain static */}
        {summaryData.map((item, idx) => (
          <div
            key={idx}
            className="bg-white shadow-sm border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <h3 className="text-xl font-bold text-gray-800">{item.value}</h3>
              <p className="text-xs text-green-500 mt-1">↑ 5% high today</p>
            </div>
            <div className="text-gray-400 text-2xl">
              <FiBox />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventTop;
