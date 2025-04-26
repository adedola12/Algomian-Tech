import React, { useState } from 'react';
import {
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import api from '../api';
import { toast } from 'react-toastify';

export default function OrderItemDet({ order, onStatusChange }) {
  const [open, setOpen]            = useState(true);
  const [processing, setProcessing] = useState(false);

  // determine next status in workflow
  const getNextStatus = (status) => {
    switch (status) {
      case 'Pending':    return 'Processing';
      case 'Processing': return 'Shipped';
      case 'Shipped':    return 'Delivered';
      default:           return null;
    }
  };
  const nextStatus = getNextStatus(order.status);

  const handleMarkProcessed = async () => {
    if (!nextStatus) return;
    setProcessing(true);
    try {
      await api.put(`/api/orders/${order._id}/status`, {
        status: nextStatus,
      });
      toast.success(`Order marked as ${nextStatus}`);
      onStatusChange(); // refresh parent list
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setProcessing(false);
    }
  };

  const discount = 0;                         // or pull from order.discount if you add it
  const shipping = order.shippingPrice;
  const tax      = order.taxPrice;

  const subtotal = order.orderItems
  .reduce((sum, i) => sum + i.qty * i.price, 0);

const total = subtotal + shipping + tax - discount;
// ————————————————————

  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* header */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          Order Item – {order.orderItems.length}
        </h2>
        <button className="flex items-center text-orange-500 hover:text-orange-600">
          <FiEdit2 className="mr-1" /> Edit
        </button>
      </div>

      {/* items list */}
      <div className="divide-y divide-gray-200">
        {order.orderItems.map((i, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row items-start sm:items-center px-6 py-4"
          >
            <img
              src={i.image}
              alt={i.name}
              className="w-16 h-16 rounded object-cover flex-shrink-0"
            />
            <div className="mt-3 sm:mt-0 sm:ml-4 flex-1">
              <p className="font-medium text-gray-900">{i.name}</p>
              <p className="text-sm text-gray-500 mt-1">SN: {i.product}</p>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center space-x-4">
              <div className="px-3 py-1 border border-gray-300 rounded text-sm">
                {i.qty} × ₦{i.price.toLocaleString()}
              </div>
              <div className="text-gray-900 font-medium">
                ₦{(i.qty * i.price).toLocaleString()}
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
              <span className="text-gray-900">₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Discount</span>
              <span className="text-gray-900">₦{discount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">₦{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">₦{shipping.toLocaleString()}</span>
            </div>

            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>₦{total.toLocaleString()}</span>
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Mode</span>
                <span className="text-gray-900">{order.shippingAddress.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Mode</span>
                <span className="text-gray-900">{order.paymentMethod}</span>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={handleMarkProcessed}
                disabled={processing || !nextStatus}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded disabled:opacity-50"
              >
                {processing
                  ? "…"
                  : `Mark as ${nextStatus}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
