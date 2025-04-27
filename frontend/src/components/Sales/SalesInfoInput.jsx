// src/components/SalesInfoInput.jsx
import React, { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import SelectedItemCard from './SelectedItemCard'

const SalesInfoInput = ({ items, setItems, onBack, onNext }) => {
  const [query, setQuery] = useState('')

  // add new product stub on Enter
  const handleSearchKey = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      setItems((prev) => [
        ...prev,
        { ...prev[0], id: Date.now(), expanded: false },
      ])
      setQuery('')
    }
  }

  // toggle expand/collapse
  const toggleItem = (id) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, expanded: !it.expanded } : it))
    )

  // summary calculation (stub)
  const subtotal = 0
  const tax = 0
  const total = subtotal + tax

  return (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-6 space-y-6">
      {/* ── Header & Search */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Title & Tabs */}
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-semibold text-gray-800">Sales Management</h2>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">
              Sales
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
              Sales History
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="w-full lg:w-1/3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search for products to enter sale
          </label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="Search by name or product ID"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* ── Selected Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <SelectedItemCard
            key={item.id}
            product={item}
            expanded={item.expanded}
            onToggle={() => toggleItem(item.id)}
          />
        ))}
      </div>

      {/* ── Summary */}
      <div className="max-w-md ml-auto space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>NGN {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>NGN {tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-gray-800">
          <span>Total</span>
          <span>NGN {total.toFixed(2)}</span>
        </div>
      </div>

      {/* ── Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg"
        >
          Go back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default SalesInfoInput
