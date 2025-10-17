// src/components/sales/SalesTable.jsx
import React, { useState, useEffect, Fragment, useMemo } from "react";
import api from "../../api";
import {
  FiSearch,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import SingleSalePage from "./SingleSalePage";
import BulkSalePage from "./BulkSalePage.jsx";

import { useLocation } from "react-router-dom";

/* ---------- tiny helper just for the "seed" nav flow ---------- */
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
  const location = useLocation();
  const seedLine = location.state?.product
    ? buildLine(location.state.product)
    : null;

  const [showForm, setShowForm] = useState(seedLine ? { mode: "sale" } : null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // search (product or customer)
  const [q, setQ] = useState("");

  // sorting
  const [sortField, setSortField] = useState("time");
  const [sortOrder, setSortOrder] = useState("desc");
  const [actionsOpenFor, setActionsOpenFor] = useState(null);

  // pagination
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/orders", { withCredentials: true });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const computeTotal = (o) => {
    const items = (o.orderItems || []).reduce(
      (s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0),
      0
    );
    return (
      items +
      (Number(o.shippingPrice) || 0) +
      (Number(o.taxPrice) || 0) -
      (Number(o.discount) || 0)
    );
  };

  const compactDetails = (item = {}) => {
    const spec = (item.soldSpecs && item.soldSpecs[0]) || {};
    const cpu = spec.baseCPU || item.baseCPU || "";
    const ram = spec.baseRam || item.baseRam || "";
    const sto = spec.baseStorage || item.baseStorage || "";
    return [cpu, ram, sto].filter(Boolean).join("/") || "—";
  };

  // map raw orders -> rows
  const rows = useMemo(
    () =>
      (orders || []).map((o) => {
        const names = (o.orderItems || []).map((i) => i?.name).filter(Boolean);
        const first = (o.orderItems || [])[0] || {};
        const productLabel =
          names.length > 1 ? `${names[0]} …` : names[0] || "—";

        const linkedCustomerName = o.user
          ? `${o.user.firstName || ""} ${o.user.lastName || ""}`.trim()
          : "";
        return {
          id: o._id,
          time: new Date(o.createdAt).toLocaleString(),
          product: productLabel,
          productTitle: names.join(", "),
          details: compactDetails(first),
          customer:
            (o.customerName && o.customerName.trim()) ||
            linkedCustomerName ||
            "—",
          salesRep: o.createdBy?.firstName || "—",
          price: `NGN ${Number(
            o.totalPrice ?? computeTotal(o)
          ).toLocaleString()}`,
          status: o.status,
        };
      }),
    [orders]
  );

  const [enterMenuOpen, setEnterMenuOpen] = useState(false);

  // search + sort
  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    const base = !search
      ? rows
      : rows.filter(
          (r) =>
            r.product.toLowerCase().includes(search) ||
            r.customer.toLowerCase().includes(search)
        );

    const sorted = [...base].sort((a, b) => {
      const va = a[sortField];
      const vb = b[sortField];
      if (sortField === "time") {
        return sortOrder === "asc"
          ? new Date(va) - new Date(vb)
          : new Date(vb) - new Date(va);
      }
      if (va < vb) return sortOrder === "asc" ? -1 : 1;
      if (va > vb) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [rows, q, sortField, sortOrder]);

  // reset to page 1 whenever search/sort changes
  useEffect(() => {
    setPage(1);
  }, [q, sortField, sortOrder]);

  // pagination slices
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  const toggleSort = (field) => {
    if (!field) return;
    if (field === sortField) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
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

  const returnSale = async (id) => {
    if (!window.confirm("Return this sale and restock the items?")) return;
    try {
      await api.patch(
        `/api/orders/${id}/return`,
        {},
        { withCredentials: true }
      );
      await fetchOrders();
      alert("Sale returned and stock restored.");
    } catch (err) {
      alert(err?.response?.data?.message || err.message || "Return failed");
    }
  };

  const updateStatus = async (id, status) => {
    await api.put(`/api/orders/${id}/status`, { status });
    fetchOrders();
  };

  // pretty page numbers with ellipsis
  const pageNumbers = useMemo(() => {
    const maxButtons = 7; // how many number buttons to show total
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const showLeft = Math.max(2, page - 1);
    const showRight = Math.min(totalPages - 1, page + 1);
    const list = [1];

    if (showLeft > 2) list.push("…");
    for (let p = showLeft; p <= showRight; p++) list.push(p);
    if (showRight < totalPages - 1) list.push("…");

    list.push(totalPages);
    return list;
  }, [page, totalPages]);

  /* ---------- EARLY RETURNS FOR FORMS ---------- */
  if (showForm?.mode === "sale" || showForm === true) {
    return (
      <SingleSalePage
        mode="sale"
        onClose={() => {
          setShowForm(null);
          fetchOrders();
        }}
      />
    );
  }

  if (showForm?.mode === "invoice") {
    return (
      <SingleSalePage
        mode="invoice"
        onClose={() => {
          setShowForm(null);
          fetchOrders();
        }}
      />
    );
  }

  if (showForm?.mode === "bulk") {
    return (
      <BulkSalePage
        onClose={() => {
          setShowForm(null);
          fetchOrders();
        }}
      />
    );
  }

  /* ---------- DEFAULT TABLE VIEW ---------- */
  return (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
      {/* ---------- header: single line ---------- */}
      <div className="flex items-center gap-3 sm:gap-4 justify-between flex-wrap md:flex-nowrap mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 shrink-0">
          Sales Management
        </h2>
        {/* search grows to fill middle space */}
        <div className="relative flex-1 min-w-[220px] max-w-xl">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by product or customer…"
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Search sales by product or customer"
          />
        </div>

        <div className="flex gap-3 shrink-0 relative">
          {/* Simple menu to open forms */}
          <div className="relative">
            <button
              onClick={() => setEnterMenuOpen((v) => !v)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg"
            >
              + Enter Sales
            </button>
            {enterMenuOpen && (
              <div className="absolute right-0 top-12 w-56 bg-white border rounded-lg shadow-lg z-20">
                <button
                  onClick={() => {
                    setShowForm({ mode: "sale" });
                    setEnterMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Create Single Sale
                </button>
                <button
                  onClick={() => {
                    setShowForm({ mode: "bulk" });
                    setEnterMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Create Multiple Sales
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowForm({ mode: "invoice" })}
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg"
          >
            + Create Invoice
          </button>
        </div>
      </div>

      {/* ---------- table ---------- */}
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
                  ["Product", ""],
                  ["Details", ""],
                  ["Customer", "customer"],
                  ["Sales Rep", "salesRep"],
                  ["Price", ""],
                  ["Status", "status"],
                  ["Action", ""],
                ].map(([label, field]) => (
                  <th
                    key={label}
                    onClick={() => toggleSort(field)}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase cursor-pointer"
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
              {visible.map((r) => (
                <Fragment key={r.id}>
                  <tr className="border-b">
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.time}
                    </td>

                    <td
                      className="px-4 py-4 text-sm text-gray-700"
                      title={r.productTitle}
                    >
                      {r.product}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.details}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.customer}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.salesRep}
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
                            : r.status === "Invoice"
                            ? "bg-purple-100 text-purple-800"
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
                        <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => {
                              setShowForm({ mode: "edit", id: r.id });
                              setActionsOpenFor(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Edit Sale
                          </button>
                          <button
                            onClick={() => {
                              returnSale(r.id);
                              setActionsOpenFor(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Return Sale
                          </button>
                          {/* <button
                            onClick={() => {
                              deleteOrder(r.id);
                              setActionsOpenFor(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Delete Sale
                          </button> */}

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
              {visible.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-sm text-gray-500"
                    colSpan={8}
                  >
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- pagination ---------- */}
      <div className="flex items-center justify-between mt-6 gap-3 flex-wrap">
        <button
          aria-label="Previous page"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`flex items-center px-4 py-2 border rounded-lg ${
            page === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FiChevronLeft className="mr-2" /> Previous
        </button>

        {/* page numbers */}
        <div className="flex items-center gap-1 text-sm">
          {pageNumbers.map((n, idx) =>
            n === "…" ? (
              <span key={`dots-${idx}`} className="px-2 select-none">
                …
              </span>
            ) : (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`px-3 py-1 rounded border ${
                  n === page
                    ? "bg-orange-600 text-white border-orange-600"
                    : "hover:bg-gray-100"
                }`}
              >
                {n}
              </button>
            )
          )}
          <span className="ml-3 text-gray-500">
            Page {page} of {totalPages}
          </span>
        </div>

        <button
          aria-label="Next page"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className={`flex items-center px-4 py-2 border rounded-lg ${
            page === totalPages ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Next <FiChevronRight className="ml-2" />
        </button>
      </div>
    </div>
  );
}
