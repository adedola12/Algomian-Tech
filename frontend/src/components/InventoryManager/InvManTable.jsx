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

const compare = (a, b, key, dir) => {
  const mult = dir === "asc" ? 1 : -1;

  if (key === "qty") {
    return mult * ((a.qty || 0) - (b.qty || 0));
  }
  if (key === "cust") {
    // return mult * a.customer.localeCompare(b.customer);
    const an = (a.customer || "").toString();
    const bn = (b.customer || "").toString();
    return mult * an.localeCompare(bn);
  }
  if (key === "status") {
    return mult * a.status.localeCompare(b.status);
  }
  /* default: string / id */
  return mult * a[key].localeCompare(b[key]);
};

/* ───────────────────────── component ───────────────────────── */
export default function InvManTable() {
  const { currentUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState(currentUser);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("pending");
  const [menuFor, setMenuFor] = useState(null);

  /* NEW: sorting state */
  const [sortBy, setSortBy] = useState("track"); // default col
  const [sortDir, setSortDir] = useState("asc"); // 'asc' | 'desc'

  const nav = useNavigate();

  /* ───────── simplified auth bootstrap (unchanged) ───────── */
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

  /* ───────── tabs (same as before) ───────── */
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

  /* ───────── derive + enrich rows only once, then sort ───────── */
  const enriched = useMemo(
    () =>
      orders.map((o) => ({
        ...o,
        track: o.trackingId,
        qty: o.orderItems?.reduce((s, i) => s + i.qty, 0) || 0,
        // customer: `${o.user?.firstName || ""} ${o.user?.lastName || ""}`.trim(),
        // Prefer the typed customer; fallback to linked user if present
        customer:
          (o.customerName && o.customerName.trim()) ||
          `${o.user?.firstName || ""} ${o.user?.lastName || ""}`.trim() ||
          "—",
      })),
    [orders]
  );

  const filtered = enriched.filter((o) => activeTab?.filter(o));

  /* sort every render based on sortBy + sortDir */
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => compare(a, b, sortBy, sortDir)),
    [filtered, sortBy, sortDir]
  );

  /* ───────── column meta ───────── */
  const COLS = [
    { id: "track", label: "Order ID", sortable: true },
    { id: "qty", label: "Qty", sortable: true },
    { id: "cust", label: "Customer", sortable: true },
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

  /* ───────── render ───────── */
  if (authLoading) return <p className="p-4">Loading…</p>;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow space-y-4">
      {/* Tabs */}
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {COLS.map((c) => {
                const active = sortBy === c.id;
                return (
                  <th
                    key={c.id}
                    className={`px-4 py-3 text-left text-xs font-medium uppercase ${
                      c.sortable ? "cursor-pointer select-none" : ""
                    }`}
                    onClick={() => {
                      if (!c.sortable) return;
                      if (active) {
                        // toggle direction
                        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                      } else {
                        setSortBy(c.id);
                        setSortDir("asc");
                      }
                    }}
                  >
                    {c.label}
                    {c.sortable && arrow(active, sortDir)}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {sorted.map((o) => {
              {
                /* const phone =
                o.shippingAddress?.phone || o.user?.whatAppNumber || "—"; */
              }
              const phone =
                o.customerPhone ||
                o.shippingAddress?.phone ||
                o.user?.whatAppNumber ||
                "—";
              const baseDetails = `${o.logisticsAddr || "—"} / ${
                o.logisticsPhone || "—"
              }`;

              return (
                <tr key={o._id} className="whitespace-nowrap">
                  <td className="px-4 py-2 font-medium">{o.track}</td>
                  <td className="px-4 py-2">{o.qty}</td>
                  <td className="px-4 py-2">{o.customer || "—"}</td>

                  {tab === "pending" ? (
                    <>
                      <td className="px-4 py-2">{phone}</td>
                      <td className="px-4 py-2">{o.pointOfSale || "—"}</td>
                      <td className="px-4 py-2">
                        {o.shippingAddress?.address}, {o.shippingAddress?.city}
                      </td>
                    </>
                  ) : (
                    <td className="px-4 py-2">{baseDetails}</td>
                  )}

                  <td className="px-4 py-2">
                    <span
                      className={`px-2 inline-flex text-xs font-semibold rounded-full ${
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

                  {/* Action menu */}
                  <td className="px-4 py-2 text-right relative">
                    <button
                      className="text-gray-500 hover:text-gray-800"
                      onClick={() =>
                        setMenuFor(menuFor === o._id ? null : o._id)
                      }
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
