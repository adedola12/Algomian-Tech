import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";

const OrderSummary = () => {
  const { cartItems, currency } = useContext(ShopContext);
  const navigate = useNavigate();

  // Calculate order values
  const cartSubtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const deliveryFee = cartSubtotal > 0 ? 1000 : 0;
  const discount = cartSubtotal >= 5000000 ? cartSubtotal * 0.1 : 0;
  const estimatedTotal = cartSubtotal + deliveryFee - discount;

  // Navigate to shipping page
  const handleCheckout = () => {
    navigate("/shipping");
  };

  return (
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
        className="w-full mt-4 bg-[#5A4FCF] text-white font-medium py-2 rounded hover:bg-[#483dc2] transition duration-200"
      >
        Checkout
      </button>
    </div>
  );
};

export default OrderSummary;
