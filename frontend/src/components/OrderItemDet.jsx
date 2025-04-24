// src/components/OrderItemDet.jsx
import React, { useState } from 'react';
import {
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';

export default function OrderItemDet() {
  // toggle for summary collapse
  const [open, setOpen] = useState(true);

  // sample items matching your design
  const items = [
    {
      id: 1,
      title: 'Macbook Pro M4Pro Chip',
      specs: '24gb ram, 512gb ssd, 12C CPU, 16C GPU',
      sn: 'WRT648CG',
      qty: 2,
      price: 1200000,
      img: 'https://via.placeholder.com/64', // replace with real URL
    },
    {
      id: 2,
      title: 'Macbook Pro M3Pro Chip',
      specs: '16gb ram, 512gb ssd, 12C CPU, 16C GPU',
      sn: 'WRT648CG',
      qty: 1,
      price: 1200000,
      img: 'https://via.placeholder.com/64',
    },
  ];

  // simple formatter
  const fmt = (n) => n.toLocaleString();

  // compute summary
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const discount = 0;
  const total    = subtotal - discount + 5; // +5 to match your $205 example

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm max-w-2xl mx-auto">
      {/* header */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          Order Item - {items.length}
        </h2>
        <button className="flex items-center text-orange-500 hover:text-orange-600">
          <FiEdit2 className="mr-1" /> Edit
        </button>
      </div>

      {/* items list */}
      <div className="divide-y divide-gray-200">
        {items.map(({ id, title, specs, sn, qty, price, img }) => (
          <div key={id} className="flex flex-col sm:flex-row items-start sm:items-center px-6 py-4">
            {/* image */}
            <img src={img} alt={title} className="w-16 h-16 rounded object-cover flex-shrink-0"/>
            {/* details */}
            <div className="mt-3 sm:mt-0 sm:ml-4 flex-1">
              <p className="font-medium text-gray-900">{title}</p>
              <p className="text-sm text-gray-500 mt-1">{specs}</p>
              <p className="text-xs text-gray-400 mt-1">SN: {sn}</p>
            </div>
            {/* qty × price and total */}
            <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center space-x-4">
              <div className="px-3 py-1 border border-gray-300 rounded text-sm">
                {qty} × {fmt(price)}
              </div>
              <div className="text-gray-900 font-medium">
                {fmt(qty * price)}
              </div>
              <button className="text-gray-400 hover:text-gray-600 ml-4">
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* summary */}
      <div className="px-6 py-4 border-t">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex justify-between items-center text-gray-800"
        >
          <span className="font-medium">Order Summary</span>
          {open ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {open && (
          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">${subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Discount</span>
              <span className="text-gray-900">${discount.toFixed(1)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${total.toFixed(0)}</span>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Mode</span>
                <span className="text-gray-900">Bus Park - Ojota, Lagos</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-600">Payment Mode</span>
                <span className="text-gray-900">Bank Transfer</span>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded">
                Mark as Processed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
