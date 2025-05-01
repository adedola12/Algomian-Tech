import React, { useEffect, useState } from 'react';
import {
  FiDownload,
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiBarChart2,
} from 'react-icons/fi';
import api from '../../api';

export default function CustomerTop({ onExport }) {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [newCustomers, setNewCustomers] = useState(0);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await api.get('/api/users/customerlist'); // ✅ correct endpoint
// adjust endpoint if needed
        const customers = data.filter((u) => u.userType === 'Customer');

        const now = Date.now();
        const fortyNineHoursInMs = 49 * 60 * 60 * 1000;

        const recentCustomers = customers.filter((u) => {
          const created = new Date(u.createdAt).getTime();
          return now - created <= fortyNineHoursInMs;
        });

        setTotalCustomers(customers.length);
        setNewCustomers(recentCustomers.length);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    fetchCustomers();
  }, []);

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
      value: '—', // placeholder
      icon: <FiUserCheck />,
    },
    {
      label: 'Return customer rate',
      value: '—', // placeholder
      icon: <FiBarChart2 />,
    },
  ];

  return (
    <section className="bg-white rounded-2xl shadow p-6">
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
          onClick={onExport}
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
              <p className="text-2xl font-semibold text-gray-800 mt-1">
                {value}
              </p>
              <p className="inline-flex items-center text-sm text-green-600 mt-1">
                <FiDownload className="transform rotate-90 mr-1" />
                5% high today
              </p>
            </div>
            <div className="text-4xl text-gray-300">{icon}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
