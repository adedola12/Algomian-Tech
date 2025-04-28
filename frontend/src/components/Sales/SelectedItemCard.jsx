// src/components/SelectedItemCard.jsx
import React, { useState, useEffect } from "react";
import { FiChevronRight, FiChevronDown, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";

export default function SelectedItemCard({
  expanded,
  onToggle,
  product,
  onQtyChange,
  onSpecChange,
  onRemove,
}) {
  const [ram, setRam]       = useState(product.baseRam   || "");
  const [storage, setStorage] = useState(product.baseStorage || "");
  const [cpu, setCpu]       = useState(product.baseCPU   || "");
  const maxQty              = product.maxQty || 1;

  // whenever we edit one of these, bubble it up
  useEffect(() => { onSpecChange(product.id, "baseRam", ram) },     [ram]);
  useEffect(() => { onSpecChange(product.id, "baseStorage", storage) }, [storage]);
  useEffect(() => { onSpecChange(product.id, "baseCPU", cpu) },     [cpu]);

  const handleQty = val => {
    const newQty = Number(val);
    if (newQty < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    if (newQty > maxQty) {
      toast.error(`Only ${maxQty} in stock`);
      return;
    }
    onQtyChange(product.id, newQty);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* header */}
      <div
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
      >
        {expanded ? <FiChevronDown/> : <FiChevronRight/>}
        <div className="flex items-center space-x-4 flex-1 px-2">
          <img
            src={product.image}
            alt={product.name}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div>
            <h3 className="text-gray-800 font-medium">{product.name}</h3>
            <p className="text-gray-500 text-sm">{ram}, {storage}, {cpu}</p>
          </div>
        </div>
        <FiTrash2
          onClick={e => {
            e.stopPropagation();
            onRemove(product.id)
          }}
          className="text-gray-400 hover:text-gray-600 mr-4"
        />
      </div>

      {expanded && (
        <div className="border-t border-gray-200 px-4 py-6 space-y-6">
          {/* specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              ["RAM", ram,     v => setRam(v)],
              ["Storage", storage, v => setStorage(v)],
              ["CPU", cpu,     v => setCpu(v)],
            ].map(([label, value, setter]) => (
              <div key={label}>
                <label className="block text-sm text-gray-600 mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={e => setter(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            ))}
          </div>

          {/* qty & price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                max={maxQty}
                value={product.qty}
                onChange={e => handleQty(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Price
              </label>
              <input
                type="text"
                readOnly
                value={`NGN ${product.price.toLocaleString()}`}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
