/*  src/components/InvManTable.jsx  */
import React, { useEffect, useState, useMemo } from "react";
import {
  FiMoreVertical,
  FiStar,
  FiEye,
  FiCornerDownLeft,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchAllOrders } from "../../api";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

/* ───────────────────────── helpers ───────────────────────── */
const arrow = (active, dir) => (active ? (dir === "asc" ? " ▲" : " ▼") : "");

// last 4 digits from trackingId or _id
const shortFour = (val = "") => {
  const s = String(val);
  const onlyDigits = s.replace(/\D+/g, "");
  if (onlyDigits.length >= 4) return onlyDigits.slice(-4);
  // fallback: last 4 of raw string if not enough digits
  return s.slice(-4);
};

const firstNameOnly = (full = "") => {
  const t = String(full).trim();
  return t ? t.split(/\s+/)[0] : "—";
};

const pickPhone = (o) =>
  o.customerPhone || o.shippingAddress?.phone || o.user?.whatAppNumber || "—";

const compare = (a, b, key, dir) => {
  const mult = dir === "asc" ? 1 : -1;

  if (key === "qty") {
    return mult * ((a.qty || 0) - (b.qty || 0));
  }
  if (key === "cust") {
    const an = (a.customer || "").toString();
    const bn = (b.customer || "").toString();
    return mult * an.localeCompare(bn);
  }
  if (key === "status") {
    return mult * (a.status || "").localeCompare(b.status || "");
  }
  // track / others as string compare
  return mult * String(a[key] || "").localeCompare(String(b[key] || ""));
};

