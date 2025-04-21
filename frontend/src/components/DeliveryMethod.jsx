import React from "react";
import { FaTruck, FaWarehouse, FaWalking } from "react-icons/fa";

const deliveryOptions = [
  {
    label: "Logistics",
    value: "logistics",
    icon: <FaTruck className="text-purple-500" />,
  },
  {
    label: "Park Pick up",
    value: "park",
    icon: <FaWarehouse className="text-purple-500" />,
  },
  {
    label: "Self Pickup",
    value: "self",
    icon: <FaWalking className="text-purple-500" />,
  },
];

const DeliveryMethod = ({ selected, onChange }) => {
  return (
    <div className="w-full max-w-xl">
      <h3 className="font-semibold text-gray-800 mb-4">Delivery Method</h3>
      <div className="space-y-3">
        {deliveryOptions.map((option) => (
          <label
            key={option.value}
            className={`flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer transition ${
              selected === option.label
                ? "bg-purple-100 border-purple-500"
                : "bg-gray-50 border-gray-200 hover:border-purple-400"
            }`}
          >
            <div className="flex items-center gap-3">
              {option.icon}
              <span className="text-sm font-medium text-gray-700">
                {option.label}
              </span>
            </div>
            <input
              type="radio"
              name="deliveryMethod"
              value={option.value}
              checked={selected === option.label}
              onChange={() => onChange(option.label)} // Pass label like "Park Pick up"
              className="form-radio accent-purple-600"
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default DeliveryMethod;
