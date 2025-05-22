// ---------------------------------------------
//  frontend/src/components/Navbar.jsx
// ---------------------------------------------
import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { assets } from "../assets/assets";
import { useSearch } from "../context/SearchContext";
import { ShopContext } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";

import MyCart from "./MyCart";
import UserProfileView from "./UserProfileView";

export default function Navbar() {
  const navigate = useNavigate();
  const { setFilters } = useSearch();
  const { cartItems } = useContext(ShopContext);
  const { user, logout, loading } = useAuth();

  /* ----- UI ----- */
  const [search, setSearch] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [mSearch, setMSearch] = useState(false);

  const totalItems = cartItems.reduce((t, i) => t + i.quantity, 0);
  const allowInventory = !loading && user && user.userType !== "Customer";

  const doSearch = () => {
    if (!search.trim()) return;
    setFilters((p) => ({ ...p, query: search }));
    navigate("/search");
    setMSearch(false);
  };

  /* ----- UI ----- */
  return (
    <header className="sticky top-0 z-50 border-b bg-white px-4 py-3 shadow-sm">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4">
        <Link to="/">
          <img src={assets.color_logo} alt="Algomian" className="w-32" />
        </Link>

        <nav className="hidden lg:flex gap-6 text-sm font-medium text-gray-800">
          <NavLink to="/bestsellers">Best Sellers</NavLink>
          <NavLink to="/new">New Arrivals</NavLink>
          <NavLink to="/affiliates">Affiliates</NavLink>
          <NavLink to="/track">Track Order</NavLink>

          {/* show only when auth finished and role allowed */}
          {!loading && allowInventory && (
    <NavLink to="/inventory">Inventory</NavLink>
  )}
        </nav>

        <div className="hidden md:flex flex-1 max-w-md">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="Search"
            className="w-full rounded-full border px-4 py-2 text-sm"
          />
        </div>

        <div className="ml-auto flex items-center gap-4 text-gray-700">
          <button className="md:hidden" onClick={() => setMSearch(!mSearch)}>
            <img src={assets.search_icon} alt="" className="w-5" />
          </button>

          <img src={assets.heart_icon} alt="" className="w-5" />

          <button onClick={() => setShowCart(true)} className="relative">
            <img src={assets.cart_icon} alt="" className="w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[10px] text-white">
                {totalItems}
              </span>
            )}
          </button>

          <img src={assets.bell_icon} alt="" className="w-5" />

          {/* profile */}
          <div className="relative">
            <img
              src={
                (user && user?.profileImage) ||
                "https://api.dicebear.com/7.x/personas/svg"
              }
              alt="profile"
              className="h-6 w-6 cursor-pointer rounded-full object-cover"
              onClick={() =>
                user ? setShowProfile((p) => !p) : navigate("/login")
              }
            />
            {user && showProfile && (
              <div
                className="absolute right-0 top-8 z-50"
                onMouseLeave={() => setShowProfile(false)}
              >
                <UserProfileView
                  user={user}
                  onLogout={() => {
                    logout();
                    toast.success("Logged out");
                    navigate("/");
                  }}
                  onClose={() => setShowProfile(false)}
                />
              </div>
            )}
          </div>

          <img
            src={assets.menu_icon}
            alt="menu"
            className="w-6 cursor-pointer lg:hidden"
            onClick={() => setDrawer(true)}
          />
        </div>
      </div>

      {mSearch && (
        <div className="mt-3 md:hidden">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="Search…"
            className="w-full rounded-full border px-4 py-2 text-sm"
          />
        </div>
      )}

      {/* mobile drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 w-3/4 bg-white p-4 transition-transform duration-300 ${
          drawer ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button className="mb-4 ml-auto w-5" onClick={() => setDrawer(false)}>
          <img src={assets.close_icon} alt="" />
        </button>
        <nav className="flex flex-col gap-4 text-gray-700">
          <NavLink to="/bestsellers" onClick={() => setDrawer(false)}>
            Best Sellers
          </NavLink>
          <NavLink to="/new" onClick={() => setDrawer(false)}>
            New Arrivals
          </NavLink>
          <NavLink to="/affiliates" onClick={() => setDrawer(false)}>
            Affiliates
          </NavLink>
          <NavLink to="/track" onClick={() => setDrawer(false)}>
            Track Order
          </NavLink>
          {!loading &&
            ["Admin", "Manager", "SalesRep"].includes(user?.userType) && (
              <NavLink to="/inventory" onClick={() => setDrawer(false)}>
                Inventory
              </NavLink>
            )}

{!loading && allowInventory && (
    <NavLink to="/inventory" onClick={() => setDrawer(false)}>
      Inventory
    </NavLink>
  )}
        </nav>
      </aside>

      {/* cart panel */}
      {showCart && (
        <div className="fixed inset-y-0 right-0 z-40 w-full overflow-y-auto bg-white p-4 shadow-lg sm:max-w-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">My Cart</h3>
            <button onClick={() => setShowCart(false)}>
              <img src={assets.close_icon} alt="" className="w-4" />
            </button>
          </div>
          <MyCart />
        </div>
      )}
    </header>
  );
}