/* ───────────────────────── component ───────────────────────── */
export default function InvManTable() {
  const { currentUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState(currentUser);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("pending");
  const [menuFor, setMenuFor] = useState(null);

  // sorting state
  const [sortBy, setSortBy] = useState("track"); // default col
  const [sortDir, setSortDir] = useState("asc"); // 'asc' | 'desc'

  // mobile "show more columns" toggle
  const [showMoreCols, setShowMoreCols] = useState(false);

  const nav = useNavigate();

  /* ───────── simplified auth bootstrap ───────── */
  useEffect(() => {
    if (user || authLoading) return;
    const token = localStorage.getItem("algomian:token");
    if (!token) return;
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    api
      .get("/api/users/profile", { withCredentials: true })
      .then(({ data }) => setUser(data))
      .catch(() => localStorage.removeItem("algomian:token"));
  }, [user, authLoading]);

  /* ───────── fetch orders once user is known ───────── */
  useEffect(() => {
    if (authLoading) return;
    (async () => {
      const list = await fetchAllOrders();
      setOrders(list);
    })().catch(console.error);
  }, [authLoading]);

  /* ───────── tabs ───────── */
  const tabs = [
    {
      key: "pending",
      label: "Pending Sales Order",
      filter: (o) => ["Pending", "Processing"].includes(o.status),
    },
    {
      key: "approved",
      label: "Approved Orders",
      filter: (o) => o.status === "Shipped",
    },
    {
      key: "completed",
      label: "Completed Orders",
      filter: (o) => o.status === "Delivered",
    },
  ];
  const activeTab = tabs.find((x) => x.key === tab);

  /* ───────── derive rows ───────── */
  const enriched = useMemo(
    () =>
      (orders || []).map((o) => ({
        ...o,
        // keep full tracking for sort; render will shorten for mobile
        track: o.trackingId || o._id || "",
        qty:
          (o.orderItems || []).reduce((s, i) => s + (Number(i.qty) || 0), 0) ||
          0,
        customer:
          (o.customerName && o.customerName.trim()) ||
          `${o.user?.firstName || ""} ${o.user?.lastName || ""}`.trim() ||
          "—",
        phone: pickPhone(o),
        baseDetails: `${o.logisticsAddr || "—"} / ${o.logisticsPhone || "—"}`,
      })),
    [orders]
  );

  const filtered = enriched.filter((o) => activeTab?.filter(o));

  /* ───────── sort ───────── */
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => compare(a, b, sortBy, sortDir)),
    [filtered, sortBy, sortDir]
  );

  /* ───────── column meta ─────────
     NOTE: label switches to compact names on mobile via <span> blocks */
  const COLS = [
    { id: "track", label: "Order ID", sortable: true },
    { id: "cust", label: "Customer", sortable: true },
    { id: "qty", label: "Qty", sortable: true },
    ...(tab === "pending"
      ? [
          { id: "phone", label: "Mobile No." },
          { id: "pos", label: "Point of Sale" },
          { id: "addr", label: "Address" },
        ]
      : [{ id: "logAddr", label: "Base Details" }]),
    { id: "status", label: "Status", sortable: true },
    { id: "action", label: "Action" },
  ];

  const hideOnMobile = (extra = "") =>
    `${showMoreCols ? "table-cell" : "hidden"} md:table-cell ${extra}`;

  /* ───────── render ───────── */
  if (authLoading) return <p className="p-4">Loading…</p>;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow space-y-4">
      {/* Tabs + mobile show/hide control */}
      <div className="flex items-center gap-2 flex-wrap">
        <nav className="flex space-x-4 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-shrink-0 pb-2 text-sm font-medium ${
                tab === t.key
                  ? "border-b-2 border-orange-500 text-orange-600"
                  : "text-gray-600"
              }`}
            >
              {t.label}
              <span className="ml-1 bg-gray-100 px-2 py-0.5 rounded-full text-xs text-gray-800 font-semibold">
                {orders.filter(t.filter).length}
              </span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setShowMoreCols((s) => !s)}
          className="ml-auto md:hidden border rounded px-2 py-1 text-xs"
        >
          {showMoreCols ? "Hide extra columns" : "View more columns"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              {/* Order ID (mobile shows 'ID') */}
              <th
                className="px-3 md:px-4 py-2 md:py-3 text-left text-[11px] md:text-xs font-medium uppercase cursor-pointer select-none w-[20%] md:w-auto"
                onClick={() => {
                  const active = sortBy === "track";
                  if (active) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                  else {
                    setSortBy("track");
                    setSortDir("asc");
                  }
                }}
              >
                <span className="md:hidden">ID</span>
                <span className="hidden md:inline">Order ID</span>
                {arrow(sortBy === "track", sortDir)}
              </th>

              {/* Customer */}
              <th
                className="px-3 md:px-4 py-2 md:py-3 text-left text-[11px] md:text-xs font-medium uppercase cursor-pointer select-none w-[26%] md:w-auto"
                onClick={() => {
                  const active = sortBy === "cust";
                  if (active) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                  else {
                    setSortBy("cust");
                    setSortDir("asc");
                  }
                }}
              >
                Customer
                {arrow(sortBy === "cust", sortDir)}
              </th>

              {/* Qty */}
              <th
                className="px-3 md:px-4 py-2 md:py-3 text-left text-[11px] md:text-xs font-medium uppercase cursor-pointer select-none w-[14%] md:w-auto"
                onClick={() => {
                  const active = sortBy === "qty";
                  if (active) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                  else {
                    setSortBy("qty");
                    setSortDir("asc");
                  }
                }}
              >
                Qty
                {arrow(sortBy === "qty", sortDir)}
              </th>

              {/* Mobile No. (always visible on mobile) */}
              <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[11px] md:text-xs font-medium uppercase w-[26%] md:w-auto">
                Mobile No.
              </th>

              {/* POS / Address / Base details (hidden by default on mobile) */}
              {tab === "pending" ? (
                <>
                  <th
                    className={hideOnMobile(
                      "px-3 md:px-4 py-2 md:py-3 text-left text-[11px] md:text-xs font-medium uppercase"
                    )}
                  >
                    Point of Sale
                  </th>
                  <th
                    className={hideOnMobile(
                      "px-3 md:px-4 py-2 md:py-3 text-left text-[11px] md:text-xs font-medium uppercase"
                    )}
                  >
                    Address
                  </th>
                </>
              ) : (
                <th
                  className={hideOnMobile(
                    "px-3 md:px-4 py-2 md:py-3 text-left text-[11px] md:text-xs font-medium uppercase"
                  )}
                >
                  Base Details
                </th>
              )}

              {/* Status (hidden by default on mobile) */}
              <th
                className={hideOnMobile(
                  "px-3 md:px-4 py-2 md:py-3 text-left text-[11px] md:text-xs font-medium uppercase cursor-pointer select-none"
                )}
                onClick={() => {
                  const active = sortBy === "status";
                  if (active) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                  else {
                    setSortBy("status");
                    setSortDir("asc");
                  }
                }}
              >
                Status
                {arrow(sortBy === "status", sortDir)}
              </th>

              {/* Action → "A" on mobile */}
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[11px] md:text-xs font-medium uppercase w-[10%] md:w-auto">
                <span className="md:hidden">A</span>
                <span className="hidden md:inline">Action</span>
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {sorted.map((o) => {
              const phone = o.phone;
              const shortId = shortFour(o.track || o._id);
              const customerFirst = firstNameOnly(o.customer);

              return (
                <tr key={o._id} className="whitespace-nowrap">
                  {/* Order ID: 4 digits on mobile, full on desktop (title) */}
                  <td
                    className="px-3 md:px-4 py-2 md:py-3 font-medium text-gray-800 truncate max-w-[80px] md:max-w-none"
                    title={o.track}
                  >
                    <span className="md:hidden">{shortId}</span>
                    <span className="hidden md:inline">{o.track}</span>
                  </td>

                  {/* Customer: first name on mobile */}
                  <td
                    className="px-3 md:px-4 py-2 md:py-3 text-gray-800 truncate max-w-[120px] md:max-w-none"
                    title={o.customer}
                  >
                    <span className="md:hidden">{customerFirst}</span>
                    <span className="hidden md:inline">
                      {o.customer || "—"}
                    </span>
                  </td>

                  {/* Qty: number only */}
                  <td className="px-3 md:px-4 py-2 md:py-3 text-gray-800">
                    {o.qty}
                  </td>

                  {/* Mobile No. */}
                  <td className="px-3 md:px-4 py-2 md:py-3 text-gray-800">
                    {phone}
                  </td>

                  {/* POS / Address / Base details (hidden on mobile unless toggled) */}
                  {tab === "pending" ? (
                    <>
                      <td className={hideOnMobile("px-3 md:px-4 py-2 md:py-3")}>
                        {o.pointOfSale || "—"}
                      </td>
                      <td className={hideOnMobile("px-3 md:px-4 py-2 md:py-3")}>
                        {o.shippingAddress?.address}, {o.shippingAddress?.city}
                      </td>
                    </>
                  ) : (
                    <td className={hideOnMobile("px-3 md:px-4 py-2 md:py-3")}>
                      {o.baseDetails}
                    </td>
                  )}

                  {/* Status (hidden on mobile unless toggled) */}
                  <td className={hideOnMobile("px-3 md:px-4 py-2 md:py-3")}>
                    <span
                      className={`px-2 inline-flex text-[11px] font-semibold rounded-full ${
                        o.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : o.status === "Processing"
                          ? "bg-gray-200 text-gray-900"
                          : o.status === "Shipped"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-2 md:px-4 py-2 md:py-3 text-right relative">
                    <button
                      className="text-gray-500 hover:text-gray-800"
                      onClick={() =>
                        setMenuFor(menuFor === o._id ? null : o._id)
                      }
                      aria-label="Row actions"
                      title="Actions"
                    >
                      <FiMoreVertical />
                    </button>

                    {menuFor === o._id && (
                      <ActionMenu
                        order={o}
                        nav={nav}
                        close={() => setMenuFor(null)}
                        tab={tab}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────── Action menu (unchanged) ───────── */
function MenuItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50"
    >
      {icon}
      {label}
    </button>
  );
}

function ActionMenu({ order: o, nav, close, tab }) {
  return (
    <div
      className="absolute right-4 z-10 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg"
      onMouseLeave={close}
    >
      {tab === "pending" && (
        <MenuItem
          icon={<FiStar className="mr-2 text-indigo-600" />}
          label="Manage Order Shipment"
          onClick={() => {
            close();
            nav(`/invman-order-details/${o._id}`);
          }}
        />
      )}

      {tab === "approved" && (
        <>
          <MenuItem
            icon={<FiCornerDownLeft className="mr-2 text-red-600" />}
            label="Return Order"
            onClick={async () => {
              try {
                await api.post(
                  `/api/returns/${o._id}/return`,
                  {},
                  { withCredentials: true }
                );
                toast.success("Order returned successfully.");
                window.location.reload();
              } catch (err) {
                toast.error(
                  err.response?.data?.message || "Failed to return order."
                );
              }
            }}
          />
          <MenuItem
            icon={<FiEye className="mr-2 text-blue-600" />}
            label="View Order"
            onClick={() => {
              close();
              nav(`/invent-order-details/${o._id}`);
            }}
          />
        </>
      )}

      {tab === "completed" && (
        <MenuItem
          icon={<FiEye className="mr-2 text-blue-600" />}
          label="View Order"
          onClick={() => {
            close();
            nav(`/customer-order-details/${o._id}`);
          }}
        />
      )}
    </div>
  );
}
