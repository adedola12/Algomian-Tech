// src/components/OrderCustomerCard.jsx
import React, { useState } from 'react';
import {
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiMapPin,
  FiPhone,
  FiMail,
} from 'react-icons/fi';

export default function OrderCustomerCard() {
  const [custOpen, setCustOpen] = useState(true);

  const trackingSteps = [
    { label: 'Order has been received',        time: '03:00 pm', done: true  },
    { label: 'Order processing',               time: '03:20 pm', done: true  },
    { label: 'Rider is on his way',            time: '05:20 pm', done: false },
    { label: 'Order in transit',               time: '06:00 pm', done: false },
    { label: 'Order delivered successfully',   time: '06:20 pm', done: false },
  ];

  return (
    <div className="space-y-6">
      {/*──── Customers Card ────*/}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <button
          onClick={() => setCustOpen(o => !o)}
          className="w-full flex items-center justify-between px-6 py-4"
        >
          <h3 className="text-lg font-medium text-gray-900">Customers</h3>
          {custOpen ? (
            <FiChevronUp className="text-gray-500" />
          ) : (
            <FiChevronDown className="text-gray-500" />
          )}
        </button>

        {custOpen && (
          <div className="px-6 pb-6 space-y-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Recipient name</p>
              <p className="text-sm text-gray-900">Ire David</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone number</p>
              <p className="text-sm text-gray-900">(+234) 809 205 4532</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm text-gray-900">Olu4oye@gmail.com</p>
            </div>
          </div>
        )}
      </div>

      {/*──── Shipping Info Card ────*/}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Shipping Information</h3>
          <button className="flex items-center text-orange-500 hover:text-orange-600">
            <FiEdit2 className="mr-1" /> Edit
          </button>
        </div>
        <div className="px-6 pb-6 space-y-3 border-t border-gray-100">
          <div className="flex items-center text-gray-700">
            <FiMapPin className="mr-2 text-lg" /> 2038 Donovans Rd, Georgetown, Delaware(DE)
          </div>
          <div className="flex items-center text-gray-700">
            <FiPhone className="mr-2 text-lg" /> +1 234 552 46337
          </div>
          <div className="flex items-center text-gray-700">
            <FiMail className="mr-2 text-lg" /> alexandramcpherson@email.com
          </div>
        </div>
      </div>

      {/*──── Order Tracking Card ────*/}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Order Tracking</h3>
        </div>
        <div className="px-6 pb-6 space-y-4 border-t border-gray-100">
          {trackingSteps.map((step, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div
                className={`mt-1 h-3 w-3 rounded-full ${
                  step.done ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              <div>
                <p className={`${step.done ? 'text-gray-900' : 'text-gray-500'} text-sm`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-400">{step.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
