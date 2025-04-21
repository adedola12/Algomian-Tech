import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { ShopContext } from "../context/ShopContext";

const OrderInfo = () => {
  const navigate = useNavigate();
  const { clearCart } = useContext(ShopContext);
  const [orderDetails, setOrderDetails] = useState({
    shippingMethod: "",
    paymentMethod: "",
    contact: "",
  });

  const orderId = localStorage.getItem("latestOrderId");

  useEffect(() => {
    const shipping = localStorage.getItem("selectedDeliveryMethod");
    const payment = localStorage.getItem("selectedPaymentMethod");
    const contactInfo =
      JSON.parse(localStorage.getItem("deliveryInfo"))?.[0]?.phone || "";

    setOrderDetails({
      shippingMethod: shipping || "—",
      paymentMethod: payment || "—",
      contact: contactInfo || "—",
    });
  }, []);

  const handleContinue = () => {
    clearCart();
    navigate("/");
  };

  return (
    <div className="w-full text-center px-4 pt-16 pb-10">
      <FaCheckCircle className="text-purple-700 text-[70px] md:text-[90px] mb-6 mx-auto" />
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
        Order Successful!
      </h2>
      <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto mb-6">
        Your order has been placed successfully. A confirmation message has been
        sent to you via SMS/WhatsApp.
      </p>

      {/* Order Summary */}
      <div className="w-full max-w-xl mx-auto border-t border-b border-gray-200 py-6 mb-4 text-left">
        <h3 className="font-semibold text-sm text-gray-900 mb-4 px-4">
          Order Information:
        </h3>
        <ul className="text-sm space-y-2 px-6">
          <li>
            <strong>Shipping method:</strong> {orderDetails.shippingMethod}
          </li>
          <li>
            <strong>Payment method:</strong> {orderDetails.paymentMethod}
          </li>
          <li>
            <strong>Customer Contact details:</strong> {orderDetails.contact}
          </li>
          <li>
            <strong>Estimated delivery time:</strong> 24 Hours
          </li>
        </ul>
      </div>

      {/* Info Text */}
      <p className="text-xs text-gray-500 mb-4">
        You can track your order by creating an account
      </p>

      <p className="text-sm text-gray-700">
        <strong>Order ID:</strong> {localStorage.getItem("latestOrderId")}
      </p>
      <p className="text-sm text-gray-700">
        <strong>Tracking ID:</strong> {localStorage.getItem("trackingId")}
      </p>

      {/* Aligned Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-xl mx-auto px-4">
        <button
          onClick={() => navigate("/signup")}
          className="bg-[#5A4FCF] text-white text-sm font-medium py-2 px-6 rounded w-full sm:w-auto hover:bg-[#483dc2] transition"
        >
          Register to Track Your Order
        </button>
        <button
          onClick={handleContinue}
          className="border border-gray-300 text-sm text-gray-700 py-2 px-6 rounded w-full sm:w-auto hover:bg-gray-100 transition"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderInfo;
