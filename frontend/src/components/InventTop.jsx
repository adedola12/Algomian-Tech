import React from "react";
import { Link } from "react-router-dom";
import { FiDownload, FiBox } from "react-icons/fi";

const summaryData = [
  { label: "Total Products", value: "93,342,705" },
  { label: "Sold Products", value: "93,342,705" },
  { label: "Refunded Items", value: "93,342,705" },
  { label: "Refunded Items", value: "93,342,705" },
];

const InventTop = () => {
  return (
    <div className="w-full">
      {/* Header row */}
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
        {summaryData.map((item, index) => (
          <div
            key={index}
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
