// src/components/OrderTop.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  FiDownload,
  FiTruck,
  FiBox,
  FiShoppingBag,
  FiArrowUpRight,
} from 'react-icons/fi';
import api from '../api'; // your axios instance
import { toast } from 'react-toastify';

export default function OrderTop() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch all orders (admin endpoint)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/api/orders');
        setOrders(data);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // 2. Compute stats
  const stats = useMemo(() => {
    const totalCount = orders.length;
    const totalValue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

    const fulfilled = orders.filter(o => o.status === 'Delivered');
    const inTransit = orders.filter(o => o.status === 'In Transit');

    return {
      total: { count: totalCount, value: totalValue },
      fulfilled: {
        count: fulfilled.length,
        value: fulfilled.reduce((sum, o) => sum + o.totalPrice, 0),
      },
      inTransit: {
        count: inTransit.length,
        value: inTransit.reduce((sum, o) => sum + o.totalPrice, 0),
      },
    };
  }, [orders]);

  // 3. Export CSV
  const handleExport = () => {
    if (!orders.length) return toast.info('No orders to export');

    // define your CSV headers
    const headers = [
      'Order ID',
      'User',
      'Status',
      'Payment Method',
      'Total Price',
      'Created At',
    ];

    // build rows
    const rows = orders.map(o => [
      o._id,
      `${o.user.firstName} ${o.user.lastName}`,
      o.status,
      o.paymentMethod,
      o.totalPrice,
      new Date(o.createdAt).toLocaleString(),
    ]);

    // serialize
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `orders_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <p className="text-center py-8">Loading statistics…</p>;
  }

  // Stat cards configuration
  const cards = [
    {
      title: 'Total Orders',
      value: stats.total.value.toLocaleString(),
      icon: <FiBox className="h-6 w-6 text-gray-400" />,
    },
    {
      title: 'Orders Fulfilled',
      value: stats.fulfilled.value.toLocaleString(),
      icon: <FiShoppingBag className="h-6 w-6 text-gray-400" />,
    },
    {
      title: 'Orders In Transit',
      value: stats.inTransit.value.toLocaleString(),
      icon: <FiTruck className="h-6 w-6 text-gray-400" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Order Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Showing data over the last 30 days
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button
            onClick={handleExport}
            className="flex items-center border border-gray-300 px-4 py-2 rounded text-gray-700 hover:bg-gray-100 transition"
          >
            <FiDownload className="mr-2 h-4 w-4" />
            Export CSV
          </button>
          <button
            className="flex items-center bg-orange-500 px-4 py-2 rounded text-white hover:bg-orange-600 transition"
          >
            Track Order
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ title, value, icon }) => (
          <div
            key={title}
            className="flex justify-between items-center bg-white border rounded-lg p-4 shadow-sm"
          >
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <div className="mt-1 flex items-baseline space-x-2">
                <span className="text-2xl font-semibold text-gray-900">
                  ₦{value}
                </span>
                <span className="flex items-center text-sm text-green-600">
                  <FiArrowUpRight className="h-4 w-4" />
                  <span className="ml-1">5% high today</span>
                </span>
              </div>
            </div>
            {icon}
          </div>
        ))}
      </div>
    </div>
  );
}
