import React from 'react'
import {
  FiPackage,
  FiTruck,
  FiClock,
  FiDownload,
  FiArrowUp,
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

export default function LogisticsTop() {
  const nav = useNavigate()

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Shipping Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and view customer information
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Shipments */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Total Shipments</p>
            <p className="text-2xl font-semibold text-gray-800 mt-1">1,234</p>
            <div className="inline-flex items-center text-sm text-green-600 mt-2">
              <FiArrowUp className="mr-1" />
              <span>5% high today</span>
            </div>
          </div>
          <FiPackage className="text-4xl text-gray-300" />
        </div>

        {/* In Transit */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">In Transit</p>
            <p className="text-2xl font-semibold text-gray-800 mt-1">9,342,705</p>
            <div className="inline-flex items-center text-sm text-green-600 mt-2">
              <FiArrowUp className="mr-1" />
              <span>5% high today</span>
            </div>
          </div>
          <FiTruck className="text-4xl text-gray-300" />
        </div>

        {/* Pending */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-semibold text-gray-800 mt-1">9,342,705</p>
            <div className="inline-flex items-center text-sm text-green-600 mt-2">
              <FiArrowUp className="mr-1" />
              <span>5% high today</span>
            </div>
          </div>
          <FiClock className="text-4xl text-gray-300" />
        </div>
      </div>
    </div>
  )
}
