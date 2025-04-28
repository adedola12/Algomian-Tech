// src/components/OrderCard.jsx
import React from 'react'

/**
 * @param {object} props
 * @param {Array}  props.items         Array of items in the order. Each item: { id, image, name, specs, serial }
 * @param {string} props.deliveryMode  e.g. "Bus Park – Ojota, Lagos"
 */
export default function OrderCard({ items = [], deliveryMode = '' }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
      {/* Header */}
      <h3 className="text-sm font-medium text-gray-700">
        Order Item – {items.length}
      </h3>

      {/* Line items */}
      <div className="space-y-4">
        {items.map((it) => (
          <div key={it.id} className="flex items-start space-x-4">
            <img
              src={it.image}
              alt={it.name}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{it.name}</h4>
              <p className="text-sm text-gray-500">{it.specs}</p>
              <p className="text-xs text-gray-400 mt-1">SN: {it.serial}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery mode */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm">
        <span className="font-medium text-gray-700">Delivery Mode</span>
        <span className="mt-1 sm:mt-0 text-gray-800">{deliveryMode}</span>
      </div>
    </div>
  )
}
