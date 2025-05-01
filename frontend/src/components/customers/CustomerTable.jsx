// src/components/customers/CustomerTable.jsx
import React, { useState, useEffect } from "react";
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

export default function CustomerTable() {
  const [page, setPage] = useState(1);
  const totalPages = 30;
  const navigate = useNavigate();

  // placeholder data; replace with real API
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await api.get("/api/users/customers");
        setCustomers(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      {/* Title + Controls */}
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
              {[
                "Customer Name",
                "Email",
                "Phone Number",
                "Total Orders",
                "Last Order Date",
                "Current Order Status",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((c, idx) => (
              <tr key={idx}>
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-orange-600"
                  />
                  <span className="ml-3 text-gray-800">
                    {`${c.firstName} ${c.lastName}`}
                  </span>
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
                    {c.status || "No Order Found"}
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
            className="p-2 border rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <FiChevronLeft />
          </button>
          {/* page numbers */}
          {Array.from({ length: totalPages }).map((_, i) =>
            i + 1 === page ? (
              <span
                key={i}
                className="w-8 h-8 flex items-center justify-center bg-orange-100 text-orange-600 rounded-lg"
              >
                {i + 1}
              </span>
            ) : i < 3 || i > totalPages - 3 ? (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                {i + 1}
              </button>
            ) : i === 3 ? (
              <span key={i} className="px-2">
                …
              </span>
            ) : null
          )}
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="p-2 border rounded-lg text-gray-600 hover:bg-gray-50"
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
