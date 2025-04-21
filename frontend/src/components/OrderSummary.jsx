import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";

const OrderSummary = ({ mode = "shipping" }) => {
  const { cartItems, currency } = useContext(ShopContext);
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const cartSubtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const deliveryFee = cartSubtotal > 0 ? 1000 : 0;
  const discountThreshold = 5000000;
  const defaultDiscount = cartSubtotal >= discountThreshold ? cartSubtotal * 0.1 : 0;
  const estimatedTotal = cartSubtotal + deliveryFee - (appliedDiscount || defaultDiscount);

  const handleApplyDiscount = () => {
    if (couponCode.toLowerCase() === "save10") {
      const discountValue = cartSubtotal * 0.1;
      setAppliedDiscount(discountValue);
    } else {
      alert("Invalid coupon");
    }
  };

  const handleCheckout = () => {
    navigate("/shipping");
  };

  const handlePlaceOrder = () => {
    alert("Order Placed Successfully!");
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-5 border text-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-base font-semibold text-gray-800">My Order</h2>
        {mode === "place" && (
          <button className="text-[#5A4FCF] text-xs font-medium hover:underline">
            Edit
          </button>
        )}
      </div>

      {/* Cart Preview */}
      {cartItems.length > 0 && (
        <div className="flex items-start gap-4 mb-4">
          <img
            src={cartItems[0].image}
            alt="item"
            className="w-16 h-16 rounded object-cover"
          />
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-800">{cartItems[0].name}</p>
            <p className="text-[11px] text-gray-500">{cartItems[0].description}</p>
            <p className="text-xs mt-1">
              <span className="font-medium">QTY:</span> {cartItems[0].quantity}
            </p>
            <p className="text-sm font-medium mt-1">
              {currency} {(cartItems[0].price * cartItems[0].quantity).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="flex justify-between py-2 text-gray-600 text-sm">
        <span>Cart Subtotal</span>
        <span>{currency} {cartSubtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between py-2 font-semibold text-gray-900 text-sm">
        <span>Estimated Total</span>
        <span>{currency} {estimatedTotal.toLocaleString()}</span>
      </div>

      {/* Discount Input */}
      {mode === "place" && (
        <div className="mt-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Apply Discount
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter Coupon Code"
              className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none"
            />
            <button
              onClick={handleApplyDiscount}
              className="bg-[#ff6600] text-white px-4 py-2 rounded text-sm hover:bg-orange-600"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={mode === "place" ? handlePlaceOrder : handleCheckout}
        className="w-full mt-4 bg-[#5A4FCF] text-white font-medium py-2 rounded hover:bg-[#483dc2] transition duration-200"
      >
        {mode === "place" ? "Place Order" : "Checkout"}
      </button>
    </div>
  );
};

export default OrderSummary;
