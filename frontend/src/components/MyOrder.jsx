import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";

const MyOrder = ({ mode = "shipping" }) => {
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
    // Optional: clear cart or save order info to localStorage here
    navigate("/order-success");
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

      {/* All Cart Items */}
      {cartItems.length > 0 ? (
        <div className="space-y-4 mb-4">
          {cartItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded object-cover"
              />
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-800">{item.name}</p>
                <p className="text-[11px] text-gray-500">{item.description}</p>
                <p className="text-xs mt-1">
                  <span className="font-medium">QTY:</span> {item.quantity}
                </p>
                <p className="text-sm font-medium mt-1">
                  {currency} {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm mb-4">Your cart is currently empty. Please add items before proceeding to checkout.</p>

      )}

      {/* Price Summary */}
      <div className="flex justify-between py-2 text-gray-600 text-sm">
        <span>Cart Subtotal</span>
        <span>{currency} {cartSubtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between py-2 font-semibold text-gray-900 text-sm">
        <span>Estimated Total</span>
        <span>{currency} {estimatedTotal.toLocaleString()}</span>
      </div>

      {/* Discount & CTA (only on place order page) */}
      {mode === "place" && (
        <>
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

          <button
            onClick={handlePlaceOrder}
            className="w-full mt-4 bg-[#5A4FCF] text-white font-medium py-2 rounded hover:bg-[#483dc2] transition duration-200"
          >
            Place Order
          </button>
        </>
      )}
    </div>
  );
};

export default MyOrder;
