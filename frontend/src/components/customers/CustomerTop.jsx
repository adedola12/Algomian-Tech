import React, { useEffect, useState } from 'react';
import {
  FiDownload,
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiBarChart2,
  FiArrowUpRight,
} from 'react-icons/fi';
import api from '../../api';

export default function CustomerTop() {
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [newCustomers, setNewCustomers] = useState(0);
  const [activeSubscribers, setActiveSubscribers] = useState(0);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await api.get('/api/users/customers');
        setCustomers(data);

        const now = Date.now();
        const fortyNineHoursInMs = 49 * 60 * 60 * 1000;

        const recent = data.filter((c) => {
          const created = new Date(c.createdAt).getTime();
          return now - created <= fortyNineHoursInMs;
        });

        const active = data.filter((c) => c.totalOrders && c.totalOrders > 0);

        setTotalCustomers(data.length);
        setNewCustomers(recent.length);
        setActiveSubscribers(active.length);
      } catch (err) {
        console.error('Failed to fetch customer data', err);
      }
    };

    fetchCustomers();
  }, []);

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Total Orders', 'Last Order Date', 'Status'];
    const rows = customers.map((c) => [
      `${c.firstName} ${c.lastName}`,
      c.email,
      c.whatAppNumber || '',
      c.totalOrders || '0',
      c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : 'N/A',
      c.status || 'N/A',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      label: 'Total customers',
      value: totalCustomers.toLocaleString(),
      icon: <FiUsers />,
    },
    {
      label: 'New customers (last 49 hrs)',
      value: newCustomers.toLocaleString(),
      icon: <FiUserPlus />,
    },
    {
      label: 'Active subscribers',
      value: activeSubscribers.toLocaleString(),
      icon: <FiUserCheck />,
    },
    {
      label: 'Return customer rate',
      value: '—',
      icon: <FiBarChart2 />,
    },
  ];

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Customer Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and view customer information</p>
        </div>
        <button
          onClick={exportToCSV}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <FiDownload className="mr-2 text-gray-500" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon }, i) => (
          <div
            key={i}
            className="flex items-center justify-between border border-gray-200 rounded-lg p-4"
          >
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>
              <p className="inline-flex items-center text-sm text-green-600 mt-1">
                <FiArrowUpRight className="mr-1" /> 5% high today
              </p>
            </div>
            <div className="text-4xl text-gray-300">{icon}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
