import React from 'react'
import { FiChevronLeft } from 'react-icons/fi'

import OrderCard         from './OrderCard'
import ShipmentCard      from './ShipmentCard'
import CustomerCard      from './CustomerCard'
import ShippingInfoCard  from './ShippingInfoCard'
import TrackOrderCard    from './TrackOrderCard'
import { useNavigate } from 'react-router-dom'

export default function CreateShipment() {

    const nav = useNavigate()
  return (
    <div className="space-y-6">
      {/* Back link & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <button
          onClick={() => nav('/logistics')}
          className="inline-flex items-center text-gray-600 hover:text-gray-800"
        >
          <FiChevronLeft className="mr-2" /> Back
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => nav('/logistics')}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            
            className="px-4 py-2 bg-orange-600 text-white rounded-lg"
          >
            Save
          </button>
        </div>
      </div>

      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-1 sm:space-y-0">
        <h1 className="text-2xl font-semibold text-gray-800">
          Order ID: 10001{' '}
          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
            Order Pending
          </span>
        </h1>
        <div className="text-sm text-gray-500">
          Date ordered: 21 Aug, 2023 at 2:45 pm
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (spans 2 cols on desktop) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order summary */}
          <OrderCard />

          {/* Shipping method & form */}
          <ShipmentCard />

          {/* Live Tracking Legend */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Live Tracking
            </h3>
            <div className="flex items-center space-x-6">
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full" />
                <span className="text-sm text-gray-700">Processing</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-700">Delivered</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <CustomerCard />
          <ShippingInfoCard />
          <TrackOrderCard />
        </div>
      </div>
    </div>
  )
}
