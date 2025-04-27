// src/components/SalesDelivery.jsx
import React, { useState } from 'react'
import {
  FiTruck,
  FiMapPin,
  FiUser,
  FiPhone,
  FiPlus,
} from 'react-icons/fi'

const SalesDelivery = ({ items = [], onBack, onNext }) => {
  const [deliveryMethod, setDeliveryMethod] = useState('')
  const [parkLocation, setParkLocation] = useState('')

  // stub summary values (replace with real logic if items have prices)
  const subtotal = 0
  const tax = 0
  const total = subtotal + tax

  const methods = [
    { key: 'logistics', label: 'Logistics', icon: <FiTruck /> },
    { key: 'park', label: 'Park Pick up', icon: <FiMapPin /> },
    { key: 'self', label: 'Self Pickup', icon: <FiMapPin /> },
  ]

  return (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-6 space-y-6">
      {/* ── Header & Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Sales Management
          </h2>
          <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">
            Sales
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
            Sales History
          </button>
        </div>
        <button className="flex items-center text-orange-600 hover:text-orange-700">
          <FiPlus className="mr-1" /> Add another order
        </button>
      </div>

      {/* ── Order Summary */}
      <div className="space-y-2">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <img
                src={it.image}
                alt={it.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-medium text-gray-800">{it.name}</h4>
                <p className="text-gray-500 text-sm">{it.specs}</p>
              </div>
            </div>
            <span className="text-gray-600">Qty: 1</span>
          </div>
        ))}
      </div>

      {/* ── Customer & POS Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter Customer’s name
          </label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or product ID"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter Customer’s phone number
          </label>
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or product ID"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Point of Sales
          </label>
          <div className="relative">
            <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or product ID"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* ── Delivery Method */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Delivery Method</h3>
        <div className="space-y-2">
          {methods.map((m) => (
            <div
              key={m.key}
              onClick={() => setDeliveryMethod(m.key)}
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer
                ${
                  deliveryMethod === m.key
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              <div className="flex items-center space-x-2 text-gray-700">
                <span className="text-xl">{m.icon}</span>
                <span>{m.label}</span>
              </div>
              <input
                type="radio"
                name="delivery"
                checked={deliveryMethod === m.key}
                onChange={() => setDeliveryMethod(m.key)}
                className="form-radio text-purple-500"
              />
            </div>
          ))}

          {deliveryMethod === 'park' && (
            <div className="mt-2 ml-8">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Park Location
              </label>
              <input
                type="text"
                placeholder="Enter a central Bus park closest to you"
                value={parkLocation}
                onChange={(e) => setParkLocation(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}
        </div>
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
        <button onClick={onNext} className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg">
          Pay
        </button>
      </div>
    </div>
  )
}

export default SalesDelivery
