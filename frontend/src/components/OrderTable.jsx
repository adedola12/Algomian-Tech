// --- Sorting helpers ---
import React, { useState, useEffect, useRef } from "react";
import {
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../api";
import dayjs from "dayjs";

const TABS = [
  { key: "all", label: "All orders" },
  { key: "pending", label: "Orders Pending" },
  { key: "transit", label: "Orders In Transit" },
  { key: "delivered", label: "Orders Fulfilled" },
];

export default function OrderTable() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [me, setMe] = useState(null);
  const perPage = 10;

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [oRes, meRes] = await Promise.all([
          api.get("/api/orders", { withCredentials: true }),
          api.get("/api/users/profile", { withCredentials: true }),
        ]);
        setOrders(oRes.data || []);
        setMe(meRes.data || null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const popRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) {
        setMenuOpenFor(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const paymentClass = (o) => (o.isPaid ? "text-green-600" : "text-red-600");
  const statusClass = (s) =>
    s === "Delivered"
      ? "bg-green-100 text-green-700"
      : s === "Shipped"
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-700";

  const filtered = orders.filter((o) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return o.status === "Pending";
    if (activeTab === "transit") return o.status === "Shipped";
    if (activeTab === "delivered") return o.status === "Delivered";
    return false;
  });

  const sorted = [...filtered].sort((a, b) => {
    const valA =
      sortBy === "user"
        ? `${a.user?.firstName || ""} ${a.user?.lastName || ""}`.toLowerCase()
        : sortBy === "payment"
        ? a.isPaid
        : sortBy === "status"
        ? a.status
        : sortBy === "createdAt"
        ? new Date(a.createdAt)
        : a[sortBy];

    const valB =
      sortBy === "user"
        ? `${b.user?.firstName || ""} ${b.user?.lastName || ""}`.toLowerCase()
        : sortBy === "payment"
        ? b.isPaid
        : sortBy === "status"
        ? b.status
        : sortBy === "createdAt"
        ? new Date(b.createdAt)
        : b[sortBy];

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const toggleSort = (key) => {
    if (sortBy === key) return setSortAsc((asc) => !asc);
    setSortBy(key);
    setSortAsc(true);
  };

  const pageData = sorted.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));

  const SortHeader = ({ label, column }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer"
      onClick={() => toggleSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortBy === column && (sortAsc ? <FiArrowUp /> : <FiArrowDown />)}
      </div>
    </th>
  );

  if (loading) return <p>Loading orders…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <nav className="flex space-x-8 border-b text-sm font-medium">
          {TABS.map(({ key, label }) => {
            const count = orders.filter((o) => {
              if (key === "all") return true;
              if (key === "pending") return o.status === "Pending";
              if (key === "transit") return o.status === "Shipped";
              if (key === "delivered") return o.status === "Delivered";
              return false;
            }).length;

            return (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  setPage(1);
                }}
                className={`pb-3 ${
                  activeTab === key
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {label} <span className="ml-1 text-gray-500">{count}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" />
              </th>
              <SortHeader label="Order ID" column="_id" />
              <SortHeader label="Customer" column="user" />
              <SortHeader label="Date" column="createdAt" />
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Quantity
              </th>
              <SortHeader label="Payment Status" column="payment" />
              <SortHeader label="Order Status" column="status" />
              <th></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {pageData.map((o) => (
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
                  {o.user?.firstName} {o.user?.lastName}
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
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusClass(
                      o.status
                    )}`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="relative px-4 py-3 text-right">
                  <FiMoreVertical
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={() =>
                      setMenuOpenFor(menuOpenFor === o._id ? null : o._id)
                    }
                  />
                  {menuOpenFor === o._id && (
                    <div
                      ref={popRef}
                      className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20"
                    >
                      <button
                        onClick={() => {
                          navigate(`/customer-order-details/${o._id}`);
                          setMenuOpenFor(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        View order
                      </button>
                      {["Admin", "Manager", "SalesRep"].includes(
                        me?.userType
                      ) &&
                        !o.isPaid && (
                          <button
                            onClick={async () => {
                              try {
                                await api.put(
                                  `/api/orders/${o._id}/status`,
                                  { isPaid: true },
                                  { withCredentials: true }
                                );
                                setOrders((prev) =>
                                  prev.map((ord) =>
                                    ord._id === o._id
                                      ? { ...ord, isPaid: true }
                                      : ord
                                  )
                                );
                              } catch (err) {
                                alert(
                                  err.response?.data?.message || err.message
                                );
                              } finally {
                                setMenuOpenFor(null);
                              }
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Mark payment confirmed
                          </button>
                        )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
