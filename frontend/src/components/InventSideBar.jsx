/* ────────────────────────────────────────────────────────────
   InventSideBar.jsx · Tailwind 3 + React-Icons
──────────────────────────────────────────────────────────── */
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
import { DEFAULT_PERMS_BY_TYPE } from "../utils/defaultPerms";

/* 1️⃣  ROUTE → ROLE MATRIX
   – Dashboard / Inventory / Settings   → everybody
   – Orders                             → Admin, Manager, SalesRep, Logistics
   – Sales Management                   → Admin, Manager, SalesRep
   – Customers                          → Admin, Manager, SalesRep
   – Logistics                          → Admin, Logistics                          */
const ALL = ["Admin", "Manager", "SalesRep", "Logistics", "Customer"];

const NAV_LINKS = [
  { path: "/dashboard", label: "Dashboard", icon: <FiHome />, perm: null }, // everyone
  {
    path: "/inventory",
    label: "Inventory",
    icon: <BsClipboard />,
    perm: "product.view",
  },
  {
    path: "/inventory/orders",
    label: "Orders",
    icon: <FiShoppingCart />,
    perm: "order.view",
  },
  {
    path: "/sales",
    label: "Sale Management",
    icon: <FiTag />,
    perm: "order.edit",
  },
  {
    path: "/logistics",
    label: "Logistics",
    icon: <FiPackage />,
    perm: "shipment.view",
  },
  {
    path: "/customers",
    label: "Customers",
    icon: <FiUsers />,
    perm: "order.view",
  },
  { path: "/settings", label: "Settings", icon: <FiSettings />, perm: null },
];

/* 2️⃣  SIDEBAR COMPONENT -------------------------------------------------- */
export default function InventSideBar({ isOpen, setIsOpen, user, onLogout }) {
  const safeUser = user ?? {};
  const perms =
    safeUser.perms && safeUser.perms.length
      ? safeUser.perms
      : DEFAULT_PERMS_BY_TYPE[safeUser.userType] ?? [];
  // const role = user?.userType ?? "Customer";
  // const links = React.useMemo(
  //   () => NAV_LINKS.filter((l) => l.roles.includes(role)),
  //   [role]
  // );


  const links = NAV_LINKS.filter((l) => !l.perm || perms.includes(l.perm));

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
