// src/components/OrderDetTop.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export default function OrderDetTop({ order }) {
  return (
    <div className="bg-white px-4 py-6 sm:px-6 sm:py-8 space-y-2">
      <Link to="/orders" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
        <FiArrowLeft className="mr-2" /> Back to orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <h1 className="text-2xl font-semibold text-gray-900">Order ID: {order._id}</h1>
        <span className="mt-2 sm:mt-0 inline-block px-3 py-0.5 
                         bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
          {order.status}
        </span>
      </div>

      <p className="text-sm text-gray-600">
        Sold by: <span className="font-medium text-gray-900">{order.user.firstName} {order.user.lastName}</span>
      </p>
      <p className="text-sm text-gray-600">
        Date ordered:&nbsp;
        <span className="font-medium text-gray-900">
          {new Date(order.createdAt).toLocaleString()}
        </span>
      </p>
    </div>
  );
}
