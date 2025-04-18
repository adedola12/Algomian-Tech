import React, { useState } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  const [visible, setVisisble] = useState(false);

  const getNavLinkClass = ({ isActive }) =>
    `flex flex-col items-center gap-1 ${isActive ? "active" : ""}`;

  const getMobileNavLinkClass = ({ isActive }) =>
    `py-2 pl-6 border ${isActive ? "text-black font-semibold" : ""}`;

  return (
    <div className="flex items-center justify-between py-5 font-medium">
      <Link to="/">
        <img src={assets.color_logo} alt="Logo" className="w-50" />
      </Link>

      {/* Desktop Nav */}
      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink to="/" className={getNavLinkClass}>
          <p>HOME</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/collection" className={getNavLinkClass}>
          <p>COLLECTION</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/about" className={getNavLinkClass}>
          <p>ABOUT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/contact" className={getNavLinkClass}>
          <p>CONTACT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
      </ul>

      {/* Icons */}
      <div className="flex items-center gap-6">
        <img
          src={assets.search_icon}
          className="w-5 cursor-pointer"
          alt="search"
        />

        <div className="group relative">
          <img
            src={assets.profile_icon}
            className="w-5 cursor-pointer"
            alt="profile"
          />
          <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
            <div className="flex flex-col gap-2 w-36 py-3 bg-slate-50 text-gray-500 rounded">
              <p className="cursor-pointer hover:text-black">My Profile</p>
              <p className="cursor-pointer hover:text-black">Orders</p>
              <p className="cursor-pointer hover:text-black">LogOut</p>
            </div>
          </div>
        </div>

        <Link to="/cart" className="relative">
          <img
            src={assets.cart_icon}
            className="w-5 min-w-5 cursor-pointer"
            alt="cart"
          />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            10
          </div>
        </Link>

        <img
          onClick={() => setVisisble(true)}
          src={assets.menu_icon}
          alt="menu"
          className="w-5 cursor-pointer sm:hidden"
        />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${
          visible ? "w-full" : "w-0"
        }`}
      >
        <div className="flex flex-col text-gray-600">
          <div
            onClick={() => setVisisble(false)}
            className="flex items-center gap-4 p-3 cursor-pointer"
          >
            <img
              src={assets.dropdown_icon}
              alt="back"
              className="h-4 rotate-100"
            />
            <p>Back</p>
          </div>

          <NavLink
            to="/"
            onClick={() => setVisisble(false)}
            className={getMobileNavLinkClass}
          >
            HOME
          </NavLink>
          <NavLink
            to="/collection"
            onClick={() => setVisisble(false)}
            className={getMobileNavLinkClass}
          >
            COLLECTION
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setVisisble(false)}
            className={getMobileNavLinkClass}
          >
            ABOUT
          </NavLink>
          <NavLink
            to="/contact"
            onClick={() => setVisisble(false)}
            className={getMobileNavLinkClass}
          >
            CONTACT
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
