import { FaBell, FaBars, FaArrowLeft } from "react-icons/fa";
import { FiUser }                      from "react-icons/fi";
import { useMatch, useNavigate }       from "react-router-dom";

export default function InventNav({ toggleSidebar }) {
  const navigate     = useNavigate();

  // match exact "/inventory/add-product"
  const isAddProduct  = useMatch({ path: "/inventory/add-product",   end: true });
  // match "/inventory/edit-product/:productId"
  const isEditProduct = useMatch({ path: "/inventory/edit-product/:productId", end: true });

  // go back one step in history (or: navigate("/inventory"))
  const goBack = () => navigate(-1);

  return (
    <header
      className="sticky top-0 z-40 flex h-16 items-center
                 justify-between border-b border-gray-200 bg-white
                 px-4 md:px-8 shadow-sm"
    >
      {/* ─ left ─ */}
      <div className="flex items-center gap-3">
        {/* mobile hamburger */}
        <button
          onClick={toggleSidebar}
          className="text-xl text-gray-600 md:hidden"
        >
          <FaBars />
        </button>

        {(isAddProduct || isEditProduct) && (
          <>
            <button
              onClick={goBack}
              className="rounded p-1.5 text-lg text-purple-600 hover:bg-purple-50"
            >
              <FaArrowLeft />
            </button>
            <span
              onClick={goBack}
              className="cursor-pointer text-base font-medium"
            >
              {isAddProduct ? "Add Product" : "Edit Product"}
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
                       rounded-full bg-orange-500 text-[10px] font-semibold text-white"
          >
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
