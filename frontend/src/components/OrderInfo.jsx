import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { ShopContext } from '../context/ShopContext';

const OrderInfo = () => {
  const navigate = useNavigate();
  const { clearCart } = useContext(ShopContext); // clearCart function from context
  const [orderDetails, setOrderDetails] = useState({
    shippingMethod: '',
    paymentMethod: '',
    contact: ''
  });

  useEffect(() => {
    const shipping = localStorage.getItem('selectedDeliveryMethod');
    const payment = localStorage.getItem('selectedPaymentMethod');
    const contactInfo = JSON.parse(localStorage.getItem('deliveryInfo'))?.[0]?.phone || '';

    setOrderDetails({
      shippingMethod: shipping || '—',
      paymentMethod: payment || '—',
      contact: contactInfo || '—'
    });
  }, []);

  const handleContinue = () => {
    clearCart(); // ✅ clear cart
    navigate('/');
  };

  return (
    <div className="bg-white w-full">
      <div className="min-h-screen w-full max-w-[1440px] mx-auto px-4 pt-16 pb-6 flex flex-col items-center text-center">
        {/* Success Icon */}
        <FaCheckCircle className="text-[#524D9B] text-[70px] md:text-[90px] mb-6" />

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
          Order Successful!
        </h2>

        {/* Subtitle */}
        <p className="text-sm md:text-base text-gray-600 max-w-xl mb-6 px-2">
          Your order has been placed successfully. A confirmation message has been sent to you
          via SMS/WhatsApp.
        </p>

        {/* Order Details */}
        <div className="w-full max-w-2xl border-t border-b border-gray-200 py-6 mb-4 text-left">
          <h3 className="font-semibold text-sm text-gray-900 mb-4 px-4">Order Information:</h3>
          <ul className="text-sm space-y-2 px-6">
            <li><strong>Shipping method:</strong> {orderDetails.shippingMethod}</li>
            <li><strong>Payment method:</strong> {orderDetails.paymentMethod}</li>
            <li><strong>Customer Contact details:</strong> {orderDetails.contact}</li>
            <li><strong>Estimated delivery time:</strong> 24 Hours</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mb-3 px-6 text-center">
          You can track your order by creating an account
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md px-4">
          <button
            onClick={() => navigate('/signup')}
            className="bg-[#524D9B] text-white text-sm font-medium py-2 px-6 rounded w-full sm:w-auto sm:min-w-[200px] hover:bg-[#483dc2] transition"
          >
            Register to Track Your Order
          </button>
          <button
            onClick={handleContinue}
            className="border text-sm border-gray-300 text-gray-700 py-2 px-6 rounded w-full sm:w-auto sm:min-w-[200px] hover:bg-gray-100 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderInfo;
