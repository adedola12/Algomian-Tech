// src/components/SalesTable.jsx
import React, { useState } from "react";
import {
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import SalesInfoInput from "./SalesInfoInput";
import SalesDelivery from "./SalesDelivery";
import SalesPaymentInfo from "./SalesPaymentInfo";

const SalesTable = () => {
  const [step, setStep] = useState(0);

  // lift items/product list to parent
  const defaultProduct = {
    id: Date.now(),
    image: "https://via.placeholder.com/80",
    name: "Macbook Pro M4Pro Chip",
    specs: "24gb ram, 512gb ssd, 12C CPU, 16C GPU",
    expanded: false,
  };
  const [items, setItems] = useState([defaultProduct]);

  const rows = Array.from({ length: 7 }, (_, i) => ({
    time: "Sep 20th, 2024 1:14pm",
    orderNo: "INV-0004",
    customer: "Dolapo",
    price: "NGN 5,600",
    status: "Confirmed",
  }));

  // Step 1: Show the Sales Info form
  if (step === 1) {
    return (
      <SalesInfoInput
        items={items}
        setItems={setItems}
        onBack={() => setStep(0)}
        onNext={() => setStep(2)}
      />
    );
  }

   // Step 2: Delivery
   if (step === 2) {
    return (
      <SalesDelivery
        items={items}
        onBack={() => setStep(1)}
        onNext={() => setStep(3)}     // <-- go to payment
      />
    )
  }

  // Step 3: Payment
  if (step === 3) {
    return (
      <SalesPaymentInfo
        items={items}
        onBack={() => setStep(2)}
        onDone={() => setStep(0)}     // or whatever final logic you need
      />
    )
  }
  return (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-semibold text-gray-800">
          Sales Management
        </h2>
        <button
          onClick={() => setStep(1)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-5 py-2 rounded-lg"
        >
          + Enter Sales
        </button>
      </div>

      {/* search & filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-4 space-y-4 md:space-y-0">
        {/* search */}
        <div className="relative w-full md:w-1/3">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="search by Invoice No"
            className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* filters */}
        <div className="flex flex-wrap items-center space-x-2">
          <FiFilter className="text-gray-500" />
          <span className="text-gray-600 font-medium">Filter by</span>

          {["Date", "Invoice No", "Status"].map((opt) => (
            <select
              key={opt}
              className="w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option>{opt}</option>
            </select>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="min-w-full whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {[
                "Time",
                "Order No",
                "Customer",
                "Price",
                "Status",
                "Action",
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 sm:px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b last:border-none">
                <td className="px-4 sm:px-6 py-4 text-sm text-gray-700">
                  {row.time}
                </td>
                <td className="px-4 sm:px-6 py-4 text-sm text-gray-700">
                  {row.orderNo}
                </td>
                <td className="px-4 sm:px-6 py-4 text-sm text-gray-700">
                  {row.customer}
                </td>
                <td className="px-4 sm:px-6 py-4 text-sm text-gray-700">
                  {row.price}
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                    {row.status}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 text-gray-500">
                  <FiMoreVertical />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-3 sm:space-y-0">
        <button className="flex items-center text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-200 rounded-lg">
          <FiChevronLeft className="mr-2" /> Previous
        </button>
        <span className="text-sm text-gray-500">Page 1 of 10</span>
        <button className="flex items-center text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-200 rounded-lg">
          Next <FiChevronRight className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default SalesTable;
