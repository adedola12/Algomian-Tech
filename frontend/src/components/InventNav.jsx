import React from "react";
import { FaBell, FaBars } from "react-icons/fa";
import { FiUser } from "react-icons/fi";

const InventNav = ({ toggleSidebar }) => {
  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
        {/* Hamburger for mobile */}
        <button onClick={toggleSidebar} className="md:hidden text-xl text-gray-600">
          <FaBars />
        </button>

        {/* Right Icons */}
        <div className="flex items-center gap-4 ml-auto">
          <div className="relative">
            <FaBell className="text-gray-600 text-lg" />
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
              4
            </span>
          </div>

          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <FiUser className="text-orange-500 text-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventNav;
