// src/components/OrderTop.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  FiDownload,
  FiTruck,
  FiBox,
  FiShoppingBag,
  FiArrowUpRight,
} from 'react-icons/fi';
import api from '../api';
import { toast } from 'react-toastify';

export default function OrderTop() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch all orders
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

  // helper: compute a single order’s real total
  const computeTotal = o => {
    const itemsSum = o.orderItems.reduce(
      (sum, i) => sum + i.qty * i.price,
      0
    );
    const shipping = o.shippingPrice || 0;
    const tax      = o.taxPrice      || 0;
    const discount = o.discount      || 0; // if you add discounts in future
    return itemsSum + shipping + tax - discount;
  };

  // 2. Compute all stats in one pass
  const stats = useMemo(() => {
    let totalValue     = 0;
    let fulfilledValue = 0;
    let inTransitValue = 0;

    orders.forEach(o => {
      const ordTotal = computeTotal(o);
      totalValue += ordTotal;
      if (o.status === 'Delivered') {
        fulfilledValue += ordTotal;
      } else if (o.status === 'Shipped') {
        inTransitValue += ordTotal;
      }
    });

    return {
      total:     { count: orders.length,       value: totalValue     },
      fulfilled: { count: orders.filter(o => o.status === 'Delivered').length,
                   value: fulfilledValue                         },
      inTransit: { count: orders.filter(o => o.status === 'Shipped').length,
                   value: inTransitValue                         },
    };
  }, [orders]);

  // 3. Export CSV (same as before)
  const handleExport = () => {
    if (!orders.length) return toast.info('No orders to export');

    const headers = [
      'Order ID',
      'User',
      'Status',
      'Payment Method',
      'Computed Total',
      'Created At',
    ];

    const rows = orders.map(o => [
      o._id,
      `${o.user.firstName} ${o.user.lastName}`,
      o.status,
      o.paymentMethod,
      computeTotal(o),
      new Date(o.createdAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

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

  const cards = [
    {
      title: 'Total Orders Value',
      value: stats.total.value.toLocaleString(),
      icon:  <FiBox className="h-6 w-6 text-gray-400" />,
    },
    {
      title: 'Orders Fulfilled Value',
      value: stats.fulfilled.value.toLocaleString(),
      icon:  <FiShoppingBag className="h-6 w-6 text-gray-400" />,
    },
    {
      title: 'Orders In Transit Value',
      value: stats.inTransit.value.toLocaleString(),
      icon:  <FiTruck className="h-6 w-6 text-gray-400" />,
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
            Showing live totals across all orders
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
