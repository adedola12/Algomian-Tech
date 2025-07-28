/*  src/pages/Dashboard.jsx  */
import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FiDownload,
  FiUsers,
  FiUserCheck,
  FiShoppingCart,
  FiPackage,
} from "react-icons/fi";
import api from "../api";
import { toast } from "react-toastify";

/* ────────── helpers / constants ────────── */
const COLORS = [
  "#ff6600",
  "#fec06b",
  "#4f75ff",
  "#a4c638",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
  "#eab308",
  "#6366f1",
  "#d946ef",
];
const fmt = (v) => (+v || 0).toLocaleString();
const monthKey = (d) =>
  new Date(d).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });

/* ────────── component ────────── */
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const { user } = useAuth();
  const isAdmin = user?.userType === "Admin";
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  /* fetch all three collections in parallel */
  useEffect(() => {
    (async () => {
      try {
        const [uRes, oRes, pRes] = await Promise.all([
          api.get("/api/users/all", { withCredentials: true }),
          api.get("/api/orders", { withCredentials: true }),
          api.get("/api/products", { withCredentials: true }),
        ]);

        setUsers(Array.isArray(uRes.data) ? uRes.data : []);
        setOrders(Array.isArray(oRes.data) ? oRes.data : []);
        setProducts(
          Array.isArray(pRes.data?.products)
            ? pRes.data.products
            : Array.isArray(pRes.data)
            ? pRes.data
            : []
        );
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ────────── aggregated metrics ────────── */
  const metrics = useMemo(() => {
    const usersWithOrders = new Set(orders.map((o) => o.user?._id || o.user))
      .size;

    const inventoryValue = products.reduce(
      (sum, p) => sum + (+p.costPrice || 0) * (+p.quantity || 0),
      0
    );

    const totalSalesValue = orders.reduce(
      (sum, o) => sum + (+o.totalPrice || 0),
      0
    );

    const countsByRole = users.reduce((acc, u) => {
      acc[u.userType] = (acc[u.userType] || 0) + 1;
      return acc;
    }, {});

    const countsByStatus = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalUsers: users.length,
      usersWithOrders,
      countsByRole,
      countsByStatus,
      totalProducts: products.length,
      inventoryValue,
      totalOrders: orders.length,
      totalSalesValue,
    };
  }, [users, orders, products]);

  /* ────────── 6-month per-role line data (Total Users card) ────────── */
  const userLineData = useMemo(() => {
    const now = new Date();
    const months = [...Array(6)].map((_, i) =>
      monthKey(new Date(now.getFullYear(), now.getMonth() - (5 - i), 1))
    );

    const rows = months.map((m) => ({ month: m }));
    users.forEach((u) => {
      const m = monthKey(u.createdAt);
      const row = rows.find((r) => r.month === m);
      if (row) row[u.userType] = (row[u.userType] || 0) + 1;
    });

    const roles = Object.keys(metrics.countsByRole);
    return rows.map((r) =>
      roles.reduce((acc, role) => ({ ...acc, [role]: r[role] || 0 }), r)
    );
  }, [users, metrics.countsByRole]);

  /* ────────── 6-month per-status line data (Total Sales card) ───────── */
  const salesLineData = useMemo(() => {
    const now = new Date();
    const months = [...Array(6)].map((_, i) =>
      monthKey(new Date(now.getFullYear(), now.getMonth() - (5 - i), 1))
    );

    const rows = months.map((m) => ({ month: m }));
    orders.forEach((o) => {
      const m = monthKey(o.createdAt);
      const row = rows.find((r) => r.month === m);
      if (row) row[o.status] = (row[o.status] || 0) + 1;
    });

    const statuses = Object.keys(metrics.countsByStatus);
    return rows.map((r) =>
      statuses.reduce((acc, s) => ({ ...acc, [s]: r[s] || 0 }), r)
    );
  }, [orders, metrics.countsByStatus]);

  /* ────────── Products vs Orders comparison (row 3) ────────── */
  const compLineData = useMemo(() => {
    const now = new Date();
    const months = [...Array(6)].map((_, i) =>
      monthKey(new Date(now.getFullYear(), now.getMonth() - (5 - i), 1))
    );

    const byMonth = (arr) => {
      const m = {};
      arr.forEach((item) => {
        const k = monthKey(item.createdAt);
        m[k] = (m[k] || 0) + 1;
      });
      return months.map((k) => m[k] || 0);
    };

    const productSeries = byMonth(products);
    const orderSeries = byMonth(orders);

    return months.map((label, idx) => ({
      month: label,
      products: productSeries[idx],
      orders: orderSeries[idx],
    }));
  }, [products, orders]);

  /* ────────── CSV export helper ────────── */
  const exportUsersCSV = () => {
    const rows = users.map((u) => [
      `${u.firstName} ${u.lastName}`,
      u.email,
      u.whatAppNumber || "",
      u.userType,
    ]);
    const csv = ["Name,Email,Phone,Role", ...rows.map((r) => r.join(","))].join(
      "\n"
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading)
    return (
      <p className="px-4 py-10 text-sm text-gray-500">Loading dashboard…</p>
    );

  /* ────────── UI ────────── */
  return (
    <section className="space-y-10">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        {isAdmin && (
          <button
            onClick={exportUsersCSV}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2
                     border border-gray-300 rounded-lg text-sm text-gray-700
                     hover:bg-gray-50"
          >
            <FiDownload className="mr-2 text-gray-500" /> Export Users
          </button>
        )}
      </div>

      {/* ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Users */}
        <Card
          title="Total Users"
          Icon={FiUsers}
          big={metrics.totalUsers}
          footer={<Badges counts={metrics.countsByRole} />}
        >
          <LineBlock
            data={userLineData}
            keys={metrics.countsByRole}
            startColorIdx={0}
          />
        </Card>

        {/* Users Who Ordered */}
        <Card
          title="Users Who Ordered"
          Icon={FiUserCheck}
          big={metrics.usersWithOrders}
        >
          <PieBlock
            data={[
              { name: "Ordered", value: metrics.usersWithOrders },
              {
                name: "No Orders",
                value: Math.max(
                  metrics.totalUsers - metrics.usersWithOrders,
                  0
                ),
              },
            ]}
          />
        </Card>
      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Products */}
        <Card
          title="Total Products"
          Icon={FiPackage}
          big={metrics.totalProducts}
          sub={`Inventory ₦${fmt(metrics.inventoryValue)}`}
        >
          <PieBlock
            data={[{ name: "Products", value: metrics.totalProducts }]}
          />
        </Card>

        {/* Total Sales */}
        <Card
          title="Total Sales"
          Icon={FiShoppingCart}
          big={metrics.totalOrders}
          sub={`Revenue ₦${fmt(metrics.totalSalesValue)}`}
          footer={<Badges counts={metrics.countsByStatus} startColorIdx={3} />}
        >
          <LineBlock
            data={salesLineData}
            keys={metrics.countsByStatus}
            startColorIdx={3}
          />
        </Card>
      </div>

      {/* ROW 3 – comparison */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-1">
          Products vs. Orders (last 6 months)
        </h3>
        <div className="w-full h-72">
          <ResponsiveContainer>
            <LineChart data={compLineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="products"
                name="Products added"
                stroke={COLORS[1]}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="orders"
                name="Orders placed"
                stroke={COLORS[3]}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

/* ────────── reusable card ────────── */
function Card({ title, sub, Icon, big, children, footer }) {
  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 flex flex-col">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-800">{fmt(big)}</p>
          {sub && <p className="text-xs text-gray-500">{sub}</p>}
        </div>
        <Icon className="text-4xl text-gray-300" />
      </div>

      <div className="flex-1 flex items-center justify-center mt-4">
        {children}
      </div>

      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}

/* ────────── coloured badges (role / status legend) ────────── */
function Badges({ counts, startColorIdx = 0 }) {
  const keys = Object.keys(counts);
  return (
    <div className="flex flex-wrap gap-3">
      {keys.map((k, idx) => (
        <div key={k} className="flex items-center text-xs">
          <span
            style={{
              background: COLORS[(startColorIdx + idx) % COLORS.length],
            }}
            className="inline-block w-3 h-3 rounded-full mr-1"
          />
          {k}:&nbsp;<span className="font-medium">{fmt(counts[k])}</span>
        </div>
      ))}
    </div>
  );
}

/* ────────── tiny multi-line block (shared by two cards) ────────── */
function LineBlock({ data, keys, startColorIdx = 0 }) {
  const series = Object.keys(keys);
  return (
    <div className="w-full h-44">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(v) => fmt(v)} />
          <Legend />
          {series.map((s, idx) => (
            <Line
              key={s}
              type="monotone"
              dataKey={s}
              stroke={COLORS[(startColorIdx + idx) % COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ────────── donut block (pie) ────────── */
function PieBlock({ data }) {
  return (
    <div className="w-full h-40">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius="60%"
            outerRadius="90%"
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => fmt(v)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
