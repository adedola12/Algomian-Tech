import React from 'react';
import {
  FiDownload,
  FiTruck,
  FiBox,
  FiShoppingBag,
  FiArrowUpRight,
} from 'react-icons/fi';

const cards = [
  { title: 'Total Orders',      value: 0, icon: <FiBox className="h-6 w-6 text-gray-400" /> },
  { title: 'Orders Fulfilled',  value: 0, icon: <FiShoppingBag className="h-6 w-6 text-gray-400" /> },
  { title: 'Orders In Transit', value: 0, icon: <FiTruck className="h-6 w-6 text-gray-400" /> },
];

export default function OrderTop() {
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
                  {value}
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
