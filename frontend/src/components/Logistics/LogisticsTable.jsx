
import React, { useState } from 'react'
import { FiMoreVertical, FiStar } from 'react-icons/fi'

export default function LogisticsTable() {
  // tabs state
  const [tab, setTab] = useState('ready')
  // which row is “leading” (highlighted)
  const [leading, setLeading] = useState('#KD1890')

  const tabs = [
    { key: 'ready', label: 'Ready for Shipping', count: 429 },
    { key: 'shipped', label: 'Shipped', count: 120 },
    { key: 'transit', label: 'Orders In Transit', count: 56 },
  ]

  const data = [
    {
      id: '#KD1890',
      qty: '20 Items',
      customer: 'Kyle Reynolds',
      source: 'Website',
      method: 'Logistics company – GIG',
      status: 'Pending',
    },
    {
      id: '#KM4668',
      qty: '10 Items',
      customer: 'Kyle Reynolds',
      source: 'Walk-in',
      method: 'Park Pick-up – Utako Park, Suleja, Abuja',
      status: 'Pending',
    },
    {
      id: '#SC4068',
      qty: '10 Items',
      customer: 'Kyle Reynolds',
      source: 'WhatsApp',
      method: 'Logistics company – GIG',
      status: 'Pending',
    },
    {
      id: '#AE1668',
      qty: '10 Items',
      customer: 'Kyle Reynolds',
      source: 'Others',
      method: 'Logistics company – GIG',
      status: 'Pending',
    },
    {
      id: '#JO5342',
      qty: '10 Items',
      customer: 'Kyle Reynolds',
      source: 'Website',
      method: 'Logistics company – GIG',
      status: 'In Transit',
    },
    {
      id: '#OP0982',
      qty: '10 Items',
      customer: 'Kyle Reynolds',
      source: 'Walk-in',
      method: 'Logistics company – GIG',
      status: 'In Transit',
    },
    {
      id: '#UY9120',
      qty: '10 Items',
      customer: 'Kyle Reynolds',
      source: 'WhatsApp',
      method: 'Logistics company – GIG',
      status: 'Pending',
    },
  ]

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow space-y-4">
      {/* Track Shipment Input */}
      <div>
        <label
          htmlFor="tracking"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Track Shipment
        </label>
        <input
          id="tracking"
          type="text"
          placeholder="Enter Tracking ID"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Tabs */}
      <nav className="flex space-x-4 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-shrink-0 pb-2 text-sm font-medium ${
              tab === t.key
                ? 'border-b-2 border-orange-500 text-orange-600'
                : 'text-gray-600'
            }`}
          >
            {t.label}{' '}
            <span className="ml-1 inline-flex items-center bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {t.count}
            </span>
          </button>
        ))}
      </nav>

      {/* Table */}
      <div className="relative">
        {/* “Leading” badge */}
        <div className="absolute -top-3 left-0 bg-purple-600 text-white px-3 py-1 rounded-tr-lg rounded-br-lg flex items-center space-x-1 text-xs font-semibold">
          <FiStar className="w-4 h-4" />
          <span>Leading</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {/* empty for checkbox/id */}
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Shipping Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row) => {
                const isLeading = row.id === leading
                return (
                  <tr key={row.id}>
                    {/* checkbox + ID */}
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div
                        className={`flex items-center space-x-2 ${
                          isLeading ? 'bg-purple-50 p-1 rounded-lg' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isLeading}
                          onChange={() => setLeading(row.id)}
                          className="form-checkbox h-4 w-4 text-purple-600"
                        />
                        <span
                          className={`font-medium ${
                            isLeading
                              ? 'text-purple-800'
                              : 'text-gray-800'
                          }`}
                        >
                          {row.id}
                        </span>
                      </div>
                    </td>

                    {/* other columns */}
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {row.qty}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {row.customer}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {row.source}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {row.method}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                          row.status === 'Pending'
                            ? 'bg-gray-100 text-gray-800'
                            : row.status === 'In Transit'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* action */}
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      <button className="text-gray-500 hover:text-gray-800">
                        <FiMoreVertical />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
