// src/components/SelectedItemCard.jsx
import React from 'react'
import {
  FiChevronRight,
  FiChevronDown,
  FiTrash2,
} from 'react-icons/fi'

const SelectedItemCard = ({ 
  expanded, 
  onToggle, 
  product = {}, 
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* header row */}
      <div
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
      >
        {expanded ? (
          <FiChevronDown className="text-gray-600" />
        ) : (
          <FiChevronRight className="text-gray-600" />
        )}

        <div className="flex items-center space-x-4 flex-1 px-2">
          <img
            src={product.image}
            alt={product.name}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div>
            <h3 className="text-gray-800 font-medium">{product.name}</h3>
            <p className="text-gray-500 text-sm">{product.specs}</p>
          </div>
        </div>

        <FiTrash2 className="text-gray-400 hover:text-gray-600 mr-4" />
      </div>

      {/* expanded details */}
      {expanded && (
        <div className="border-t border-gray-200 px-4 py-6 space-y-6">
          {/* options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Choose Ram', value: '8gb ram' },
              { label: 'Choose Storage', value: '256gb' },
              { label: 'Choose Processor', value: 'Core i5' },
            ].map(({ label, value }) => (
              <div key={label}>
                <label className="block text-sm text-gray-600 mb-1">
                  {label}
                </label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>{value}</option>
                </select>
              </div>
            ))}
          </div>

          {/* qty & price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Quantity
              </label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option>1</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Price</label>
              <input
                type="text"
                placeholder="NGN 2,135,000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SelectedItemCard
