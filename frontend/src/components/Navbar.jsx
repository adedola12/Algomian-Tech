import React, { useState, useContext } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import { ShopContext } from "../context/ShopContext";
import MyCart from "./MyCart";

const Navbar = () => {
  const navigate = useNavigate();
  const { setFilters } = useSearch();
  const [searchValue, setSearchValue] = useState("");

  const [visible, setVisible] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const { cartItems } = useContext(ShopContext);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, query: searchValue }));
    navigate("/search");
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="w-full border-b px-6 py-4 shadow-sm bg-white sticky top-0 z-[100]">
     <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3 sm:gap-6 flex-nowrap">
        {/* Logo */}
        <Link to="/">
          <img src={assets.color_logo} alt="Logo" className="w-32 sm:w-40" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex gap-6 text-sm text-gray-800 font-medium">
          <NavLink to="/bestsellers">Best Sellers</NavLink>
          <NavLink to="/new">New arrivals</NavLink>
          <NavLink to="/affiliates">Affiliates</NavLink>
          <NavLink to="/track">Track order</NavLink>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search"
            className="w-full border rounded-full px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 text-gray-700">
          <button
            onClick={() => {
              setShowSearchMobile((prev) => !prev);
              if (searchValue.trim()) handleSearch();
            }}
            className="md:hidden"
          >
            <img src={assets.search_icon} alt="search" className="w-5" />
          </button>

          <button>
            <img src={assets.heart_icon} alt="Wishlist" className="w-5" />
          </button>

          <button onClick={() => setShowCart(true)} className="relative">
            <img src={assets.cart_icon} className="w-5" alt="cart" />
            {totalItems > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </div>
            )}
          </button>

          <button>
            <img src={assets.bell_icon} alt="Notifications" className="w-5" />
          </button>

          {/* Profile */}
          <div className="group relative">
            <img
              src={assets.profile_icon}
              className="w-5 cursor-pointer"
              alt="profile"
            />
            <div className="group-hover:block hidden absolute right-0 mt-3 bg-white border shadow-md w-36 py-2 rounded text-sm text-gray-600">
              <p className="px-4 py-1 hover:bg-gray-100">My Profile</p>
              <p className="px-4 py-1 hover:bg-gray-100">Orders</p>
              <p className="px-4 py-1 hover:bg-gray-100">Logout</p>
            </div>
          </div>

          {/* Mobile Menu */}
          <img
            onClick={() => setVisible(true)}
            src={assets.menu_icon}
            alt="menu"
            className="w-6 cursor-pointer lg:hidden"
          />
        </div>
      </div>

      {/* Mobile Search */}
      {showSearchMobile && (
        <div className="block md:hidden mt-3 px-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full border rounded-full px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 bottom-0 bg-white z-[110] transition-all duration-300 ${
          visible ? "w-3/4 p-4" : "w-0 overflow-hidden"
        }`}
      >
        <div className="flex flex-col gap-4 text-gray-700">
          <div
            onClick={() => setVisible(false)}
            className="cursor-pointer mb-4"
          >
            <img src={assets.close_icon} alt="close" className="w-4" />
          </div>
          <NavLink to="/bestsellers" onClick={() => setVisible(false)}>
            Best Sellers
          </NavLink>
          <NavLink to="/new" onClick={() => setVisible(false)}>
            New arrivals
          </NavLink>
          <NavLink to="/affiliates" onClick={() => setVisible(false)}>
            Affiliates
          </NavLink>
          <NavLink to="/track" onClick={() => setVisible(false)}>
            Track order
          </NavLink>
          <NavLink to="/profile" onClick={() => setVisible(false)}>
            My Profile
          </NavLink>
        </div>
      </div>

      {/* Cart Slide-In */}
      {showCart && (
        <div className="fixed top-0 right-0 w-full sm:max-w-md h-full bg-white shadow-lg z-[120] transition-all p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">My Cart</h3>
            <button onClick={() => setShowCart(false)}>
              <img src={assets.close_icon} alt="close" className="w-4" />
            </button>
          </div>
          <MyCart />
        </div>
      )}
    </div>
  );
};

export default Navbar;
