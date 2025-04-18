import React, { useState } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);

  return (
    <div className="w-full border-b px-6 py-4 shadow-sm bg-white sticky top-0 z-50">
      {/* Main Navbar */}
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-6 flex-wrap">

        {/* Logo */}
        <Link to="/">
          <img src={assets.color_logo} alt="Logo" className="w-32 sm:w-40" />
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex gap-6 text-sm text-gray-800 font-medium">
          <NavLink to="/bestsellers" className="hover:text-black">Best Sellers</NavLink>
          <NavLink to="/new" className="hover:text-black">New arrivals</NavLink>
          <NavLink to="/affiliates" className="hover:text-black">Affiliates</NavLink>
          <NavLink to="/track" className="hover:text-black">Track order</NavLink>
        </div>

        {/* Search Bar (md and up) */}
        <div className="hidden md:flex flex-1 max-w-md items-center">
          <input
            type="text"
            placeholder="Search"
            className="w-full border rounded-full px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 text-gray-700">

          {/* Search Icon (only for small screens) */}
          <button onClick={() => setShowSearchMobile(prev => !prev)} className="md:hidden">
            <img src={assets.search_icon} alt="search" className="w-5" />
          </button>

          <button>
            <img src={assets.heart_icon} alt="Wishlist" className="w-5 hover:background-red-400 cursor-pointer" />
          </button>

          <Link to="/cart" className="relative">
            <img src={assets.cart_icon} className="w-5" alt="cart" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              10
            </div>
          </Link>

          <button>
            <img src={assets.bell_icon} alt="Notifications" className="w-5" />
          </button>

          {/* Profile Dropdown */}
          <div className="group relative">
            <img
              src={assets.profile_icon}
              className="w-5 cursor-pointer"
              alt="profile"
            />
            <div className="group-hover:block hidden absolute right-0 mt-3 bg-white border shadow-md w-36 py-2 rounded text-sm text-gray-600">
              <p className="px-4 py-1 hover:bg-gray-100 cursor-pointer">My Profile</p>
              <p className="px-4 py-1 hover:bg-gray-100 cursor-pointer">Orders</p>
              <p className="px-4 py-1 hover:bg-gray-100 cursor-pointer">Logout</p>
            </div>
          </div>

          {/* Mobile Menu Icon */}
          <img
            onClick={() => setVisible(true)}
            src={assets.menu_icon}
            alt="menu"
            className="w-6 cursor-pointer lg:hidden"
          />
        </div>
      </div>

      {/* Mobile Search Input (below navbar when toggled) */}
      {showSearchMobile && (
        <div className="block md:hidden mt-3 px-2">
          <input
            type="text"
            placeholder="Search..."
            className="w-full border rounded-full px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 bottom-0 bg-white z-50 transition-all duration-300 ${
          visible ? "w-3/4 p-4" : "w-0 overflow-hidden"
        }`}
      >
        <div className="flex flex-col gap-4 text-gray-700">
          <div onClick={() => setVisible(false)} className="cursor-pointer mb-4">
            <img src={assets.close_icon} alt="close" className="w-4" />
          </div>
          <NavLink to="/bestsellers" onClick={() => setVisible(false)}>Best Sellers</NavLink>
          <NavLink to="/new" onClick={() => setVisible(false)}>New arrivals</NavLink>
          <NavLink to="/affiliates" onClick={() => setVisible(false)}>Affiliates</NavLink>
          <NavLink to="/track" onClick={() => setVisible(false)}>Track order</NavLink>
          <NavLink to="/cart" onClick={() => setVisible(false)}>Cart</NavLink>
          <NavLink to="/profile" onClick={() => setVisible(false)}>My Profile</NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
