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

/* ---------- display helpers (mobile shaping) ---------- */
const firstTwoWords = (s = "") => {
  const words = String(s).trim().split(/\s+/);
  if (words.length <= 2) return String(s).trim();
  return `${words.slice(0, 2).join(" ")}…`;
};
const firstNameOnly = (full = "") => {
  const t = String(full).trim();
  return t ? t.split(/\s+/)[0] : "—";
};
const repFirst3 = (rep = "") => {
  const t = String(rep).trim();
  return t ? t.slice(0, 3) : "—";
};
const shortDayMonth = (dateLike) => {
  const d = new Date(dateLike);
  return d
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
    .replace(",", "");
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
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [actionsOpenFor, setActionsOpenFor] = useState(null);

  // pagination
  const PAGE_SIZE = 20; // 20 per page works well on mobile
  const [page, setPage] = useState(1);

  // mobile column toggle
  const [showMoreCols, setShowMoreCols] = useState(false);

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
        const firstItem = (o.orderItems || [])[0] || {};
        const productFull = names.join(", ") || "—";
        const productPrimary =
          names.length > 1 ? `${names[0]} …` : names[0] || "—";

        const linkedCustomerName = o.user
          ? `${o.user.firstName || ""} ${o.user.lastName || ""}`.trim()
          : "";

        const created = new Date(o.createdAt);

        return {
          id: o._id,
          createdAt: created, // <-- store actual date for sorting
          timeFull: created.toLocaleString(),
          timeShort: shortDayMonth(created),
          productFull,
          productPrimary,
          productFirstName2: firstTwoWords(names[0] || ""),
          details: compactDetails(firstItem),
          customerFull:
            (o.customerName && o.customerName.trim()) ||
            linkedCustomerName ||
            "—",
          salesRepFull: o.createdBy?.firstName || "—",
          salesRepShort: repFirst3(o.createdBy?.firstName || "—"),
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
            r.productFull.toLowerCase().includes(search) ||
            r.customerFull.toLowerCase().includes(search)
        );

    const sorted = [...base].sort((a, b) => {
      const va = a[sortField];
      const vb = b[sortField];

      if (sortField === "createdAt") {
        return sortOrder === "asc"
          ? va.getTime() - vb.getTime()
          : vb.getTime() - va.getTime();
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
    const maxButtons = 7;
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

  // helper: hide on mobile unless toggled
  const hideOnMobile = (extra = "") =>
    `${showMoreCols ? "table-cell" : "hidden"} md:table-cell ${extra}`;

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
      {/* ---------- header ---------- */}
      <div className="flex items-center gap-3 sm:gap-4 justify-between flex-wrap md:flex-nowrap mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 shrink-0">
          Sales Management
        </h2>

        {/* search */}
        <div className="relative flex-1 min-w-[200px] sm:min-w-[220px] max-w-xl">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by product or customer…"
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            aria-label="Search sales by product or customer"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative w-full md:w-auto justify-between md:justify-end mt-2 md:mt-0">
          {/* Mobile column toggle */}
          <button
            type="button"
            onClick={() => setShowMoreCols((s) => !s)}
            className="md:hidden border rounded px-2 py-1 text-xs"
          >
            {showMoreCols ? "Hide extra columns" : "View more columns"}
          </button>

          {/* Quick actions */}
          <div className="relative">
            <button
              onClick={() => {}}
              className="hidden" // kept for layout parity; menu moved below
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm({ mode: "sale" })}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 sm:px-5 py-2 rounded-lg text-sm"
              >
                + Enter Sales
              </button>
              <button
                onClick={() => setShowForm({ mode: "invoice" })}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-5 py-2 rounded-lg text-sm"
              >
                + Create Invoice
              </button>
              <button
                onClick={() => setShowForm({ mode: "bulk" })}
                className="bg-slate-700 hover:bg-slate-800 text-white px-4 sm:px-5 py-2 rounded-lg text-sm"
              >
                + Multiple Sales
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- table ---------- */}
      {loading ? (
        <p>Loading…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full whitespace-nowrap table-auto">
            <thead>
              <tr className="border-b bg-gray-50">
                {/* Time */}
                <th
                  onClick={() => toggleSort("createdAt")}
                  className="px-3 md:px-4 py-2 md:py-3 text-left text-[11px] md:text-xs font-medium text-gray-500 uppercase cursor-pointer w-[16%] md:w-auto"
                >
                  Time{" "}
                  {sortField === "createdAt" &&
                    (sortOrder === "asc" ? "▲" : "▼")}
                </th>

                {/* Product */}
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[11px] md:text-xs font-medium text-gray-500 uppercase w-[26%] md:w-auto">
                  Product
                </th>

                {/* Details (hidden by default on mobile) */}
                <th
                  className={hideOnMobile(
                    "px-3 md:px-4 py-2 md:py-3 text-left text-[11px] md:text-xs font-medium text-gray-500 uppercase"
                  )}
                >
                  Details
                </th>

                {/* Customer */}
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[11px] md:text-xs font-medium text-gray-500 uppercase w-[18%] md:w-auto">
                  Customer
                </th>

                {/* Sales Rep (mobile label “Rep”) */}
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[11px] md:text-xs font-medium text-gray-500 uppercase w-[12%] md:w-auto">
                  <span className="md:hidden">Rep</span>
                  <span className="hidden md:inline">Sales Rep</span>
                </th>

                {/* Price (hidden by default on mobile) */}
                <th
                  className={hideOnMobile(
                    "px-3 md:px-4 py-2 md:py-3 text-left text-[11px] md:text-xs font-medium text-gray-500 uppercase"
                  )}
                >
                  Price
                </th>

                {/* Status (hidden by default on mobile) */}
                <th
                  className={hideOnMobile(
                    "px-3 md:px-4 py-2 md:py-3 text-left text-[11px] md:text-xs font-medium text-gray-500 uppercase"
                  )}
                >
                  Status
                </th>

                {/* Action → A on mobile */}
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[11px] md:text-xs font-medium text-gray-500 uppercase w-[8%] md:w-auto">
                  <span className="md:hidden">A</span>
                  <span className="hidden md:inline">Action</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {visible.map((r) => (
                <Fragment key={r.id}>
                  <tr className="border-b">
                    {/* Time: mobile short / desktop full */}
                    <td className="px-3 md:px-4 py-3 text-sm text-gray-700">
                      <span className="md:hidden">{r.timeShort}</span>
                      <span className="hidden md:inline">{r.timeFull}</span>
                    </td>

                    {/* Product: first 2 words on mobile */}
                    <td
                      className="px-3 md:px-4 py-3 text-sm text-gray-700 truncate max-w-[140px] md:max-w-none"
                      title={r.productFull}
                    >
                      <span className="md:hidden">
                        {r.productFirstName2 || "—"}
                      </span>
                      <span className="hidden md:inline">
                        {r.productPrimary}
                      </span>
                    </td>

                    {/* Details (hidden on mobile unless toggled) */}
                    <td
                      className={hideOnMobile(
                        "px-3 md:px-4 py-3 text-sm text-gray-700"
                      )}
                    >
                      {r.details}
                    </td>

                    {/* Customer: first name on mobile, full on desktop */}
                    <td
                      className="px-3 md:px-4 py-3 text-sm text-gray-700 truncate max-w-[120px] md:max-w-none"
                      title={r.customerFull}
                    >
                      <span className="md:hidden">
                        {firstNameOnly(r.customerFull)}
                      </span>
                      <span className="hidden md:inline">{r.customerFull}</span>
                    </td>

                    {/* Sales Rep: first 3 letters on mobile */}
                    <td
                      className="px-3 md:px-4 py-3 text-sm text-gray-700"
                      title={r.salesRepFull}
                    >
                      <span className="md:hidden">{r.salesRepShort}</span>
                      <span className="hidden md:inline">{r.salesRepFull}</span>
                    </td>

                    {/* Price (hidden on mobile unless toggled) */}
                    <td
                      className={hideOnMobile(
                        "px-3 md:px-4 py-3 text-sm text-gray-700"
                      )}
                    >
                      {r.price}
                    </td>

                    {/* Status (hidden on mobile unless toggled) */}
                    <td className={hideOnMobile("px-3 md:px-4 py-3")}>
                      <span
                        className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${
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

                    {/* Action menu */}
                    <td className="px-2 md:px-4 py-3 relative">
                      <button
                        onClick={() =>
                          setActionsOpenFor(
                            actionsOpenFor === r.id ? null : r.id
                          )
                        }
                        className="text-gray-500 hover:text-gray-800"
                        aria-label="Row actions"
                        title="Actions"
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
                          <button
                            onClick={() => {
                              deleteOrder(r.id);
                              setActionsOpenFor(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Delete Sale
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
