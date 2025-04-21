import React, { useContext } from "react";
import { useNavigate } from "react-router-dom"; // ✅
import { ShopContext } from "../context/ShopContext";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";

const MyCart = () => {
  const navigate = useNavigate(); // ✅
  const { cartItems, updateCartQuantity, removeFromCart } = useContext(ShopContext);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    localStorage.setItem('orderedItems', JSON.stringify(cartItems)); // ✅ Save items
    navigate("/shipping"); // ✅ Go to shipping page
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded shadow-md">
      <h2 className="text-lg font-semibold mb-4">
        My Cart{" "}
        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
          {cartItems.length}
        </span>
      </h2>

      {cartItems.map((item) => (
        <div key={item._id} className="flex gap-4 mb-4 border-b pb-4">
          <img src={item.image[0]} alt={item.name} className="w-24 h-24 object-cover rounded" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{item.name}</h3>
            <p className="text-xs text-gray-500">{item.description}</p>
            <p className="font-bold text-sm mt-1">₦{item.price.toLocaleString()}</p>
            <div className="flex items-center mt-2">
              <button onClick={() => updateCartQuantity(item._id, -1)} className="text-xs border px-2 py-1 rounded">
                <FaMinus />
              </button>
              <span className="px-3">{item.quantity}</span>
              <button onClick={() => updateCartQuantity(item._id, 1)} className="text-xs border px-2 py-1 rounded">
                <FaPlus />
              </button>
            </div>
          </div>
          <button onClick={() => removeFromCart(item._id)}>
            <FaTrash className="text-red-500" />
          </button>
        </div>
      ))}

      <div className="mt-6">
        <p className="text-sm text-gray-600 mb-2">Subtotal:</p>
        <p className="text-xl font-bold">₦{subtotal.toLocaleString()}</p>
        <button
          className="w-full bg-[#5A4FCF] text-white py-2 mt-4 rounded"
          onClick={handleCheckout}
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default MyCart;
