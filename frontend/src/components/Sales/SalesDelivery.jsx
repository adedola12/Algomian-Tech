
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FiTruck, FiMapPin, FiUser, FiPhone, FiPlus } from 'react-icons/fi';

const TAX_RATE = 0.075;

const SalesDelivery = ({ items = [], onBack, onNext }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [focused, setFocused] = useState(false);
  const [pointOfSale, setPointOfSale] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [parkLocation, setParkLocation] = useState('');

  useEffect(() => {
    axios.get('/api/users/customers', { withCredentials: true })
      .then(res => setAllCustomers(res.data))
      .catch(err => console.error("Error fetching customers", err));
  }, []);

  useEffect(() => {
    if (!customerName.trim()) {
      setSuggestions([]);
      return;
    }
    const match = allCustomers.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerName.toLowerCase())
    );
    setSuggestions(match);
  }, [customerName, allCustomers]);

  const handleSelectCustomer = (cust) => {
    setCustomerName(`${cust.firstName} ${cust.lastName}`);
    setCustomerPhone(cust.whatAppNumber);
    setSelectedCustomerId(cust._id);
    setSuggestions([]);
  };

  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.price * it.qty, 0), [items]);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const methods = [
    { key: 'logistics', label: 'Logistics', icon: <FiTruck /> },
    { key: 'park', label: 'Park Pick-Up', icon: <FiMapPin /> },
    { key: 'self', label: 'Self Pick-Up', icon: <FiMapPin /> },
  ];

  return (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-6 space-y-6">
         {/* Header & Tabs */}
         <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Sales Management</h2>
        <button className="flex items-center text-orange-600 hover:text-orange-700">
          <FiPlus className="mr-1" /> Add another order
        </button>
      </div>

        {/* Order Summary */}
        <div className="space-y-2">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <img
                src={it.image}
                alt={it.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-medium text-gray-800">{it.name}</h4>
                <p className="text-gray-500 text-sm">{it.specs}</p>
                {it.features && (
                  <p className="text-gray-500 text-xs mt-1">
                    {it.features.join(', ')}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Qty: {it.qty}</p>
              <p className="text-gray-600">
                Price: NGN {it.price.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Sales Management</h2>
        <button className="flex items-center text-orange-600 hover:text-orange-700">
          <FiPlus className="mr-1" /> Add another order
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer's Name</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FiUser />
            </span>
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setSelectedCustomerId(null);
                setCustomerPhone('');
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              placeholder="Search or enter name"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            {focused && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 border bg-white border-gray-300 rounded-lg shadow max-h-40 overflow-auto">
                {suggestions.map((c) => (
                  <li
                    key={c._id}
                    onClick={() => handleSelectCustomer(c)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {c.firstName} {c.lastName} — {c.whatAppNumber}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer's Phone</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FiPhone />
            </span>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter phone"
              readOnly={!!selectedCustomerId}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Point of Sale</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FiMapPin />
            </span>
            <input
              type="text"
              value={pointOfSale}
              onChange={(e) => setPointOfSale(e.target.value)}
              placeholder="Enter POS location"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

     {/* Delivery Method */}
     <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Delivery Method</h3>
        <div className="space-y-2">
          {methods.map((m) => (
            <div
              key={m.key}
              onClick={() => setDeliveryMethod(m.key)}
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer
                ${deliveryMethod === m.key
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
            >
              <div className="flex items-center space-x-2 text-gray-700">
                <span className="text-xl">{m.icon}</span>
                <span>{m.label}</span>
              </div>
              <input
                type="radio"
                name="delivery"
                checked={deliveryMethod === m.key}
                onChange={() => setDeliveryMethod(m.key)}
                className="form-radio text-purple-500"
              />
            </div>
          ))}

          {/* conditional fields */}
          {deliveryMethod === 'logistics' && (
            <div className="mt-2 ml-8">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping Address
              </label>
              <textarea
                rows={2}
                placeholder="Enter full delivery address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}
          {deliveryMethod === 'park' && (
            <div className="mt-2 ml-8">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Park Location
              </label>
              <input
                type="text"
                placeholder="Enter nearest bus park"
                value={parkLocation}
                onChange={(e) => setParkLocation(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="max-w-md ml-auto space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>NGN {subtotal.toFixed(2).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax (7.5%)</span>
          <span>NGN {tax.toFixed(2).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between font-semibold text-gray-800">
          <span>Total</span>
          <span>NGN {total.toFixed(2).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg"
        >
          Go back
        </button>
        <button
          onClick={() => onNext({
            customerName,
            customerPhone,
            pointOfSale,
            deliveryMethod,
            shippingAddress,
            parkLocation,
            summary: { subtotal, tax, total },
            selectedCustomerId
          })}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
        >
          Pay
        </button>
      </div>

      {/* <div className="flex justify-end">
        <button
          onClick={() => onNext({
            customerName,
            customerPhone,
            pointOfSale,
            deliveryMethod,
            shippingAddress,
            parkLocation,
            summary: { subtotal, tax, total },
            selectedCustomerId
          })}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
        >
          Pay
        </button>
      </div> */}
    </div>
  );
};

export default SalesDelivery;
