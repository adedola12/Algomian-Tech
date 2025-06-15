// src/components/SalesTable.jsx
import React, { useState, useEffect, Fragment } from "react";
import api from "../../api";
import {
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import SingleSalePage from "./SingleSalePage";
import { useLocation, useNavigate } from "react-router-dom";

const buildLine = (p) => {
  const first =
    Array.isArray(p.baseSpecs) && p.baseSpecs.length ? p.baseSpecs[0] : {};

  return {
    id: p._id,
    image: p.images?.[0] || "",
    name: p.productName,
    baseRam: first.baseRam || "",
    baseStorage: first.baseStorage || "",
    baseCPU: first.baseCPU || "",
    price: p.sellingPrice,
    qty: 1,
    maxQty: p.quantity,
    variants: p.variants || [],
    variantSelections: [],
    variantCost: 0,
    expanded: false,
  };
};

export default function SalesTable() {
  /* ───── seed from <InventTable> … nav("/sales", {state:{product}}) ───── */
  const location = useLocation();
  const nav = useNavigate();

  const seedLine = location.state?.product
    ? buildLine(location.state.product)
    : null;

  const [showForm, setShowForm] = useState(Boolean(seedLine));

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [filterBy, setFilterBy] = useState("Date");
  const [filterValue, setFilterValue] = useState("");
  const [sortField, setSortField] = useState("time");
  const [sortOrder, setSortOrder] = useState("asc");
  const [taxPercent, setTaxPercent] = useState(0);

  const [deliveryData, setDeliveryData] = useState({
    customerName: "",
    customerPhone: "",
    pointOfSale: "",
    deliveryMethod: "",
    shippingAddress: "",
    parkLocation: "",
    summary: { subtotal: 0, tax: 0, total: 0 },
  });

  const [actionsOpenFor, setActionsOpenFor] = useState(null);

  const computeTotal = (o) => {
    const itemsSum = o.orderItems.reduce((sum, i) => sum + i.qty * i.price, 0);
    return (
      itemsSum + (o.shippingPrice || 0) + (o.taxPrice || 0) - (o.discount || 0)
    );
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await api.get("/api/orders", { withCredentials: true });
      const list = Array.isArray(res.data) ? res.data : [];
      setOrders(list);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = orders
    .filter((o) =>
      o._id.toLowerCase().includes(invoiceFilter.trim().toLowerCase())
    )
    .filter((o) => {
      if (!filterValue) return true;
      switch (filterBy) {
        case "Date":
          return new Date(o.createdAt)
            .toLocaleDateString()
            .includes(filterValue);
        case "Invoice No":
          return o._id
            .slice(-6)
            .toUpperCase()
            .includes(filterValue.toUpperCase());
        case "Status":
          return o.status.toLowerCase().includes(filterValue.toLowerCase());
        default:
          return true;
      }
    })
    .map((o) => ({
      id: o._id,
      time: new Date(o.createdAt).toLocaleString(),
      orderNo: o._id.slice(-6).toUpperCase(),
      customer: o.user
        ? `${o.user.firstName} ${o.user.lastName}`
        : "Unknown User",
      price: `NGN ${computeTotal(o).toLocaleString()}`,
      status: o.status,
      raw: o,
    }))
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (sortField === "time") {
        return sortOrder === "asc"
          ? new Date(valA) - new Date(valB)
          : new Date(valB) - new Date(valA);
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const toggleSort = (field) => {
    if (field === sortField) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Really delete this order?")) return;
    await api.delete(`/api/orders/${id}`);
    fetchOrders();
  };

  const updateStatus = async (id, status) => {
    await api.put(`/api/orders/${id}/status`, { status });
    fetchOrders();
  };

  return showForm ? (
    <SingleSalePage onClose={() => setShowForm(false)} />
  ) : (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Sales Management
        </h2>
        <button
          // onClick={() => setStep(1)}
          onClick={() => setShowForm(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg"
        >
          + Enter Sales
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-4">
        <div className="relative w-full md:w-1/3 mb-2 md:mb-0">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={invoiceFilter}
            onChange={(e) => setInvoiceFilter(e.target.value)}
            placeholder="Search by Invoice No"
            className="w-full pl-12 pr-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex items-center space-x-2">
          <FiFilter className="text-gray-500" />
          <span className="text-gray-600">Filter by</span>
          <select
            value={filterBy}
            onChange={(e) => {
              setFilterBy(e.target.value);
              setFilterValue("");
            }}
            className="border rounded-lg px-3 py-2"
          >
            {["Date", "Invoice No", "Status"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <input
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            placeholder={
              filterBy === "Date"
                ? "e.g. 4/26/2025"
                : filterBy === "Invoice No"
                ? "e.g. DDFD4C"
                : "e.g. Pending"
            }
            className="border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full whitespace-nowrap">
            <thead>
              <tr className="border-b bg-gray-50">
                {[
                  ["Time", "time"],
                  ["Order No", "orderNo"],
                  ["Customer", "customer"],
                  ["Price", ""],
                  ["Status", "status"],
                  ["Action", ""],
                ].map(([label, field]) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase cursor-pointer"
                    onClick={() => field && toggleSort(field)}
                  >
                    {label}
                    {sortField === field && (
                      <span className="ml-1 text-xs">
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <Fragment key={r.id}>
                  <tr className="border-b">
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.time}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.orderNo}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.customer}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.price}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          r.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : r.status === "Processing"
                            ? "bg-blue-100 text-blue-800"
                            : r.status === "Shipped"
                            ? "bg-green-100 text-green-800"
                            : r.status === "Delivered"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 relative">
                      <button
                        onClick={() =>
                          setActionsOpenFor(
                            actionsOpenFor === r.id ? null : r.id
                          )
                        }
                        className="text-gray-500 hover:text-gray-800"
                      >
                        <FiMoreVertical />
                      </button>
                      {actionsOpenFor === r.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => {
                              deleteOrder(r.id);
                              setActionsOpenFor(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Delete Sale
                          </button>
                          <button
                            onClick={() => {
                              updateStatus(r.id, "Processing");
                              setActionsOpenFor(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Mark as Processing
                          </button>
                          <button
                            onClick={() => {
                              updateStatus(r.id, "Shipped");
                              setActionsOpenFor(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Mark as Shipped
                          </button>
                          <button
                            onClick={() => {
                              updateStatus(r.id, "Delivered");
                              setActionsOpenFor(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Mark as Delivered
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button className="flex items-center px-4 py-2 border rounded-lg">
          <FiChevronLeft className="mr-2" /> Previous
        </button>
        <span className="text-sm text-gray-500">Page 1 of 10</span>
        <button className="flex items-center px-4 py-2 border rounded-lg">
          Next <FiChevronRight className="ml-2" />
        </button>
      </div>
    </div>
  );
}
