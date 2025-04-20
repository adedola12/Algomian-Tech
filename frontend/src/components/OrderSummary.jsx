import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";

const OrderSummary = () => {
  const { cartItems, currency } = useContext(ShopContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Core Calculations
  const cartSubtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const deliveryFee = cartSubtotal > 0 ? 1000 : 0;
  const discount = cartSubtotal >= 5000000 ? cartSubtotal * 0.1 : 0;
  const estimatedTotal = cartSubtotal + deliveryFee - discount;

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowModal(true);
    }, 2000);
  };

  return (
    <>
      <div className="w-full max-w-sm mx-auto bg-white rounded-lg shadow-md p-5 border text-sm">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-base font-semibold text-gray-800">Order Summary</h2>
          <button className="text-gray-500 text-xl leading-none hover:text-red-600">&times;</button>
        </div>

        {/* Breakdown */}
        <div className="flex justify-between py-2 text-gray-600">
          <span>Cart Subtotal</span>
          <span>{currency} {cartSubtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between py-2 text-gray-600">
          <span>Delivery Fee</span>
          <span>{currency} {deliveryFee.toLocaleString()}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between py-2 text-green-600 font-medium">
            <span>Discount (10%)</span>
            <span>- {currency} {discount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between py-2 font-semibold text-gray-900">
          <span>Estimated Total</span>
          <span>{currency} {estimatedTotal.toLocaleString()}</span>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          className="w-full mt-4 bg-[#5A4FCF] text-white font-medium py-2 rounded hover:bg-[#483dc2] transition duration-200 flex justify-center items-center gap-2"
          disabled={isProcessing}
        >
          {isProcessing && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          )}
          {isProcessing ? "Processing..." : "Checkout"}
        </button>
      </div>

      {/* Checkout Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[130] bg-black bg-opacity-40 flex justify-center items-center px-4">
          <div className="bg-white rounded-md shadow-lg w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-3 text-center">Checkout Complete!</h3>
            <p className="text-sm text-gray-700 text-center mb-5">
              Your order has been successfully processed. Thank you!
            </p>
            <button
              className="w-full bg-[#5A4FCF] text-white py-2 rounded hover:bg-[#483dc2]"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderSummary;
