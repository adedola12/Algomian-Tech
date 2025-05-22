/* ────────────────────────────────────────────────────────────
   InventSideBar.jsx · Tailwind 3 + React-Icons
──────────────────────────────────────────────────────────── */
import React from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FiHome, FiShoppingCart, FiTag, FiPackage, FiUsers,
  FiSettings, FiLogOut, FiX
} from "react-icons/fi";
import { BsClipboard } from "react-icons/bs";
import { assets } from "../assets/assets";

/* 1️⃣  ROUTE → ROLE MATRIX
   – Dashboard / Inventory / Settings   → everybody
   – Orders                             → Admin, Manager, SalesRep, Logistics
   – Sales Management                   → Admin, Manager, SalesRep
   – Customers                          → Admin, Manager, SalesRep
   – Logistics                          → Admin, Logistics                          */
const ALL     = ["Admin", "Manager", "SalesRep", "Logistics", "Customer"];
const navLinks = [
  { path: "/dashboard",           label: "Dashboard",        icon: <FiHome />      , roles: ALL },
  { path: "/inventory",           label: "Inventory",        icon: <BsClipboard /> , roles: ALL },
  { path: "/inventory/orders",    label: "Orders",           icon: <FiShoppingCart/>, roles: ["Admin","Manager","SalesRep","Logistics"] },
  { path: "/sales",               label: "Sale Management",  icon: <FiTag />       , roles: ["Admin","Manager","SalesRep"] },
  { path: "/logistics",           label: "Logistics",        icon: <FiPackage />   , roles: ["Admin","Logistics"] },
  { path: "/customers",           label: "Customers",        icon: <FiUsers />     , roles: ["Admin","Manager","SalesRep"] },
  { path: "/settings",            label: "Settings",         icon: <FiSettings />  , roles: ALL },
];

/* 2️⃣  SIDEBAR COMPONENT -------------------------------------------------- */
export default function InventSideBar({ isOpen, setIsOpen, user, onLogout }) {
  const role = user?.userType ?? "Customer";
  const links = React.useMemo(
    () => navLinks.filter(l => l.roles.includes(role)),
    [role]
  );

  return (
    <>
      {/* mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity ${
          isOpen ? "block md:hidden" : "hidden"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen w-[260px] flex-col
                    justify-between border-r bg-white transition-transform
                    duration-300 md:translate-x-0 ${
                      isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
      >
        {/* logo + close */}
        <div className="flex items-center justify-between px-4 pt-6 pb-4">
          <Link to="/inventory">
            <img src={assets.color_logo} alt="Logo" className="w-32" />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="text-xl text-gray-500 md:hidden"
          >
            <FiX />
          </button>
        </div>

        {/* navigation */}
        <nav className="flex-1 space-y-2 px-4">
          {links.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              end
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium
                 transition ${
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

        {/* user footer */}
        {user && (
          <div className="mt-auto border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.profileImage || "https://i.pravatar.cc/100"}
                  className="h-9 w-9 rounded-full object-cover"
                  alt=""
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <FiLogOut
                className="cursor-pointer text-xl text-gray-400 hover:text-gray-700"
                onClick={onLogout}
                title="Logout"
              />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
