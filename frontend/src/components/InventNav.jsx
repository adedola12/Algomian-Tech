/* InventNav.jsx */
import React from "react";
import { FaBell, FaBars, FaArrowLeft } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

const InventNav = ({ toggleSidebar }) => {
  const { pathname } = useLocation();
  const navigate      = useNavigate();

  const isAddProduct = pathname === "/inventory/add-product";
  const goBack       = () => navigate("/inventory");

  /* nav bar = fixed, stretches full width until it meets sidebar */
  return (
    <header
      className="fixed top-0 left-0 z-40 flex h-16 w-full items-center
                 justify-between border-b border-gray-200 bg-white shadow-sm
                 px-4 md:px-8
                 md:left-[260px]"> {/* shift right when desktop sidebar is visible */}
      {/* left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="text-xl text-gray-600 md:hidden">
          <FaBars />
        </button>

        {isAddProduct && (
          <>
            <button
              className="rounded p-1.5 text-lg text-purple-600 hover:bg-purple-50"
              onClick={goBack}>
              <FaArrowLeft />
            </button>
            <span
              onClick={goBack}
              className="cursor-pointer text-base font-medium">
              Add Product
            </span>
          </>
        )}
      </div>

      {/* right icons */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <FaBell className="text-lg text-gray-600" />
          <span
            className="absolute -top-1 -right-1 flex h-4 w-4 items-center
                       justify-center rounded-full bg-orange-500
                       text-[10px] font-semibold text-white">
            4
          </span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
          <FiUser className="text-lg text-orange-500" />
        </div>
      </div>
    </header>
  );
};

export default InventNav;
