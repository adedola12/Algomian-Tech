// src/components/ShipmentCard.jsx
import React from 'react'

export default function ShipmentCard({
  shippingMethod = 'Park Pick Up',
  onMarkShipped = () => {},
  onChangeMethod = () => {},
  fields = {
    sendingPark: '',
    destinationPark: '',
    trackingId: '',
    driverContact: '',
    dispatchDate: '',
    expectedDate: '',
  },
  onFieldChange = () => {},
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 flex">
      {/* Left colored stripe */}
      <div className="w-1 bg-blue-500 rounded-l-lg" />

      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Shipping Method
            </h2>
            <p className="text-sm text-gray-500">
              Information about the method of shipping customers selects
            </p>
          </div>
          <button
            onClick={onMarkShipped}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg"
          >
            Mark as shipped
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Shipping method selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Shipping Method
            </label>
            <select
              value={shippingMethod}
              onChange={e => onChangeMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option>Logistics</option>
              <option>Park Pick Up</option>
              <option>Self Pick Up</option>
            </select>
          </div>

          {/* Grid inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sending Park
              </label>
              <input
                type="text"
                placeholder="Enter a central park location closest to you"
                value={fields.sendingPark}
                onChange={e => onFieldChange('sendingPark', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination Park
              </label>
              <input
                type="text"
                placeholder="Enter a central park location closest to you"
                value={fields.destinationPark}
                onChange={e => onFieldChange('destinationPark', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tracking ID
              </label>
              <input
                type="text"
                placeholder="Enter tracking ID"
                value={fields.trackingId}
                onChange={e => onFieldChange('trackingId', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver Contact Details
              </label>
              <input
                type="text"
                placeholder="Enter driver contact"
                value={fields.driverContact}
                onChange={e => onFieldChange('driverContact', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dispatch Date
              </label>
              <input
                type="date"
                value={fields.dispatchDate}
                onChange={e => onFieldChange('dispatchDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={fields.expectedDate}
                onChange={e => onFieldChange('expectedDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
