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
const PER_PAGE = 15;

const arrow = (on, dir) => (on ? (dir === "asc" ? " ▲" : " ▼") : "");
const compare = (a, b, key, dir) =>
  (dir === "asc" ? 1 : -1) *
  String(a[key] ?? "").localeCompare(String(b[key] ?? ""), "en", {
    sensitivity: "base",
    numeric: true,
  });

const shortFour = (val = "") => {
  const s = String(val);
  const onlyDigits = s.replace(/\D+/g, "");
  if (onlyDigits.length >= 4) return onlyDigits.slice(-4);
  return s.slice(-4);
};

const firstTwoNames = (arr = []) => {
  const names = (arr || []).map((x) => x?.name).filter(Boolean);
  if (names.length <= 2) return names.join(", ") || "—";
  return `${names[0]}, ${names[1]} +${names.length - 2}`;
};

const pickReceiverPhone = (o) =>
  o.receiverPhone || o.shippingAddress?.phone || "—";

const norm = (s = "") => String(s).toLowerCase().trim();
const digits = (s = "") => String(s).replace(/\D+/g, "");

/* ───────────────── component ───────────────── */
export default function LogisticsTable() {
  const { currentUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState(currentUser);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("ready");
  const [menuFor, setMenuFor] = useState(null);

  const [sortBy, setSortBy] = useState("track");
  const [sortDir, setSortDir] = useState("asc");

  const [showMoreCols, setShowMoreCols] = useState(false);

  // search + pagination
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const nav = useNavigate();

  /* ---------- auth hydration ---------- */
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

      const normalized = list.map((r) => (r.order ? { ...r.order, ...r } : r));

      const scoped =
        user?.userType === "Logistics"
          ? normalized.filter((o) => String(o.assignedTo) === user._id)
          : normalized;

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

  /* ---------- actions ---------- */
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
  const TAB_STATUS = {
    ready: ["Pending", "Processing"],
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

  /* ---------- rows ---------- */
  const rows = useMemo(
    () =>
      orders.map((o) => {
        const names = o.orderItems || [];
        const prodTwo = firstTwoNames(names);
        const prodFull = names
          .map((n) => n?.name)
          .filter(Boolean)
          .join(", ");
        const first = names[0] || {};
        const spec =
          first.baseCPU || first.baseRam || first.baseStorage
            ? [first.baseCPU, first.baseRam, first.baseStorage]
                .filter(Boolean)
                .join(" / ")
            : "—";

        return {
          ...o,
          track: o.trackingId || o._id || "",
          idShort: shortFour(o.trackingId || o._id || ""),
          prodTwo,
          prodFull: prodFull || "—",
          spec,
          recvPh: pickReceiverPhone(o),
          recvPhDigits: digits(pickReceiverPhone(o)),
          addr:
            o.shippingAddress?.address ||
            o.shippingAddress?.city ||
            o.pointOfSale ||
            "—",
          driver: o.driverName || "",
          status: o.status,
        };
      }),
    [orders]
  );

  /* ---------- filter + sort + search ---------- */
  const filteredByTab = rows.filter((o) => TAB_STATUS[tab].includes(o.status));

  const filtered = useMemo(() => {
    const needle = norm(q);
    const ndigits = digits(q);
    if (!needle && !ndigits) return filteredByTab;

    return filteredByTab.filter((o) => {
      const inProduct =
        norm(o.prodFull).includes(needle) || norm(o.prodTwo).includes(needle);
      const inPhone = !!ndigits && digits(o.recvPh || "").includes(ndigits);
      return inProduct || inPhone;
    });
  }, [filteredByTab, q]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => compare(a, b, sortBy, sortDir)),
    [filtered, sortBy, sortDir]
  );

  /* ---------- pagination ---------- */
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const pageSafe = Math.min(page, totalPages);
  const start = (pageSafe - 1) * PER_PAGE;
  const pageRows = sorted.slice(start, start + PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [tab, q]);

  /* ---------- column helpers ---------- */
  const hideOnMobile = (extra = "") =>
    `${showMoreCols ? "table-cell" : "hidden"} md:table-cell ${extra}`;

  /* ---------- UI ---------- */
  if (authLoading) return <p className="p-4">Loading…</p>;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow space-y-4">
      {/* Tabs row */}
      <nav className="flex flex-wrap gap-2 md:gap-4">
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

      {/* Search + mobile toggle on ONE line (mobile) */}
      <div className="flex items-center gap-2 flex-nowrap">
        {/* <div className="flex-1 min-w-0">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search product or number…"
            className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 md:w-80"
            aria-label="Search orders by product or receiver number"
          />
        </div> */}

        <button
          type="button"
          onClick={() => setShowMoreCols((s) => !s)}
          className="shrink-0 md:hidden border rounded px-2 py-1 text-xs"
        >
          {showMoreCols ? "Hide cols" : "More cols"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-hidden">
        {/* Mobile: fixed layout with explicit column widths */}
        <table className="w-full table-fixed md:table-auto divide-y divide-gray-200">
          {/* ID 12% · Product 44% · Receiver 38% · A 6% (sums to 100%) */}
          <colgroup className="md:hidden">
            <col style={{ width: "12%" }} />
            <col style={{ width: "44%" }} />
            <col style={{ width: "38%" }} />
            <col style={{ width: "6%" }} />
          </colgroup>

          <thead className="bg-gray-50">
            <tr>
              {/* Order ID */}
              <th
                className="px-1.5 md:px-4 py-1.5 md:py-3 text-left text-[10px] md:text-xs font-semibold uppercase cursor-pointer select-none"
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

              {/* Product */}
              <th
                className="px-1.5 md:px-4 py-1.5 md:py-3 text-left text-[10px] md:text-xs font-semibold uppercase cursor-pointer select-none"
                onClick={() => {
                  const active = sortBy === "prodTwo";
                  if (active) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                  else {
                    setSortBy("prodTwo");
                    setSortDir("asc");
                  }
                }}
              >
                Product
                {arrow(sortBy === "prodTwo", sortDir)}
              </th>

              {/* Receiver No. */}
              <th className="px-1.5 md:px-4 py-1.5 md:py-3 text-left text-[10px] md:text-xs font-semibold uppercase">
                Receiver No.
              </th>

              {/* Hidden group on mobile unless toggled */}
              <th
                className={hideOnMobile(
                  "px-1.5 md:px-4 py-1.5 md:py-3 text-[10px] md:text-xs text-left font-semibold uppercase"
                )}
              >
                Spec
              </th>
              <th
                className={hideOnMobile(
                  "px-1.5 md:px-4 py-1.5 md:py-3 text-[10px] md:text-xs text-left font-semibold uppercase cursor-pointer select-none"
                )}
                onClick={() => {
                  const active = sortBy === "addr";
                  if (active) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                  else {
                    setSortBy("addr");
                    setSortDir("asc");
                  }
                }}
              >
                Address
                {arrow(sortBy === "addr", sortDir)}
              </th>
              <th
                className={hideOnMobile(
                  "px-1.5 md:px-4 py-1.5 md:py-3 text-[10px] md:text-xs text-left font-semibold uppercase"
                )}
              >
                Driver
              </th>
              <th
                className={hideOnMobile(
                  "px-1.5 md:px-4 py-1.5 md:py-3 text-[10px] md:text-xs text-left font-semibold uppercase"
                )}
              >
                Logistics No.
              </th>
              <th
                className={hideOnMobile(
                  "px-1.5 md:px-4 py-1.5 md:py-3 text-[10px] md:text-xs text-left font-semibold uppercase cursor-pointer select-none"
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
              <th className="px-1.5 md:px-4 py-1.5 md:py-3 text-left text-[10px] md:text-xs font-semibold uppercase">
                <span className="md:hidden">A</span>
                <span className="hidden md:inline">Action</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {pageRows.map((o) => {
              const logStepIdx = LOG_STEPS.indexOf(
                o.logisticsStatus || "Processing"
              );

              return (
                <tr key={o._id} className="whitespace-nowrap">
                  {/* Order ID cell – clickable */}
                  <td
                    className="px-1.5 md:px-4 py-2 md:py-3 font-semibold text-gray-800 truncate md:truncate-none"
                    title={o.track}
                  >
                    <button
                      onClick={() => viewOrder(o)}
                      className="text-orange-600 hover:underline cursor-pointer"
                      aria-label={`Open order ${o.track}`}
                      title={`Open order ${o.track}`}
                    >
                      <span className="md:hidden tabular-nums">
                        {o.idShort}
                      </span>
                      <span className="hidden md:inline">{o.track}</span>
                    </button>
                  </td>

                  {/* Product (2 names on mobile) */}
                  <td
                    className="px-1.5 md:px-4 py-2 md:py-3 text-gray-800 truncate"
                    title={o.prodFull}
                  >
                    <span className="md:hidden">{o.prodTwo}</span>
                    <span className="hidden md:inline">{o.prodFull}</span>
                  </td>

                  {/* Receiver No. */}
                  <td className="px-1.5 md:px-4 py-2 md:py-3 text-gray-800 tabular-nums">
                    {o.recvPh}
                  </td>

                  {/* Hidden on mobile unless toggled */}
                  <td className={hideOnMobile("px-1.5 md:px-4 py-2 md:py-3")}>
                    {o.spec}
                  </td>
                  <td className={hideOnMobile("px-1.5 md:px-4 py-2 md:py-3")}>
                    {o.addr}
                  </td>
                  <td className={hideOnMobile("px-1.5 md:px-4 py-2 md:py-3")}>
                    {o.driver || "—"}
                  </td>
                  <td
                    className={hideOnMobile(
                      "px-1.5 md:px-4 py-2 md:py-3 tabular-nums"
                    )}
                  >
                    {o.logisticsPhone || "—"}
                  </td>
                  <td className={hideOnMobile("px-1.5 md:px-4 py-2 md:py-3")}>
                    <span
                      className={`px-2 inline-flex text-[10px] font-semibold rounded-full ${
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

                  {/* Action */}
                  <td className="px-1.5 md:px-4 py-2 md:py-3 text-right relative">
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

            {!pageRows.length && (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-500">
                  No matching orders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Page {pageSafe} of {totalPages}{" "}
          <span className="ml-2 text-gray-500">
            (showing {PER_PAGE} per page)
          </span>
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pageSafe === 1}
            className="px-3 py-1.5 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`px-3 py-1 rounded text-sm ${
                pageSafe === n
                  ? "bg-orange-100 text-orange-600"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={pageSafe === totalPages}
            className="px-3 py-1.5 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
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
          {["RiderOnWay", "InTransit", "Delivered"]
            .filter((s, i) => i > Math.max(-1, logStepIdx - 1))
            .map((step) => (
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
