import { useEffect, useState, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { assets }       from "../assets/assets";
import { useSearch }    from "../context/SearchContext";
import { ShopContext }  from "../context/ShopContext";
import api              from "../api";

import MyCart           from "./MyCart";
import UserProfileView  from "./UserProfileView";

export default function Navbar() {
  const navigate       = useNavigate();
  const { setFilters } = useSearch();
  const { cartItems }  = useContext(ShopContext);

  /* ---------- auth state ---------- */
  const [token, setToken] = useState(
    () => localStorage.getItem("algomian:token") || null
  );
  const [user , setUser ] = useState(null);

  /* ---------- ui state ------------ */
  const [search, setSearch]     = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [drawer, setDrawer]           = useState(false);
  const [mSearch, setMSearch]         = useState(false);

  /* ---------- listen for token changes from ANYWHERE ---------- */
  useEffect(() => {
    const sync = (e) => {
      if (e.key === "algomian:token")             setToken(e.newValue);
      if (e.type === "algomian-login")            setToken(localStorage.getItem("algomian:token"));
    };
    window.addEventListener("storage",        sync);   // other tabs
    window.addEventListener("algomian-login", sync);   // same tab
    return () => {
      window.removeEventListener("storage",        sync);
      window.removeEventListener("algomian-login", sync);
    };
  }, []);

  /* ---------- fetch profile whenever token exists ---------- */
  useEffect(() => {
    if (!token) {                       // logged‑out
      api.defaults.headers.common.Authorization = "";
      setUser(null);
      return;
    }

    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    (async () => {
      try   { setUser((await api.get("/api/users/profile")).data); }
      catch { localStorage.removeItem("algomian:token"); setToken(null); }
    })();
  }, [token]);

  /* ---------- helpers ---------- */
  const totalItems = cartItems.reduce((t, i) => t + i.quantity, 0);

  const doSearch = () => {
    if (!search.trim()) return;
    setFilters((p) => ({ ...p, query: search }));
    navigate("/search");
    setMSearch(false);
  };

  const logout = () => {
    localStorage.removeItem("algomian:token");
    setToken(null);
    toast.success("Logged out");
    navigate("/");
  };

  /* ---------- UI ---------- */
  return (
    <header className="sticky top-0 z-50 border-b bg-white px-4 py-3 shadow-sm">
      <ToastContainer />
      <div className="mx-auto flex max-w-[1440px] items-center gap-4">
        {/* logo */}
        <Link to="/">
          <img src={assets.color_logo} alt="Algomian" className="w-32" />
        </Link>

        {/* desktop nav */}
        <nav className="hidden lg:flex gap-6 text-sm font-medium text-gray-800">
          <NavLink to="/bestsellers">Best Sellers</NavLink>
          <NavLink to="/new">New Arrivals</NavLink>
          <NavLink to="/affiliates">Affiliates</NavLink>
          <NavLink to="/track">Track Order</NavLink>
          {user?.userType === "Admin" && (
            <NavLink to="/inventory">Inventory</NavLink>
          )}
        </nav>

        {/* desktop search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="Search"
            className="w-full rounded-full border px-4 py-2 text-sm"
          />
        </div>

        {/* right icons */}
        <div className="ml-auto flex items-center gap-4 text-gray-700">
          {/* mobile search toggle */}
          <button className="md:hidden" onClick={() => setMSearch((p) => !p)}>
            <img src={assets.search_icon} alt="" className="w-5" />
          </button>

          <img src={assets.heart_icon} alt="" className="w-5" />

          {/* cart */}
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
              src={user?.profileImage || assets.profile_icon}
              alt="profile"
              className="h-6 w-6 cursor-pointer rounded-full object-cover"
              onClick={() => (user ? setShowProfile((p) => !p) : navigate("/login"))}
            />
            {user && showProfile && (
              <div
                className="absolute right-0 top-8 z-50"
                onMouseLeave={() => setShowProfile(false)}
              >
                <UserProfileView
                  user={user}
                  onLogout={logout}
                  onClose={() => setShowProfile(false)}
                />
              </div>
            )}
          </div>

          {/* hamburger */}
          <img
            src={assets.menu_icon}
            alt="menu"
            className="w-6 cursor-pointer lg:hidden"
            onClick={() => setDrawer(true)}
          />
        </div>
      </div>

      {/* mobile search */}
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
            Best Sellers
          </NavLink>
          <NavLink to="/new" onClick={() => setDrawer(false)}>
            New Arrivals
          </NavLink>
          <NavLink to="/affiliates" onClick={() => setDrawer(false)}>
            Affiliates
          </NavLink>
          <NavLink to="/track" onClick={() => setDrawer(false)}>
            Track Order
          </NavLink>
          {user?.userType === "Admin" && (
            <NavLink to="/inventory" onClick={() => setDrawer(false)}>
              Inventory
            </NavLink>
          )}
          {user && (
            <NavLink to="/profile" onClick={() => setDrawer(false)}>
              My Profile
            </NavLink>
          )}
        </nav>
      </aside>

      {/* cart panel */}
      {showCart && (
        <div className="fixed inset-y-0 right-0 z-40 w-full overflow-y-auto bg-white p-4 shadow-lg sm:max-w-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">My Cart</h3>
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
