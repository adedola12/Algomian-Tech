import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
} from "react-icons/fi";
import api from "../../api";

/* ───────────── sorting helpers ───────────── */
const arrow = (active, dir) => (active ? (dir === "asc" ? " ▲" : " ▼") : "");

const cmp = (a, b, key, dir) => {
  const mult = dir === "asc" ? 1 : -1;

  switch (key) {
    case "name":
      return (
        mult *
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
          "en",
          { sensitivity: "base" }
        )
      );
    case "total":
      return mult * ((a.totalOrders || 0) - (b.totalOrders || 0));
    case "last":
      return (
        mult *
        (new Date(a.lastOrderDate || 0).getTime() -
          new Date(b.lastOrderDate || 0).getTime())
      );
    case "status":
      return (
        mult *
        String(a.status || "").localeCompare(String(b.status || ""), "en", {
          sensitivity: "base",
        })
      );
    default:
      return 0;
  }
};
/* ───────────── component ───────────── */
export default function CustomerTable() {
  const [page, setPage] = useState(1);
  const perPage = 15;
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* NEW: sorting state */
  const [sortBy, setSortBy] = useState("name"); // name | total | last | status
  const [sortDir, setSortDir] = useState("asc"); // asc | desc

  /* ───────── fetch customers once ───────── */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/users/customers");
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ───────── derived, paginated, sorted list ───────── */
  const sorted = useMemo(
    () => [...customers].sort((a, b) => cmp(a, b, sortBy, sortDir)),
    [customers, sortBy, sortDir]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const pageData = sorted.slice((page - 1) * perPage, page * perPage);

  /* ───────── header spec ───────── */
  const HEADERS = [
    { id: "name", label: "Customer Name", sortable: true },
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone Number" },
    { id: "total", label: "Total Orders", sortable: true },
    { id: "last", label: "Last Order Date", sortable: true },
    { id: "status", label: "Current Order Status", sortable: true },
    { id: "action", label: "Action" },
  ];

  /* ───────── UI ───────── */
  if (loading) return <p className="p-6">Loading…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      {/* Title + dummy controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-800">Customers</h2>
        <div className="mt-3 sm:mt-0 flex items-center space-x-4 text-sm text-gray-600">
          <button className="flex items-center space-x-1 hover:text-gray-800">
            <FiSearch /> <span>Search</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-gray-800">
            <FiFilter /> <span>Filter</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-gray-800">
            <FiChevronDown /> <span>Sort</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {HEADERS.map((h) => {
                const active = sortBy === h.id;
                return (
                  <th
                    key={h.id}
                    className={`px-4 py-3 text-left text-xs font-medium uppercase whitespace-nowrap ${
                      h.sortable ? "cursor-pointer select-none" : ""
                    }`}
                    onClick={() => {
                      if (!h.sortable) return;
                      if (active) {
                        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                      } else {
                        setSortBy(h.id);
                        setSortDir("asc");
                      }
                    }}
                  >
                    {h.label}
                    {h.sortable && arrow(active, sortDir)}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {pageData.map((c) => (
              <tr key={c._id}>
                {/* Name + checkbox */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-orange-600 form-checkbox"
                  />
                  <span className="ml-3 text-gray-800">{`${c.firstName} ${c.lastName}`}</span>
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                  {c.email}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                  {c.whatAppNumber}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                  {c.totalOrders > 0 ? c.totalOrders : "No Order Found"}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                  {c.lastOrderDate
                    ? new Date(c.lastOrderDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Yet to order"}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                      c.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : c.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {c.status || "No Order"}
                  </span>
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => navigate(`/customers/${c._id}`)}
                    className="text-gray-400 hover:text-gray-800"
                  >
                    <FiMoreVertical />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <span className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="p-2 border rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <FiChevronLeft />
          </button>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="p-2 border rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <FiChevronRight />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-500">Go to page</label>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={page}
            onChange={(e) => setPage(Number(e.target.value))}
            className="w-16 border rounded-lg px-2 py-1 text-sm text-gray-700"
          />
        </div>
      </div>
    </section>
  );
}
