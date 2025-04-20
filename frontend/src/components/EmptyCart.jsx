import React from "react";
import { assets } from "../assets/assets"; // adjust path if needed

const EmptyCart = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center py-16 px-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-6">
        Shopping Cart
      </h2>
      <img
        src={assets.empty_img}
        alt="Empty Cart"
        className="w-40 sm:w-52 h-auto mb-6"
      />
      <p className="text-sm sm:text-base text-gray-600">Your cart is empty</p>
    </div>
  );
};

export default EmptyCart;
