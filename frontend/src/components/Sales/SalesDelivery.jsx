//  ── src/components/Sales/SalesDelivery.jsx ──
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FiTruck, FiMapPin, FiUser, FiPhone, FiPlus } from "react-icons/fi";

const TAX_RATE = 0.075;

/**
 * Re-usable delivery form.
 * When it’s shown inside the “Edit Shipping” modal we receive
 *   • items              – the current order lines   (for summary)
 *   • customerName …     – all the fields we should pre-fill
 */
export default function SalesDelivery({
  /* wizard navigation */
  onBack,
  onNext,
  onAddAnotherOrder = () => {},

  hideNav = false,

  /* pre-filled data (every prop is optional) */
  items = [],
  customerName = "",
  customerPhone = "",
  pointOfSale = "",
  deliveryMethod = "",
  shippingAddress = "",
  parkLocation = "",
  selectedCustomerId = null,
}) {
  /* ------------------------------------------------ state ---------- */
  const [name, setName] = useState(customerName);
  const [phone, setPhone] = useState(customerPhone);
  const [pos, setPOS] = useState(pointOfSale);
  const [method, setMethod] = useState(deliveryMethod);
  const [ship, setShip] = useState(shippingAddress);
  const [park, setPark] = useState(parkLocation);
  const [selId, setSelId] = useState(selectedCustomerId);

  /* re-sync if the parent opens the modal with a new order */
  useEffect(() => {
    setName(customerName);
  }, [customerName]);
  useEffect(() => {
    setPhone(customerPhone);
  }, [customerPhone]);
  useEffect(() => {
    setPOS(pointOfSale);
  }, [pointOfSale]);
  useEffect(() => {
    setMethod(deliveryMethod);
  }, [deliveryMethod]);
  useEffect(() => {
    setShip(shippingAddress);
  }, [shippingAddress]);
  useEffect(() => {
    setPark(parkLocation);
  }, [parkLocation]);
  useEffect(() => {
    setSelId(selectedCustomerId);
  }, [selectedCustomerId]);

  /* -------------------------------------- customers autocomplete --- */
  const [allCustomers, setAllCustomers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    axios
      .get("/api/users/customers", { withCredentials: true })
      .then((r) => setAllCustomers(r.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!name.trim()) return setSuggestions([]);
    setSuggestions(
      allCustomers.filter((c) =>
        `${c.firstName} ${c.lastName}`
          .toLowerCase()
          .includes(name.toLowerCase())
      )
    );
  }, [name, allCustomers]);

  const pickCustomer = (c) => {
    setName(`${c.firstName} ${c.lastName}`);
    setPhone(c.whatAppNumber);
    setSelId(c._id);
    setSuggestions([]);
  };

  /* ----------------------------------------- money calc ---------- */
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.qty, 0),
    [items]
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  /* --------------------------------------------- helpers ---------- */
  const methods = [
    { key: "logistics", label: "Logistics", icon: <FiTruck /> },
    { key: "park", label: "Park Pick-Up", icon: <FiMapPin /> },
    { key: "self", label: "Self Pick-Up", icon: <FiMapPin /> },
  ];

  /* ---------------------------------------------- render ---------- */
  return (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-6 space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sales Management</h2>
        {!hideNav && (
          <button
            onClick={onAddAnotherOrder}
            className="flex items-center text-orange-600 hover:text-orange-700"
          >
            <FiPlus className="mr-1" /> Add another order
          </button>
        )}
      </div>

      {/* order lines preview */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={it.image}
                  alt={it.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-medium">{it.name}</h4>
                  <p className="text-sm text-gray-500">Qty: {it.qty}</p>
                </div>
              </div>
              <p className="text-gray-700">
                ₦{(it.qty * it.price).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* customer + POS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* name */}
        <div className="relative">
          <label className="block text-sm mb-1">Customer’s Name</label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full border rounded-lg pl-10 pr-4 py-2"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSelId(null);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              placeholder="Search or enter name"
            />
            {focused && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded-lg shadow max-h-40 overflow-auto">
                {suggestions.map((c) => (
                  <li
                    key={c._id}
                    onClick={() => pickCustomer(c)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {c.firstName} {c.lastName} — {c.whatAppNumber}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* phone */}
        <div className="relative">
          <label className="block text-sm mb-1">Customer’s Phone</label>
          <FiPhone className="absolute left-3 top-9 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border rounded-lg pl-10 pr-4 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            readOnly={!!selId}
            placeholder="Enter phone"
          />
        </div>

        {/* POS */}
        <div className="relative">
          <label className="block text-sm mb-1">Point of Sale</label>
          <FiMapPin className="absolute left-3 top-9 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border rounded-lg pl-10 pr-4 py-2"
            value={pos}
            onChange={(e) => setPOS(e.target.value)}
            placeholder="Enter POS location"
          />
        </div>
      </div>

      {/* delivery mode */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Delivery Method</h3>
        {methods.map((m) => (
          <div
            key={m.key}
            onClick={() => setMethod(m.key)}
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${
              method === m.key
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">{m.icon}</span>
              <span>{m.label}</span>
            </div>
            <input
              type="radio"
              checked={method === m.key}
              onChange={() => setMethod(m.key)}
              className="form-radio text-purple-500"
            />
          </div>
        ))}

        {method === "logistics" && (
          <textarea
            rows={2}
            value={ship}
            onChange={(e) => setShip(e.target.value)}
            placeholder="Shipping address"
            className="w-full border rounded-lg px-3 py-2 mt-2"
          />
        )}
        {method === "park" && (
          <input
            value={park}
            onChange={(e) => setPark(e.target.value)}
            placeholder="Nearest bus park"
            className="w-full border rounded-lg px-3 py-2 mt-2"
          />
        )}
      </div>

      {/* money summary */}
      <div className="max-w-md ml-auto space-y-1">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>₦{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax (7.5%)</span>
          <span>₦{tax.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>₦{total.toLocaleString()}</span>
        </div>
      </div>

      {/* footer  –– render only if navigation buttons are wanted */}
      {!hideNav && (
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <button
            onClick={onBack}
            className="px-6 py-2 border rounded-lg text-gray-700"
          >
            Go back
          </button>

          <button
            onClick={() =>
              onNext({
                customerName: name, // ← use local state instead of props
                customerPhone: phone,
                pointOfSale: pos,
                deliveryMethod: method,
                shippingAddress: ship,
                parkLocation: park,
                selectedCustomerId: selId,
                summary: { subtotal, tax, total },
              })
            }
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
          >
            Pay
          </button>
        </div>
      )}
    </div>
  );
}
