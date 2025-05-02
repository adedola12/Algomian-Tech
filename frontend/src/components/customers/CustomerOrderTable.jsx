import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiSearch, FiFilter, FiChevronDown, FiMoreVertical,
} from 'react-icons/fi'

/* sample row – replace with API data */
// const MOCK_ROWS = [
//   { id: 'KD1890', customerId: 'CUS_i2khfmvg3bz7q5r', amount: 'N 2,310,000', date: 'Nov 21, 2011', status: 'Successful' },
// ]

export default function CustomerOrderTable ({ orders = []}) {
  const [selected, setSelected] = useState({})
  const navigate = useNavigate()

  const toggleOne = id => setSelected(s => ({ ...s, [id]: !s[id] }))

  return (
    <section className="space-y-6">
      {/* tab bar */}
      <nav className="border-b border-gray-200">
        <button className="inline-flex items-center pb-2 text-sm font-medium text-orange-600 border-b-2 border-orange-500">
          All orders <span className="ml-1 text-gray-500">({orders.length})</span>
        </button>
      </nav>

      {/* header row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-800">All&nbsp;Orders</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search"
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <button className="flex items-center text-sm text-gray-600 hover:text-gray-800">
            <FiFilter className="mr-1" /> Filter
          </button>
          <button className="flex items-center text-sm text-gray-600 hover:text-gray-800">
            <FiChevronDown className="mr-1" /> Sort
          </button>
        </div>
      </div>

      {/* data table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" className="h-4 w-4 text-orange-600 form-checkbox" />
              </th>
              {['Order No', 'Amount paid', 'Date ordered', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left whitespace-nowrap">
                  {h} <FiChevronDown className="inline ml-1 w-3 h-3 text-gray-400" />
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
          {orders.map(o => (
          <tr key={o._id} className="hover:bg-gray-50">
            <td className="px-4 py-3">
              <input type="checkbox" className="h-4 w-4 text-orange-600 form-checkbox" />
            </td>
            <td className="px-4 py-3 whitespace-nowrap"># {o._id.slice(-6).toUpperCase()}</td>
            <td className="px-4 py-3 whitespace-nowrap">
              NGN {o.totalPrice.toLocaleString()}
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              {new Date(o.createdAt).toLocaleDateString("en-GB")}
            </td>
            <td className="px-4 py-3">
              <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                {o.status}
              </span>
            </td>
            <td className="px-4 py-3 text-right">
              <button className="text-gray-500 hover:text-gray-800">
                <FiMoreVertical />
              </button>
            </td>
          </tr>
        ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
