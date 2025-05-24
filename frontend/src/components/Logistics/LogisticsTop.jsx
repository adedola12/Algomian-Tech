// src/components/Logistics/LogisticsTop.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  FiPackage,
  FiTruck,
  FiClock,
  FiDownload,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';
import { useNavigate }  from 'react-router-dom';
import { fetchAllOrders } from '../../api';           // ← already implemented

/* ---------- helpers ---------------------------------------------------- */
const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const pctChange = (today, yesterday) =>
  yesterday === 0 ? null : ((today - yesterday) / yesterday) * 100;

/* ---------------------------------------------------------------------- */
export default function LogisticsTop() {
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);

  /* pull fresh data once (or add polling here) ------------------------- */
  useEffect(() => {
    fetchAllOrders()
      .then(setOrders)
      .catch((err) => console.error('Failed to load orders:', err));
  }, []);

  /* derived metrics ---------------------------------------------------- */
  const {
    total,
    inTransit,
    pending,
    deltaTotal,
    deltaInTransit,
    deltaPending,
  } = useMemo(() => {
    const todayStart      = startOfDay();
    const yesterdayStart  = startOfDay(new Date(Date.now() - 86_400_000)); // 24h earlier

    const today      = (o) => new Date(o.createdAt) >= todayStart;
    const yesterday  = (o) =>
      new Date(o.createdAt) >= yesterdayStart && new Date(o.createdAt) < todayStart;

    /* counts (all-time) */
    const totalAll     = orders.length;
    const inTransitAll = orders.filter((o) => o.status === 'Shipped').length;
    const pendingAll   = orders.filter((o) => o.status === 'Pending').length;

    /* counts **created today / yesterday** (for % change) */
    const totalToday      = orders.filter(today).length;
    const totalYesterday  = orders.filter(yesterday).length;

    const inTransitToday     = orders.filter((o) => o.status === 'Shipped' && today(o)).length;
    const inTransitYesterday = orders.filter((o) => o.status === 'Shipped' && yesterday(o)).length;

    const pendingToday      = orders.filter((o) => o.status === 'Pending' && today(o)).length;
    const pendingYesterday  = orders.filter((o) => o.status === 'Pending' && yesterday(o)).length;

    return {
      total:       totalAll,
      inTransit:   inTransitAll,
      pending:     pendingAll,
      deltaTotal:      pctChange(totalToday,     totalYesterday),
      deltaInTransit:  pctChange(inTransitToday, inTransitYesterday),
      deltaPending:    pctChange(pendingToday,   pendingYesterday),
    };
  }, [orders]);

  /* CSV export --------------------------------------------------------- */
  const handleExport = () => {
    if (!orders.length) return;
    const header = [
      'Tracking ID',
      'Customer',
      'Qty',
      'Point Of Sale',
      'Address',
      'Status',
      'Created At',
    ];
    const rows = orders.map((o) => [
      o.trackingId,
      `${o.user.firstName} ${o.user.lastName}`,
      o.orderItems.reduce((n, i) => n + i.qty, 0),
      o.pointOfSale,
      o.shippingAddress.address,
      o.status,
      new Date(o.createdAt).toLocaleString(),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
      href: url,
      download: 'shipments.csv',
    });
    a.click();
    URL.revokeObjectURL(url);
  };

  /* reusable block for a single KPI ----------------------------------- */
  const StatCard = ({ label, value, delta, Icon }) => {
    const positive = delta !== null && delta >= 0;
    return (
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>

          {delta !== null && (
            <div
              className={`inline-flex items-center text-sm mt-2 ${
                positive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {positive ? <FiArrowUp className="mr-1" /> : <FiArrowDown className="mr-1" />}
              {Math.abs(delta).toFixed(1)}% today
            </div>
          )}
        </div>
        <Icon className="text-4xl text-gray-300" />
      </div>
    );
  };

  /* ------------------------------------------------------------------ */
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      {/* header row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Shipping Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor shipments &amp; delivery progress
          </p>
        </div>

        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <FiDownload className="mr-2 text-gray-500" />
            Export CSV
          </button>

          <button
            onClick={() => nav('create-shipment')}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700"
          >
            Create Shipment
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Shipments"
          value={total}
          delta={deltaTotal}
          Icon={FiPackage}
        />
        <StatCard
          label="In Transit"
          value={inTransit}
          delta={deltaInTransit}
          Icon={FiTruck}
        />
        <StatCard
          label="Pending"
          value={pending}
          delta={deltaPending}
          Icon={FiClock}
        />
      </div>
    </div>
  );
}
