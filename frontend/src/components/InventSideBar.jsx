import React from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FiHome,
  FiShoppingCart,
  FiTag,
  FiPackage,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiX,
} from "react-icons/fi";
import { BsClipboard } from "react-icons/bs";
import { assets } from "../assets/assets";

const navLinks = [
  { path: "/dashboard", label: "Dashboard", icon: <FiHome /> },
  { path: "/inventory", label: "Inventory", icon: <BsClipboard /> },
  { path: "/orders", label: "Orders", icon: <FiShoppingCart /> },
  { path: "/sales", label: "Sale Management", icon: <FiTag /> },
  { path: "/logistics", label: "Logistics", icon: <FiPackage /> },
  { path: "/customers", label: "Customers", icon: <FiUsers /> },
  { path: "/settings", label: "Settings", icon: <FiSettings /> },
];

const InventSideBar = ({ isOpen, setIsOpen }) => {
  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-[260px] bg-white border-r transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 pt-6 pb-4">
          <Link to="/inventory">
            <img src={assets.color_logo} alt="Logo" className="w-32" />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="text-xl md:hidden text-gray-500"
          >
            <FiX />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 flex-1 space-y-2">
          {navLinks.map(({ path, label, icon }) => (
            <NavLink
              to={path}
              key={path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition ${
                  isActive
                    ? "bg-orange-100 text-orange-500"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <span className="text-lg">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="user"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Alison Eyo
                </p>
                <p className="text-xs text-gray-500">@thealisoneyo</p>
              </div>
            </div>
            <FiLogOut className="text-xl text-gray-400 hover:text-gray-700 cursor-pointer" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default InventSideBar;
