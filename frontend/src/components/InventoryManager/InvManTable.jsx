/*  src/components/Logistics/LogisticsTable.jsx  */
import React, { useEffect, useState } from "react";
import { FiMoreVertical, FiStar, FiCheckCircle, FiSend } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// import jwtDecode from "jwt-decode"; // yarn add jwt-decode
import { fetchAllOrders } from "../../api";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

/* ordered list of logistics steps */
const LOG_STEPS = ["Processing", "RiderOnWay", "InTransit", "Delivered"];

export default function LogisticsTable() {
  /* ---------------------------------------------------------------- */
  const { currentUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState(currentUser); // local mirror
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("ready");
  const [leading, setLeading] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const nav = useNavigate();

  const jwtDecode = (token) => {
    try {
      const [, payload] = token.split(".");
      return JSON.parse(
        decodeURIComponent(
          atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        )
      );
    } catch {
      return null;
    }
  };

  /* ───────────── 1) hydrate user directly from token ────────────── */
  useEffect(() => {
    if (user || authLoading) return; // already have one / still loading

    const token = localStorage.getItem("algomian:token");
    if (!token) return; // guest → keep user = null

    /* decode just the payload { _id, iat, exp, … } so we can attach
       the header before hitting “/profile”                                */
    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch {
      return;
    } // invalid token – do nothing

    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    (async () => {
      try {
        const { data } = await api.get("/api/users/profile", {
          withCredentials: true,
        });
        setUser(data);
      } catch {
        /* token expired ⇒ wipe it */
        localStorage.removeItem("algomian:token");
      }
    })();
  }, [user, authLoading]);

  /* ───────────── 2) load orders once we know the user (or lack of) ─ */
  useEffect(() => {
    if (authLoading) return; // still waiting for context fetch

    (async () => {
      /* fetch list according to role */
      const list =
        user?.userType === "Logistics"
          ? (await api.get("/api/logistics/my", { withCredentials: true })).data
          : await fetchAllOrders();

      /* rider rows have .order – flatten them */
      const normalised = list.map((r) => (r.order ? { ...r.order, ...r } : r));

      /* rider: keep only his shipments (paranoia) */
      const scoped =
        user?.userType === "Logistics"
          ? normalised.filter((lg) => String(lg.assignedTo) === user._id)
          : normalised;

      /* enrich shipped/delivered rows */
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

  /* ───────────── helpers (status changes) ───────────────────────── */
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

  /* ───────────── tabs & columns ─────────────────────────────────── */
  const baseTabs = [
    { key: "ready", label: "Ready for Shipping", status: "Pending" },
    { key: "shipped", label: "Shipped", status: "Shipped" },
    { key: "delivered", label: "Delivered Orders", status: "Delivered" },
  ];
  const tabs =
    user?.userType === "Logistics"
      ? baseTabs.filter((t) => t.key !== "ready")
      : baseTabs;

  const filtered = orders.filter(
    (o) => o.status === (tabs.find((x) => x.key === tab)?.status || o.status)
  );

  /* --------------------- columns spec ---------------------------- */
  const baseCols = [
    { id: "track", label: "Order ID" },
    { id: "qty", label: "Qty" },
    { id: "cust", label: "Customer" },
  ];
  const shippedCols = [
    { id: "driver", label: "Driver" },
    { id: "driverPh", label: "Driver No." },
    { id: "logPh", label: "Logistics No." },
    { id: "logAddr", label: "Logistics Addr" },
  ];
  const commonTail = [
    { id: "status", label: "Status" },
    { id: "action", label: "Action" },
  ];

  const COLS =
    tab === "ready"
      ? [
          ...baseCols,
          { id: "phone", label: "Mobile No." },
          { id: "pos", label: "Point of Sale" },
          { id: "addr", label: "Address" },
          ...commonTail,
        ]
      : [...baseCols, ...shippedCols, ...commonTail];

  /* --------------------- UI -------------------------------------- */
  if (authLoading || (localStorage.getItem("algomian:token") && !user)) {
    /* still resolving the token → show spinner */
    return <p className="p-4">Loading…</p>;
  }

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
            <span
              className="ml-1 inline-flex items-center bg-gray-100 text-gray-800
                               text-xs font-semibold px-2 py-0.5 rounded-full"
            >
              {orders.filter((o) => o.status === t.status).length}
            </span>
          </button>
        ))}
      </nav>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {COLS.map((c) => (
                <th
                  key={c.id}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((o) => {
              const qty = o.orderItems.reduce((s, i) => s + i.qty, 0);
              const phone =
                o.shippingAddress.phone || o.user?.whatAppNumber || "—";
              const logStepIdx = LOG_STEPS.indexOf(
                o.logisticsStatus || "Processing"
              );

              return (
                <tr key={o._id} className="whitespace-nowrap">
                  <td className="px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={leading === o.trackingId}
                        onChange={() =>
                          setLeading(
                            leading === o.trackingId ? null : o.trackingId
                          )
                        }
                        className="form-checkbox h-4 w-4 text-purple-600"
                      />
                      <span className="font-medium">{o.trackingId}</span>
                    </div>
                  </td>

                  <td className="px-4 py-2">{qty}</td>
                  <td className="px-4 py-2">
                    {o.user.firstName} {o.user.lastName}
                  </td>

                  {tab === "ready" ? (
                    <>
                      <td className="px-4 py-2">{phone}</td>
                      <td className="px-4 py-2">{o.pointOfSale || "—"}</td>
                      <td className="px-4 py-2">
                        {o.shippingAddress.address}, {o.shippingAddress.city}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2">{o.driverName || "—"}</td>
                      <td className="px-4 py-2">{o.driverContact || "—"}</td>
                      <td className="px-4 py-2">{o.logisticsPhone || "—"}</td>
                      <td className="px-4 py-2">{o.logisticsAddr || "—"}</td>
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

/* ---------------- helpers --------------------------------------- */
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
      className="absolute right-4 z-10 mt-2 w-56 bg-white border
                    border-gray-200 rounded-lg shadow-lg"
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
