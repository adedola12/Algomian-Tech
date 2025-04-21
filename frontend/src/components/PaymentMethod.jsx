import React from "react";
import { FaUniversity } from "react-icons/fa";
import { SiFlutter } from "react-icons/si";

const paymentOptions = [
  {
    label: "Pay with Bank Transfer",
    value: "bank",
    icon: <FaUniversity className="text-purple-600 text-lg" />,
  },
  {
    label: "Pay with Flutterwave",
    value: "flutterwave",
    icon: <SiFlutter className="text-yellow-500 text-lg" />,
  },
];

const PaymentMethod = ({ selected, onChange }) => {
  return (
    <div className="w-full max-w-xl">
      <h3 className="font-semibold text-gray-800 mb-4">Payment Method</h3>
      <div className="space-y-3">
        {paymentOptions.map((option) => (
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
              name="paymentMethod"
              value={option.value}
              checked={selected === option.label}
              onChange={() => onChange(option.label)} // store label like "Pay with Flutterwave"
              className="form-radio accent-purple-600"
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethod;
