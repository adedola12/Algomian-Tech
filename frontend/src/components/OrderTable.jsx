import React, { useState, useEffect } from "react";
import {
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../api";
import dayjs from "dayjs";

const TABS = [
  { key: "all",       label: "All orders"        },
  { key: "pending",   label: "Orders Pending"    },
  { key: "transit",   label: "Orders In Transit" },
  { key: "delivered", label: "Orders Fulfilled"  },
];

export default function OrderTable() {
  const navigate = useNavigate();
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState();
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage]           = useState(1);
  const perPage = 10;

  // fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/api/orders");
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // filter orders by status
  const filtered = orders.filter(o => {
    if (activeTab === "all")       return true;
    if (activeTab === "pending")   return o.status === "Pending";
    if (activeTab === "transit")   return o.status === "Shipped";
    if (activeTab === "delivered") return o.status === "Delivered";
    return false;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const pageData   = filtered.slice((page - 1) * perPage, page * perPage);

  const paymentClass = o => o.isPaid ? "text-green-600" : "text-red-600";
  const statusClass  = s =>
    s === "Delivered"   ? "bg-green-100 text-green-700"
  : s === "Shipped"     ? "bg-blue-100 text-blue-700"
  :                      "bg-gray-100 text-gray-700";

  if (loading) return <p>Loading orders…</p>;
  if (error)   return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-6">

      {/* ── Tabs ── */}
      <div className="overflow-x-auto">
        <nav className="flex space-x-8 border-b text-sm font-medium">
          {TABS.map(({ key, label }) => {
            const count = orders.filter(o => {
              if (key === "all")     return true;
              if (key === "pending")   return o.status === "Pending";
              if (key === "transit")   return o.status === "Shipped";
              if (key === "delivered") return o.status === "Delivered";
              return false;
            }).length;

            return (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setPage(1); }}
                className={`pb-3 ${
                  activeTab === key
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {label}{" "}
                <span className="ml-1 text-gray-500">{count}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3"><input type="checkbox" /></th>
              {[
                "Order ID/ Customer",
                "Customer",
                "Date",
                "Quantity",
                "Payment Status",
                "Order Status",
                "",
              ].map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageData.map(o => (
              <tr key={o._id}>
                <td className="px-4 py-3">
                  <input type="checkbox" />
                </td>
                <td
                  className="px-4 py-3 text-gray-800 cursor-pointer"
                  onClick={() => navigate(`/customer-order-details/${o._id}`)}
                >
                  {o._id.slice(-8)}
                </td>
                <td className="px-4 py-3 text-gray-800">
                  {o.user.firstName} {o.user.lastName}
                </td>
                <td className="px-4 py-3 text-gray-800">
                  {dayjs(o.createdAt).format("MMM D, YYYY")}
                </td>
                <td className="px-4 py-3 text-gray-800">
                  {o.orderItems.reduce((sum, i) => sum + i.qty, 0)} Items
                </td>
                <td className={`px-4 py-3 font-medium ${paymentClass(o)}`}>
                  {o.isPaid ? "Paid" : "Pending"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusClass(o.status)}`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <FiMoreVertical
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={() => navigate(`/customer-order-details/${o._id}`)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded bg-white border hover:bg-gray-50 disabled:opacity-50"
          >
            <FiChevronLeft />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded text-sm ${
                page === i + 1
                  ? "bg-orange-100 text-orange-600"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded bg-white border hover:bg-gray-50 disabled:opacity-50"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
