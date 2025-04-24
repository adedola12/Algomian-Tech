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
  { path: "/inventory/orders", label: "Orders", icon: <FiShoppingCart /> },
  { path: "/sales", label: "Sale Management", icon: <FiTag /> },
  { path: "/logistics", label: "Logistics", icon: <FiPackage /> },
  { path: "/customers", label: "Customers", icon: <FiUsers /> },
  { path: "/settings", label: "Settings", icon: <FiSettings /> },
];

const InventSideBar = ({ isOpen, setIsOpen }) => {
  return (
    <>
      {/* Dark overlay for mobile */}
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen ? "block md:hidden" : "hidden"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-[260px] h-screen
              flex flex-col justify-between border-r bg-white
              transition-transform duration-300 ease-in-out
              ${isOpen ? "translate-x-0" : "-translate-x-full"}
              md:static md:translate-x-0`}
      >
        {/* Logo & Close Button */}
        <div className="flex items-center justify-between px-4 pt-6 pb-4">
          <Link to="/inventory">
            <img src={assets.color_logo} alt="Logo" className="w-32" />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-xl text-gray-500"
          >
            <FiX />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="px-4 flex-1 space-y-2">
          {navLinks.map(({ path, label, icon }) => (
          <NavLink
            to={path}
            key={path}
            end        // ← ADD THIS
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

        {/* Footer */}
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
