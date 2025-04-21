import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";

const MyOrder = () => {
  const { cartItems, currency } = useContext(ShopContext);

  // Core calculations
  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const estimatedTotal = cartSubtotal;

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-lg shadow-md p-5 border text-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-base font-semibold text-gray-800">My Order</h2>
        <button className="text-gray-500 text-xl leading-none hover:text-red-600">
          &times;
        </button>
      </div>

      {/* Ordered Products */}
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item._id} className="flex items-start gap-4">
            <img
              src={item.image[0]}
              alt={item.name}
              className="w-20 h-20 rounded object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-gray-800">
                {item.name}
              </h3>
              <p className="text-xs text-gray-500 mb-1">{item.description}</p>
              <p className="text-xs text-gray-700">
                <span className="font-semibold text-gray-800">QTY:</span>{" "}
                {item.quantity}
              </p>
              <p className="font-semibold text-sm text-gray-900 mt-1">
                {currency} {item.price.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <hr className="my-5" />

      {/* Summary */}
      <div className="space-y-3 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Cart Subtotal</span>
          <span className="font-semibold">
            {currency} {cartSubtotal.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between font-semibold text-gray-900">
          <span>Estimated Total</span>
          <span>
            {currency} {estimatedTotal.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MyOrder;
