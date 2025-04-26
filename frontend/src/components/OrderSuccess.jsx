// src/pages/OrderSuccess.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { ShopContext }   from "../context/ShopContext";
import { fetchOrderById } from "../api";

export default function OrderSuccess() {
  const navigate = useNavigate();
  const { clearCart } = useContext(ShopContext);
  const orderId      = localStorage.getItem("latestOrderId");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return navigate("/");
    fetchOrderById(orderId).then(setOrder);
  }, [orderId, navigate]);

  if (!order) return <p>Loading…</p>;

  const handleContinue = () => {
    clearCart();
    navigate("/");
  };

  return (
    <div className="w-full text-center px-4 pt-16 pb-10">
      <FaCheckCircle className="text-purple-700 text-8xl mb-6 mx-auto" />
      <h2 className="text-3xl font-semibold text-gray-800 mb-2">Order Successful!</h2>
      <p className="text-base text-gray-600 mb-6">
        Your order #{order._id} has been placed successfully.
      </p>

      <div className="max-w-xl mx-auto border-t border-b py-6 mb-4 text-left space-y-2">
        <p><strong>Shipping:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}</p>
        <p><strong>Payment:</strong> {order.paymentMethod}</p>
        <p><strong>Contact:</strong> {order.user.email}</p>
        <p><strong>Total:</strong> ₦{order.totalPrice.toLocaleString()}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate("/signup")}
          className="bg-purple-700 text-white py-2 px-6 rounded"
        >
          Register to Track Your Order
        </button>
        <button
          onClick={handleContinue}
          className="border py-2 px-6 rounded hover:bg-gray-100"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
