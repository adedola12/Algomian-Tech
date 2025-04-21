import React from "react";
import { Link } from "react-router-dom";

const UserProfileView = ({ onClose }) => {
  return (
    <div className="w-64 bg-white rounded shadow-lg text-sm border z-[150]">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b">
        <img
          src="https://randomuser.me/api/portraits/women/44.jpg"
          alt="profile"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold">Olivia Rhye</p>
          <p className="text-gray-500 text-xs">olivia@untitledui.com</p>
        </div>
      </div>

      {/* Menu Links */}
      <ul className="divide-y text-sm text-gray-700">
        <li>
          <Link to="/profile" onClick={onClose} className="block px-4 py-2 hover:bg-gray-50">Personal Information</Link>
        </li>
        <li>
          <Link to="/orders" onClick={onClose} className="block px-4 py-2 hover:bg-gray-50">My Order</Link>
        </li>
        <li>
          <Link to="/wishlist" onClick={onClose} className="block px-4 py-2 hover:bg-gray-50">Wishlist</Link>
        </li>
        <li>
          <Link to="/cart" onClick={onClose} className="block px-4 py-2 hover:bg-gray-50">My Cart</Link>
        </li>
        <li>
          <Link to="/inventory" onClick={onClose} className="block px-4 py-2 hover:bg-gray-50">Inventory</Link>
        </li>
        <li>
          <button
            onClick={onClose}
            className="w-full text-left text-red-600 px-4 py-2 hover:bg-red-50"
          >
            Log out
          </button>
        </li>
      </ul>
    </div>
  );
};

export default UserProfileView;
