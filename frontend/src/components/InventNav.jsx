import { FaBell, FaBars, FaArrowLeft } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

export default function InventNav({ toggleSidebar }) {
  const { pathname } = useLocation();
  const navigate     = useNavigate();

  const isAddProduct = pathname === "/inventory/add-product";
  const goBack       = () => navigate("/inventory");

  /*  stick to the top **inside** the content column
      (no more fixed + left-shift hacks)                           */
  return (
    <header
      className="sticky top-0 z-40 flex h-16 items-center
                 justify-between border-b border-gray-200 bg-white
                 px-4 md:px-8 shadow-sm">
      {/* ─ left ─ */}
      <div className="flex items-center gap-3">
        {/* mobile hamburger */}
        <button
          onClick={toggleSidebar}
          className="text-xl text-gray-600 md:hidden">
          <FaBars />
        </button>

        {isAddProduct && (
          <>
            <button
              onClick={goBack}
              className="rounded p-1.5 text-lg text-purple-600 hover:bg-purple-50">
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

      {/* ─ right ─ */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <FaBell className="text-lg text-gray-600" />
          <span
            className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center
                       rounded-full bg-orange-500 text-[10px] font-semibold text-white">
            4
          </span>
        </div>
        <div className="grid h-8 w-8 place-items-center rounded-full bg-orange-100">
          <FiUser className="text-lg text-orange-500" />
        </div>
      </div>
    </header>
  );
}
