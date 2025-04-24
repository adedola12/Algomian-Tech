// src/pages/CustomerOrderDetails.jsx
import React from 'react';
import OrderDetTop         from '../components/OrderDetTop';
import OrderItemDet       from '../components/OrderItemDet';
import OrderCustomerCard  from '../components/OrderCustomerCard';

export default function CustomerOrderDetails() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Center everything and add page padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top bar */}
        <OrderDetTop />

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Order items & summary */}
          <div className="lg:col-span-2 space-y-6">
            <OrderItemDet />
          </div>

          {/* Right: Customer/shipping/tracking cards */}
          <div className="space-y-6">
            <OrderCustomerCard />
          </div>
        </div>
      </div>
    </div>
  );
}
