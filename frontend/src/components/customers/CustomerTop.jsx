// src/components/customers/CustomerTop.jsx
import React from 'react'
import { FiDownload, FiUsers, FiUserPlus, FiUserCheck, FiBarChart2 } from 'react-icons/fi'

export default function CustomerTop({ onExport }) {
  // placeholder stats; replace with real API values
  const stats = [
    { label: 'Total customers',    value: '93,342,705', icon: <FiUsers /> },
    { label: 'New customers',      value: '93,342,705', icon: <FiUserPlus /> },
    { label: 'Active subscribers', value: '93,342,705', icon: <FiUserCheck /> },
    { label: 'Return customer rate', value: '95%',      icon: <FiBarChart2 /> },
  ]

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      {/* Header + Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Customer Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and view customer information</p>
        </div>
        <button
          onClick={onExport}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <FiDownload className="mr-2 text-gray-500"/> Export CSV
        </button>
      </div>

      {/* Stat Cards */}
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
                <FiDownload className="transform rotate-90 mr-1"/>5% high today
              </p>
            </div>
            <div className="text-4xl text-gray-300">{icon}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
