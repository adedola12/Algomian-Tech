// src/components/OrderCustomerCard.jsx
import React, { useState } from "react";
import {
  FiChevronDown, FiChevronUp, FiEdit2, FiMapPin, FiPhone, FiMail,
} from "react-icons/fi";

export default function OrderCustomerCard({ order }) {
  const [custOpen, setCustOpen] = useState(true);

  return (
    <div className="space-y-6">
      {/* Customer */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={() => setCustOpen(o => !o)}
          className="w-full flex items-center justify-between px-6 py-4"
        >
          <h3 className="text-lg font-medium">Customer</h3>
          {custOpen ? <FiChevronUp/> : <FiChevronDown/>}
        </button>
        {custOpen && (
          <div className="px-6 pb-6 space-y-3 border-t">
            <div><p className="text-xs text-gray-500">Name</p><p>{order.user.firstName} {order.user.lastName}</p></div>
            <div><p className="text-xs text-gray-500">Email</p><p>{order.user.email}</p></div>
            {/* if you store phone on shippingAddress.phone */}
            {order.shippingAddress.phone && (
              <div><p className="text-xs text-gray-500">Phone</p><p>{order.shippingAddress.phone}</p></div>
            )}
          </div>
        )}
      </div>

      {/* Shipping */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="text-lg font-medium">Shipping Information</h3>
          <button className="flex items-center text-orange-500 hover:text-orange-600">
            <FiEdit2 className="mr-1"/> Edit
          </button>
        </div>
        <div className="px-6 pb-6 space-y-3 border-t">
          <div className="flex items-center"><FiMapPin className="mr-2"/> {order.shippingAddress.address}, {order.shippingAddress.city}</div>
          <div className="flex items-center"><FiMail className="mr-2"/> {order.user.email}</div>
          {order.shippingAddress.phone && (
            <div className="flex items-center"><FiPhone className="mr-2"/> {order.shippingAddress.phone}</div>
          )}
        </div>
      </div>

      {/* Tracking */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4"><h3 className="text-lg font-medium">Order Tracking</h3></div>
        <div className="px-6 pb-6 space-y-4 border-t">
          {[
            { label: "Received",    time: order.createdAt,         done: true },
            { label: "Processing",  time: order.updatedAt,         done: order.status!=="Pending" },
            { label: "Shipped",     time: order.deliveredAt,       done: order.status==="Delivered" },
            { label: "Delivered",   time: order.deliveredAt,       done: order.status==="Delivered" },
          ].map((step,i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className={`mt-1 h-3 w-3 rounded-full ${step.done?"bg-green-500":"bg-gray-300"}`}/>
              <div>
                <p className={step.done?"text-gray-900":"text-gray-500"}>{step.label}</p>
                <p className="text-xs text-gray-400">{step.time && new Date(step.time).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
