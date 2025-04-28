// src/components/ShippingInfoCard.jsx
import React from 'react'
import { FiEdit2, FiMapPin, FiPhone, FiMail } from 'react-icons/fi'

export default function ShippingInfoCard({
  address = '20386 Donovans Rd, Georgetown, Delaware(DE)',
  phone   = '+1 23455246337',
  email   = 'alexandramchperson@email.com',
  onEdit  = () => {},          // your edit handler here
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-800">
          Shipping Information
        </h3>
        <button
          onClick={onEdit}
          className="flex items-center text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          <FiEdit2 className="mr-1" /> Edit
        </button>
      </div>

      {/* Details */}
      <ul className="space-y-3 text-sm text-gray-700">
        <li className="flex items-start space-x-2">
          <FiMapPin className="mt-1 text-gray-500" />
          <span>{address}</span>
        </li>
        <li className="flex items-center space-x-2">
          <FiPhone className="text-gray-500" />
          <span>{phone}</span>
        </li>
        <li className="flex items-center space-x-2">
          <FiMail className="text-gray-500" />
          <span>{email}</span>
        </li>
      </ul>
    </div>
  )
}
