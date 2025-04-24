import React, { useState } from "react";
import { FiMoreVertical, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const tabs = [
  { label: "All orders", count: 429 },
  { label: "Orders Pending", count: 2 },
  { label: "Orders In Transit" },
  { label: "Orders Fulfilled" },
];

const data = [
  {
    id: "#KD1890",
    customer: "Kyle Reynolds",
    date: "May 11, 2023",
    source: "Website",
    quantity: "20 Items",
    payment: "Paid",
    status: "Delivered",
  },
  {
    id: "#KM4668",
    customer: "Kyle Reynolds",
    date: "May 11, 2023",
    source: "Walk-in",
    quantity: "10 Items",
    payment: "Pending",
    status: "Delivered",
  },
  {
    id: "#SC4068",
    customer: "Kyle Reynolds",
    date: "May 11, 2023",
    source: "WhatsApp",
    quantity: "10 Items",
    payment: "Paid",
    status: "Delivered",
  },
  {
    id: "#AE1668",
    customer: "Kyle Reynolds",
    date: "May 11, 2023",
    source: "Others",
    quantity: "10 Items",
    payment: "Pending",
    status: "Delivered",
  },
  {
    id: "#JO5342",
    customer: "Kyle Reynolds",
    date: "May 11, 2023",
    source: "Website",
    quantity: "10 Items",
    payment: "Paid",
    status: "In Transit",
  },
  {
    id: "#OP0982",
    customer: "Kyle Reynolds",
    date: "May 11, 2023",
    source: "Walk-in",
    quantity: "10 Items",
    payment: "Paid",
    status: "In Transit",
  },
  {
    id: "#UY9120",
    customer: "Kyle Reynolds",
    date: "May 11, 2023",
    source: "WhatsApp",
    quantity: "10 Items",
    payment: "Paid",
    status: "Pending",
  },
];

export default function OrderTable() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 30;

  const paymentClass = (p) =>
    p === "Paid" ? "text-green-600" : "text-red-600";

  const statusClass = (s) =>
    s === "Delivered"
      ? "bg-green-100 text-green-700"
      : s === "In Transit"
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-700";

  // build page list with ellipses
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, "...", totalPages - 1, totalPages);
    } else if (currentPage > totalPages - 4) {
      pages.push(
        1,
        2,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(
        1,
        2,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages - 1,
        totalPages
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Tabs ── */}
      <div className="overflow-x-auto">
        <nav className="flex space-x-6 px-4 sm:px-0 border-b text-sm font-medium whitespace-nowrap">
          {tabs.map(({ label, count }, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`pb-3 ${
                activeTab === i
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {label}
              {count != null && (
                <span className="ml-1 text-gray-500">{count}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 sm:px-4 sm:py-3">
                <input type="checkbox" />
              </th>
              <th className="px-2 py-2 sm:px-4 sm:py-3 text-xs font-semibold text-gray-600 uppercase">
                Order ID/ Customer
              </th>
              <th className="px-2 py-2 sm:px-4 sm:py-3 text-xs font-semibold text-gray-600 uppercase">
                Customer
              </th>
              <th className="hidden sm:table-cell px-2 py-2 sm:px-4 sm:py-3 text-xs font-semibold text-gray-600 uppercase">
                Date
              </th>
              <th className="hidden sm:table-cell px-2 py-2 sm:px-4 sm:py-3 text-xs font-semibold text-gray-600 uppercase">
                Source
              </th>
              <th className="hidden sm:table-cell px-2 py-2 sm:px-4 sm:py-3 text-xs font-semibold text-gray-600 uppercase">
                Quantity
              </th>
              <th className="hidden md:table-cell px-2 py-2 sm:px-4 sm:py-3 text-xs font-semibold text-gray-600 uppercase">
                Payment Status
              </th>
              <th className="px-2 py-2 sm:px-4 sm:py-3 text-xs font-semibold text-gray-600 uppercase">
                Order Status
              </th>
              <th className="px-2 py-2 sm:px-4 sm:py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => (
              <tr key={row.id}>
                <td className="px-2 py-2 sm:px-4 sm:py-3">
                  <input type="checkbox" />
                </td>
                <td className="px-2 py-2 sm:px-4 sm:py-3">{row.id}</td>
                <td className="px-2 py-2 sm:px-4 sm:py-3">{row.customer}</td>
                <td className="hidden sm:table-cell px-2 py-2 sm:px-4 sm:py-3">
                  {row.date}
                </td>
                <td className="hidden sm:table-cell px-2 py-2 sm:px-4 sm:py-3">
                  {row.source}
                </td>
                <td className="hidden sm:table-cell px-2 py-2 sm:px-4 sm:py-3">
                  {row.quantity}
                </td>
                <td
                  className={`hidden md:table-cell px-2 py-2 sm:px-4 sm:py-3 font-medium ${paymentClass(
                    row.payment
                  )}`}
                >
                  {row.payment}
                </td>
                <td className="px-2 py-2 sm:px-4 sm:py-3">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusClass(
                      row.status
                    )}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 text-right">
                  <FiMoreVertical
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/customer-order-details/${encodeURIComponent(row.id)}`
                      )
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
        <p className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex flex-wrap items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded bg-white border hover:bg-gray-50 disabled:opacity-50"
          >
            <FiChevronLeft />
          </button>

          {pages.map((p, idx) =>
            p === "..." ? (
              <span key={idx} className="px-2 text-gray-400">
                …
              </span>
            ) : (
              <button
                key={idx}
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 rounded ${
                  p === currentPage
                    ? "bg-orange-100 text-orange-600"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded bg-white border hover:bg-gray-50 disabled:opacity-50"
          >
            <FiChevronRight />
          </button>

          <div className="flex items-center space-x-1 ml-4">
            <span className="text-sm text-gray-600">Go to page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) =>
                setCurrentPage(
                  Math.min(totalPages, Math.max(1, Number(e.target.value)))
                )
              }
              className="w-12 text-sm text-center border rounded px-1 py-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
