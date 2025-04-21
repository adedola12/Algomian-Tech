import React, { useEffect, useState } from 'react';
import {
  FaBoxOpen,
  FaClock,
  FaTruck,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from 'react-icons/fa';

const OrderTrackDet = ({ orderId = '00000', trackingId = 'IZ99AA1234567890' }) => {
  const [delivery, setDelivery] = useState({});
  const [items, setItems] = useState([]);

  useEffect(() => {
    const deliveryData = JSON.parse(localStorage.getItem('deliveryInfo'))?.[0] || {};
    const orderedItems = JSON.parse(localStorage.getItem('orderedItems')) || [];
    setDelivery(deliveryData);
    setItems(orderedItems);
  }, []);

  return (
    <div className="bg-white max-w-6xl mx-auto p-4 sm:p-6 md:p-10 rounded-md shadow-sm text-sm">
      {/* Header */}
      <div className="flex flex-row sm:flex-row sm:items-center justify-between border-b pb-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Order Tracking</h2>
        <div className="text-sm mt-2 sm:mt-0 text-gray-700 space-x-2 flex flex-wrap items-center">
          <span className="font-medium">Order #{orderId}</span>
          <span className="text-orange-600 bg-orange-100 px-2 py-[2px] rounded-full text-xs font-medium">
            Status: In Transit
          </span>
          <span className="text-gray-500 ml-2">Estimated Arrival Time: 2nd March, 2025</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 text-center">
        {[
          { icon: FaBoxOpen, label: 'Order Successful', active: true },
          { icon: FaClock, label: 'Shipped', active: true },
          { icon: FaTruck, label: 'In Transit', active: false },
          { icon: FaCheckCircle, label: 'Delivered', active: false },
        ].map(({ icon: Icon, label, active }, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <Icon className={`text-2xl mb-1 ${active ? 'text-purple-600' : 'text-gray-400'}`} />
            <span className={`text-xs ${active ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Items Ordered */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Item Ordered</h3>
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-start gap-4 mb-4"
            >
              <img
                src={item.image?.[0] || 'https://via.placeholder.com/100'}
                alt={item.name}
                className="w-20 h-20 rounded object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-gray-500 text-xs">{item.description || '—'}</p>
                <p className="text-xs text-gray-700 mt-1">QTY: {item.quantity}</p>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                ₦{Number(item.price || 0).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No items found for this order.</p>
        )}
      </div>

      {/* Delivery & Shipping Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
        {/* Delivery Address */}
        <div>
          <h4 className="font-semibold mb-3">Delivery Address</h4>
          <p className="flex items-center gap-2 mb-2">
            <FaMapMarkerAlt className="text-purple-600" />
            {delivery.address || 'Not Provided'}
          </p>
          <p className="flex items-center gap-2 mb-2">
            <FaPhoneAlt className="text-purple-600" />
            {delivery.phone || 'Not Provided'}
          </p>
          <p className="flex items-center gap-2">
            <FaEnvelope className="text-purple-600" />
            {delivery.email || 'Not Provided'}
          </p>
        </div>

        {/* Shipping Details */}
        <div>
          <h4 className="font-semibold mb-3">Shipping Details</h4>
          <p className="flex items-center gap-2 mb-2">
            <FaMapMarkerAlt className="text-purple-600" />
            Carrier: GIG
          </p>
          <p className="flex items-center gap-2">
            <FaTruck className="text-purple-600" />
            Tracking Number: {trackingId}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackDet;
