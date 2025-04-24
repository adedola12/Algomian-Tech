// src/components/OrderDetTop.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function OrderDetTop() {
  return (
    <div className="bg-white px-4 py-6 sm:px-6 sm:py-8 space-y-2">
      {/* ← Back link */}
      <Link
        to="/customers"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
      >
        <FiArrowLeft className="mr-2" /> Back to customers
      </Link>

      {/* Order ID + Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Order ID: 10001
        </h1>
        <span className="mt-2 sm:mt-0 inline-block px-3 py-0.5 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
          Order Pending
        </span>
      </div>

      {/* Seller and Date */}
      <p className="text-sm text-gray-600">
        Sold by:&nbsp;
        <span className="font-medium text-gray-900">Olumide</span>
      </p>
      <p className="text-sm text-gray-600">
        Date ordered:&nbsp;
        <span className="font-medium text-gray-900">
          21 Aug, 2023 at 2:45 pm
        </span>
      </p>
    </div>
  );
}
