import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";

const ShoppingCart = () => {
  const { cartItems, updateCartQuantity, removeFromCart, currency } = useContext(ShopContext);

  const totalItems = cartItems.length;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border rounded-lg p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Shopping Cart</h2>
        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {totalItems}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-6">
        {cartItems.map((item) => (
          <div
            key={item._id}
            className="flex flex-col sm:flex-row justify-between items-center border rounded p-3"
          >
            {/* Image and Info */}
            <div className="flex items-center gap-4">
              <img
                src={item.image[0]}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold text-sm text-gray-800">{item.name}</h3>
                <p className="text-xs text-gray-500">{item.ram}, {item.storage}, {item.processor}</p>
              </div>
            </div>

            {/* Controls & Price */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 sm:mt-0">
              {/* Quantity */}
              <div className="flex items-center border rounded px-2">
                <button
                  onClick={() => updateCartQuantity(item._id, -1)}
                  className="text-xs p-1 text-gray-700"
                >
                  <FaMinus />
                </button>
                <span className="px-2">{item.quantity}</span>
                <button
                  onClick={() => updateCartQuantity(item._id, 1)}
                  className="text-xs p-1 text-gray-700"
                >
                  <FaPlus />
                </button>
              </div>

              {/* Price */}
              <div className="text-sm font-bold text-gray-800 whitespace-nowrap">
                {currency} {item.price.toLocaleString()}
              </div>

              {/* Delete */}
              <button onClick={() => removeFromCart(item._id)} className="text-gray-500 hover:text-red-500">
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShoppingCart;
