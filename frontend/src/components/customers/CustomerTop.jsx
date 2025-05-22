/*  src/components/customers/CustomerTop.jsx  */
import React, { useEffect, useState } from "react";
import {
  FiDownload,
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiBarChart2,
  FiArrowUpRight,
  FiArrowDownLeft,
} from "react-icons/fi";
import api from "../../api";
import dayjs from "dayjs";

/* ───────────────────────────────────────────
   Helper to format ±% with two decimals
─────────────────────────────────────────── */
const fmtPct = (num) =>
  (Math.abs(num).toFixed(2).replace(/\.00$/, "") + "%") || "—";

/* arrow + colour based on sign */
const Delta = ({ pct }) =>
  pct === null ? (
    <span className="text-gray-500">—</span>
  ) : pct >= 0 ? (
    <span className="inline-flex items-center text-sm text-green-600">
      <FiArrowUpRight className="mr-0.5" />
      {fmtPct(pct)}
    </span>
  ) : (
    <span className="inline-flex items-center text-sm text-red-600">
      <FiArrowDownLeft className="mr-0.5" />
      {fmtPct(pct)}
    </span>
  );

export default function CustomerTop() {
  /* current-period metrics */
  const [total,      setTotal]      = useState(0);
  const [newCust,    setNewCust]    = useState(0);
  const [activeSub,  setActiveSub]  = useState(0);
  const [repeatRate, setRepeatRate] = useState(0);

  /* deltas vs previous period */
  const [dTotal,      setdTotal]      = useState(null);
  const [dNewCust,    setdNewCust]    = useState(null);
  const [dActiveSub,  setdActiveSub]  = useState(null);
  const [dRepeatRate, setdRepeatRate] = useState(null);

  /* full raw list kept for CSV export */
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/users/customers");
        setCustomers(data);

        /* ───── define periods ─────
           We compare the last 48 h to the 48 h before that.
           Feel free to tweak if you prefer daily/weekly.          */
        const now    = dayjs();
        const P1_END = now;                       // current moment
        const P1_STA = now.subtract(48, "hour");  // 0-48 h ago
        const P0_END = P1_STA;
        const P0_STA = P1_STA.subtract(48, "hour"); // 48-96 h ago

        const inP1 = (d) =>
          dayjs(d.createdAt).isAfter(P1_STA) && dayjs(d.createdAt).isBefore(P1_END);

        const inP0 = (d) =>
          dayjs(d.createdAt).isAfter(P0_STA) && dayjs(d.createdAt).isBefore(P0_END);

        /* helpers for both periods */
        const calcMetrics = (list) => {
          const totalCustomers     = list.length;
          const activeSubscribers  = list.filter((c) => c.totalOrders > 0).length;
          const repeatCustomers    = list.filter((c) => c.totalOrders > 1).length;
          const repeatRate         =
            totalCustomers === 0 ? 0 : (repeatCustomers / totalCustomers) * 100;
          return { totalCustomers, activeSubscribers, repeatRate };
        };

        /* data split */
        const curr = data.filter(inP1);
        const prev = data.filter(inP0);

        /* new customers = created inside period */
        const newCurr = curr.length;
        const newPrev = prev.length;

        /* totals */
        const metCurr = calcMetrics(data);
        const metPrev = calcMetrics(data.filter(inP0).concat(prev));

        /* set state */
        setTotal      (metCurr.totalCustomers);
        setNewCust    (newCurr);
        setActiveSub  (metCurr.activeSubscribers);
        setRepeatRate (metCurr.repeatRate);

        /* deltas (% vs previous) – guard ÷0 */
        const pct = (c, p) => (p === 0 ? null : ((c - p) / p) * 100);

        setdTotal      (pct(metCurr.totalCustomers, metPrev.totalCustomers));
        setdNewCust    (pct(newCurr, newPrev));
        setdActiveSub  (pct(metCurr.activeSubscribers, metPrev.activeSubscribers));
        setdRepeatRate (pct(metCurr.repeatRate,      metPrev.repeatRate));
      } catch (err) {
        console.error("Failed to fetch customer data", err);
      }
    })();
  }, []);

  /* ——— Export CSV ——— */
  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Total Orders",
      "Last Order Date",
      "Status",
    ];
    const rows = customers.map((c) => [
      `${c.firstName} ${c.lastName}`,
      c.email,
      c.whatAppNumber || "",
      c.totalOrders || "0",
      c.lastOrderDate
        ? new Date(c.lastOrderDate).toLocaleDateString()
        : "N/A",
      c.status || "N/A",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `customers_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* cards config */
  const stats = [
    {
      label: "Total customers",
      value: total.toLocaleString(),
      delta: dTotal,
      icon:  <FiUsers />,
    },
    {
      label: "New customers (48 h)",
      value: newCust.toLocaleString(),
      delta: dNewCust,
      icon:  <FiUserPlus />,
    },
    {
      label: "Active subscribers",
      value: activeSub.toLocaleString(),
      delta: dActiveSub,
      icon:  <FiUserCheck />,
    },
    {
      label: "Return customer rate",
      value: repeatRate.toFixed(1) + "%",
      delta: dRepeatRate,
      icon:  <FiBarChart2 />,
    },
  ];

  /* ——— UI ——— */
  return (
    <section className="bg-white rounded-2xl shadow p-6">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Customer Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and view customer information
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2
                     border border-gray-300 rounded-lg text-sm text-gray-700
                     hover:bg-gray-50"
        >
          <FiDownload className="mr-2 text-gray-500" />
          Export CSV
        </button>
      </div>

      {/* cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, delta, icon }, i) => (
          <div
            key={i}
            className="flex items-center justify-between
                       border border-gray-200 rounded-lg p-4"
          >
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">
                {value}
              </p>
              <div className="mt-1">
                <Delta pct={delta} />
              </div>
            </div>
            <div className="text-4xl text-gray-300">{icon}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
