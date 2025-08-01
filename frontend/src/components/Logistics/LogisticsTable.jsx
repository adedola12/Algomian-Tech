/*  src/components/Logistics/LogisticsTable.jsx  */
import React, { useEffect, useState, useMemo } from "react";
import { FiMoreVertical, FiStar, FiCheckCircle, FiSend } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchAllOrders } from "../../api";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

/* ───────────────── helpers ───────────────── */
const LOG_STEPS = ["Processing", "RiderOnWay", "InTransit", "Delivered"];
const arrow = (on, dir) => (on ? (dir === "asc" ? " ▲" : " ▼") : "");
const compare = (a, b, key, dir) =>
  (dir === "asc" ? 1 : -1) *
  String(a[key] ?? "").localeCompare(String(b[key] ?? ""), "en", {
    sensitivity: "base",
    numeric: true,
  });

/* ───────────────── component ───────────────── */
export default function LogisticsTable() {
  const { currentUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState(currentUser);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("ready");
  const [leading, setLeading] = useState(null);
  const [menuFor, setMenuFor] = useState(null);

  /* sorting */
  const [sortBy, setSortBy] = useState("track");
  const [sortDir, setSortDir] = useState("asc");

  const nav = useNavigate();

  /* ---------- auth hydration – unchanged ---------- */
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

  /* ---------- fetch orders ---------- */
  useEffect(() => {
    if (authLoading) return;

    (async () => {
      const list =
        user?.userType === "Logistics"
          ? (await api.get("/api/logistics/my", { withCredentials: true })).data
          : await fetchAllOrders();

      const normalised = list.map((r) => (r.order ? { ...r.order, ...r } : r));

      const scoped =
        user?.userType === "Logistics"
          ? normalised.filter((o) => String(o.assignedTo) === user._id)
          : normalised;

      /* enrich shipped / delivered with live logistics info */
      const enriched = await Promise.all(
        scoped.map(async (o) => {
          if (!["Shipped", "Delivered"].includes(o.status)) return o;
          try {
            const { data: lg } = await api.get(
              `/api/logistics/order/${o._id}`,
              { withCredentials: true }
            );
            return {
              ...o,
              logisticsStatus: lg.status,
              logisticsAddr: lg.deliveryAddress,
              logisticsPhone: lg.deliveryPhone,
              driverContact: lg.driverContact,
              driverName: lg.assignedTo
                ? `${lg.assignedTo.firstName} ${lg.assignedTo.lastName}`
                : "",
            };
          } catch {
            return { ...o, logisticsStatus: "Processing" };
          }
        })
      );

      setOrders(enriched);
    })().catch(console.error);
  }, [user, authLoading]);

  /* ---------- helpers ---------- */
  const markStatus = async (id, status) => {
    try {
      await api.put(
        `/api/orders/${id}/status`,
        { status },
        { withCredentials: true }
      );
      toast.success(`Order marked ${status}`);
      setOrders((p) => p.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setMenuFor(null);
    }
  };

  const markLogStatus = async (id, status) => {
    try {
      await api.put(
        `/api/logistics/order/${id}/status`,
        { status },
        { withCredentials: true }
      );
      toast.success(`Shipment marked ${status}`);
      setOrders((p) =>
        p.map((o) => (o._id === id ? { ...o, logisticsStatus: status } : o))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setMenuFor(null);
    }
  };

  const openShipment = (o, readonly = false) =>
    nav("/logistics/create-shipment", { state: { orderId: o._id, readonly } });

  const viewOrder = (o) => nav(`/customer-order-details/${o._id}`);

  /* ---------- tabs ---------- */
  // each tab can now accept **multiple** order.status values
  const TAB_STATUS = {
    ready: ["Pending", "Processing"], // ← include Processing here
    shipped: ["Shipped"],
    delivered: ["Delivered"],
  };

  const baseTabs = [
    { key: "ready", label: "Ready for Shipping" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered Orders" },
  ];
  const tabs =
    user?.userType === "Logistics"
      ? baseTabs.filter((t) => t.key !== "ready")
      : baseTabs;

  /* ---------- enrich rows with product / spec ---------- */
  const rows = useMemo(
    () =>
      orders.map((o) => {
        /* first product only (what you asked for) */
        const first = o.orderItems?.[0] || {};
        const more = (o.orderItems?.length || 0) - 1;

        const spec =
          first.baseCPU || first.baseRam || first.baseStorage
            ? [first.baseCPU, first.baseRam, first.baseStorage]
                .filter(Boolean)
                .join(" / ")
            : "—";

        return {
          ...o,
          track: o.trackingId,
          prod: more > 0 ? `${first.name} +${more} more` : first.name,
          spec,
          recvPh: o.receiverPhone || o.shippingAddress?.phone || "—",
          addr:
            o.shippingAddress?.address ||
            o.shippingAddress?.city ||
            o.pointOfSale ||
            "—",
          cust: `${o.user?.firstName} ${o.user?.lastName}`.trim(),
          driver: o.driverName || "",
          status: o.status,
        };
      }),
    [orders]
  );

  /* ---------- filter + sort ---------- */
  const filtered = rows.filter((o) => TAB_STATUS[tab].includes(o.status));

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => compare(a, b, sortBy, sortDir)),
    [filtered, sortBy, sortDir]
  );

  /* ---------- column definition ---------- */
  const COLS = [
    { id: "track", label: "Order ID", sortable: true },
    { id: "prod", label: "Product", sortable: true },
    { id: "spec", label: "Spec" },
    { id: "recvPh", label: "Receiver No." },
    { id: "addr", label: "Address", sortable: true },
    ...(tab !== "ready"
      ? [
          { id: "driver", label: "Driver", sortable: true },
          { id: "logisticsPhone", label: "Logistics No." },
        ]
      : []),
    { id: "status", label: "Status", sortable: true },
    { id: "action", label: "Action" },
  ];

  /* ---------- UI ---------- */
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
              {
                orders.filter((o) => TAB_STATUS[t.key].includes(o.status))
                  .length
              }
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
              const logStepIdx = LOG_STEPS.indexOf(
                o.logisticsStatus || "Processing"
              );

              return (
                <tr key={o._id} className="whitespace-nowrap">
                  {/* ------ Order ID (clickable) ------ */}
                  <td className="px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={leading === o.track}
                        onChange={() =>
                          setLeading(leading === o.track ? null : o.track)
                        }
                        className="h-4 w-4 text-purple-600 form-checkbox"
                      />
                      <button
                        onClick={() => viewOrder(o)}
                        className="font-medium text-orange-600 hover:underline"
                      >
                        {o.track}
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-2">{o.prod}</td>
                  <td className="px-4 py-2">{o.spec}</td>
                  <td className="px-4 py-2">{o.recvPh}</td>
                  <td className="px-4 py-2">{o.addr}</td>

                  {tab !== "ready" && (
                    <>
                      <td className="px-4 py-2">{o.driver || "—"}</td>
                      <td className="px-4 py-2">{o.logisticsPhone || "—"}</td>
                    </>
                  )}

                  <td className="px-4 py-2">
                    <span
                      className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                        o.status === "Pending"
                          ? "bg-gray-100 text-gray-800"
                          : o.status === "Shipped"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>

                  {/* ------ Action menu ------ */}
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
                        logStepIdx={logStepIdx}
                        onMarkStatus={markStatus}
                        onMarkLogStatus={markLogStatus}
                        onOpenShipment={openShipment}
                        onViewOrder={viewOrder}
                        close={() => setMenuFor(null)}
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

/* ---------- small helpers ---------- */
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

function ActionMenu({
  order: o,
  logStepIdx,
  onMarkStatus,
  onMarkLogStatus,
  onOpenShipment,
  onViewOrder,
  close,
}) {
  return (
    <div
      className="absolute right-4 z-10 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg"
      onMouseLeave={close}
    >
      {o.status === "Pending" && (
        <>
          <MenuItem
            icon={<FiSend className="mr-2 text-blue-600" />}
            label="Mark as Shipped"
            onClick={() => onMarkStatus(o._id, "Shipped")}
          />
          <MenuItem
            icon={<FiCheckCircle className="mr-2 text-green-600" />}
            label="Mark as Delivered"
            onClick={() => onMarkStatus(o._id, "Delivered")}
          />
          <MenuItem
            icon={<FiSend className="mr-2 text-orange-600" />}
            label="Create Shipment"
            onClick={() => onOpenShipment(o)}
          />
        </>
      )}

      {o.status === "Shipped" && (
        <>
          {LOG_STEPS.filter((s, i) => i > logStepIdx).map((step) => (
            <MenuItem
              key={step}
              icon={
                step === "Delivered" ? (
                  <FiCheckCircle className="mr-2 text-green-600" />
                ) : (
                  <FiSend className="mr-2 text-blue-600" />
                )
              }
              label={step.replace(/([A-Z])/g, " $1")}
              onClick={() => onMarkLogStatus(o._id, step)}
            />
          ))}
          <MenuItem
            icon={<FiStar className="mr-2 text-purple-600" />}
            label="View Shipment"
            onClick={() => onOpenShipment(o, true)}
          />
        </>
      )}

      {o.status === "Delivered" && (
        <MenuItem
          icon={<FiStar className="mr-2 text-purple-600" />}
          label="View Order Details"
          onClick={() => onViewOrder(o)}
        />
      )}
    </div>
  );
}
