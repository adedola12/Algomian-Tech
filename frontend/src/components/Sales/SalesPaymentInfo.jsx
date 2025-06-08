// src/components/SalesPaymentInfo.jsx
import React, { useState, useMemo } from "react";
import {
  FiChevronRight,
  FiTrash2,
  FiPlus,
  FiUser,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { createOrder } from "../../api";
import SalesComplete from "./SalesComplete";
import SalesPrintPreview from "./SalesPrintPreview";

export default function SalesPaymentInfo({
  items: initialItems = [],
  customerName,
  customerPhone,
  pointOfSale,
  deliveryMethod,
  shippingAddress,
  parkLocation,
  selectedCustomerId, // ✅ add this line
  summary = { subtotal: 0, tax: 0, total: 0 },
  onBack,
  onDone,
}) {
  const [items, setItems] = useState(initialItems);

  const [method, setMethod] = useState("cash");
  const [bankAccount, setBankAccount] = useState("Moniepoint - Alogoman 2");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [accountName, setAccountName] = useState("");
  const [amountTransferred, setAmountTransferred] = useState(summary.total);

  const [loading, setLoading] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  const change = useMemo(
    () => parseFloat(amountTransferred || 0) - summary.total,
    [amountTransferred, summary.total]
  );

  const removeLine = (id) =>
    setItems((prev) => prev.filter((x) => x.id !== id));

  // const handleDone = async () => {
  //   setLoading(true)
  //   try {
  //     // Build a shippingAddress object that satisfies your schema:
  //     const fullShipping = {
  //       address:
  //         deliveryMethod === 'park'
  //           ? parkLocation
  //           : deliveryMethod === 'self'
  //           ? pointOfSale
  //           : shippingAddress,
  //       city: 'N/A',        // placeholder so required validator passes
  //       postalCode: 'N/A',  // placeholder so required validator passes
  //       country: 'N/A',     // placeholder so required validator passes
  //     }

  //     const payload = {
  //       orderItems: items.map((it) => ({
  //         product: it.id,
  //         qty: it.qty,
  //         price: it.price,
  //       })),
  //       shippingAddress: fullShipping,
  //       paymentMethod: method,
  //       shippingPrice: 0,
  //       taxPrice: summary.tax,
  //       itemsPrice: summary.subtotal,
  //       paymentDetails: {
  //         bankAccount,
  //         date,
  //         accountName,
  //         amountTransferred: parseFloat(amountTransferred),
  //       },
  //     }

  //     await createOrder(payload)
  //     setShowComplete(true)
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || err.message)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // only the handleDone() function needs to be updated:
  const handleDone = async () => {
    setLoading(true);
    try {
      const fullShipping = {
        address:
          deliveryMethod === "park"
            ? parkLocation
            : deliveryMethod === "self"
            ? pointOfSale
            : shippingAddress,
        city: "N/A",
        postalCode: "N/A",
        country: "N/A",
      };

      const payload = {
        orderItems: items.map((it) => ({
          product: it.id,
          qty: it.qty,
          price: it.price,
          baseRam: it.baseRam,
          baseStorage: it.baseStorage,
          baseCPU: it.baseCPU,
          image: it.image,
          maxQty: it.maxQty,
          name: it.name,
        })),

        shippingAddress: fullShipping,
        paymentMethod: method,
        shippingPrice: 0,
        taxPrice: summary.tax,
        itemsPrice: summary.subtotal,

        selectedCustomerId, // pass this from props
        customerName,
        customerPhone,
        paymentDetails: {
          bankAccount,
          date,
          accountName,
          amountTransferred: parseFloat(amountTransferred),
        },
      };

      const res = await createOrder(payload); // res === pure JSON

      (res.lowStockWarnings ?? []).forEach((msg) => toast.warn(msg));

      toast.success("Order placed successfully!");

      setShowComplete(true);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseComplete = () => {
    setShowComplete(false);
    onDone();
  };
  const handlePrint = () => {
    setShowComplete(false);
    setShowPrint(true);
  };
  const handleClosePrint = () => {
    setShowPrint(false);
    onDone();
  };

  const handleNewSale = () => {
    setShowComplete(false);
    onDone(); // parent (SalesTable) already resets state & step
  };

  const details = [
    { label: "Recipient name", icon: <FiUser />, value: customerName },
    { label: "Phone number", icon: <FiPhone />, value: customerPhone },
    { label: "Point of Sales", icon: <FiMapPin />, value: pointOfSale },
    {
      label: "Delivery Method",
      icon: <FiMapPin />,
      value:
        deliveryMethod === "logistics"
          ? `Logistics — ${shippingAddress}`
          : deliveryMethod === "park"
          ? `Park Pick-Up — ${parkLocation}`
          : "Self Pick-Up",
    },
  ];

  return (
    <div className="relative">
      <div
        className={`bg-white rounded-2xl shadow p-4 sm:p-6 space-y-6
          transition-filter duration-200 ${
            showComplete || showPrint ? "filter blur-sm" : ""
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Sales Management
          </h2>
          <button className="flex items-center text-orange-600 hover:text-orange-700">
            <FiPlus className="mr-1" /> Add another order
          </button>
        </div>

        {/* Order Summary */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {items.map((it, i) => (
            <div
              key={it.id ?? i}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center space-x-4">
                <FiChevronRight className="text-gray-400" />
                <img
                  src={it.image}
                  alt={it.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-gray-800 font-medium">{it.name}</h3>
                  <p className="text-gray-500 text-sm">
                    {it.baseRam}, {it.baseStorage}, {it.baseCPU}
                  </p>

                  <p className="text-gray-600 text-sm">QTY: {it.qty}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-800 font-semibold">
                  ₦{(it.qty * it.price).toLocaleString()}
                </span>
                <FiTrash2
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  onClick={() => removeLine(it.id)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Details Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {details.map((d, i) => (
            <div key={i} className="text-sm">
              <span className="font-medium text-gray-700">{d.label}</span>
              <p className="text-gray-800 flex items-center">
                <span className="mr-2">{d.icon}</span>
                {d.value}
              </p>
            </div>
          ))}
        </div>

        {/* Payment Box */}
        <div className="border-2 border-purple-500 rounded-lg overflow-hidden">
          <div className="bg-purple-50 px-4 py-2">
            <span className="text-purple-700 font-semibold">
              Payment method
            </span>
          </div>
          <div className="border-t border-purple-500 px-4 py-4 grid grid-cols-1 sm:grid-cols-2">
            <span className="text-gray-700 font-medium">Amount To Pay</span>
            <div className="flex justify-end">
              <span className="bg-gray-100 px-3 py-1 rounded-lg font-semibold">
                ₦{summary.total.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="px-4 pt-4 pb-6 space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Select method of payment
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {["cash", "bank", "card"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`w-full py-2 rounded-lg border ${
                    method === m
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  {m === "cash"
                    ? "Cash"
                    : m === "bank"
                    ? "Bank Transfer"
                    : "Card"}
                </button>
              ))}
            </div>
            {method === "bank" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* bank details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Account
                  </label>
                  <select
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  >
                    <option>Moniepoint - Alogoman 2</option>
                    <option>Another Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name on account
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount transferred
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      ₦
                    </span>
                    <input
                      type="number"
                      value={amountTransferred}
                      onChange={(e) => setAmountTransferred(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onBack}
            disabled={loading}
            className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg"
          >
            Go back
          </button>
          <button
            onClick={handleDone}
            disabled={loading}
            className={`px-6 py-2 text-white rounded-lg ${
              loading ? "bg-gray-400" : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {loading ? "Processing…" : "Done"}
          </button>
        </div>
      </div>

      {/* Completion Modal */}
      {showComplete && (
        <SalesComplete
          change={change}
          onClose={handleCloseComplete}
          onPrint={handlePrint}
          onNewSale={handleNewSale}
        />
      )}

      {/* Print Preview Modal */}
      {showPrint && (
        <SalesPrintPreview
          onClose={handleClosePrint}
          onPrintPDF={handleClosePrint}
          company={{
            name: "Algorional Technologies",
            email: "algorionaltechnologies@gmail.com",
          }}
          billedTo={customerName}
          date={new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          items={items.map((it, i) => ({
            sn: i + 1,
            name: it.name,
            qty: it.qty,
            price: it.price,
          }))}
          tax={summary.tax}
        />
      )}
    </div>
  );
}
