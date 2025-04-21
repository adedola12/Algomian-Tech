import React, { useEffect, useState, useContext } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import { ShopContext } from "../context/ShopContext";
import MyCart from "./MyCart";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserProfileView from "./UserProfileView";

const Navbar = () => {
  const navigate = useNavigate();
  const { setFilters } = useSearch();
  const { cartItems } = useContext(ShopContext);

  const [searchValue, setSearchValue] = useState("");
  const [visible, setVisible] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, query: searchValue }));
    navigate("/search");
  };

  const handleProfileClick = () => {
    if (!user) navigate("/login");
    else setShowProfile((prev) => !prev);
  };

  const handleLogout = () => {
    setUser(null);
    toast.success("Logged out successfully", { position: "top-center" });
    setShowProfile(false);
  };

  const simulateLogin = () => {
    const newUser = {
      name: "Olivia Rhye",
      email: "olivia@untitledui.com",
      profilePic: "https://randomuser.me/api/portraits/women/44.jpg",
      role: "admin",
    };
    setUser(newUser);
    toast.success("Login successful!", { position: "top-center" });
  };

  return (
    <div className="w-full border-b px-6 py-4 shadow-sm bg-white sticky top-0 z-[100]">
      <ToastContainer />
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        <Link to="/">
          <img src={assets.color_logo} alt="Logo" className="w-32 sm:w-40" />
        </Link>

        <div className="hidden lg:flex gap-6 text-sm text-gray-800 font-medium">
          <NavLink to="/bestsellers">Best Sellers</NavLink>
          <NavLink to="/new">New Arrivals</NavLink>
          <NavLink to="/affiliates">Affiliates</NavLink>
          <NavLink to="/track">Track Order</NavLink>
        </div>

        <div className="hidden md:flex flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search"
            className="w-full border rounded-full px-4 py-2 text-sm"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        <div className="flex items-center gap-4 text-gray-700">
          <button
            onClick={() => {
              setShowSearchMobile((prev) => !prev);
              if (searchValue.trim()) handleSearch();
            }}
            className="md:hidden"
          >
            <img src={assets.search_icon} alt="search" className="w-5" />
          </button>

          <button>
            <img src={assets.heart_icon} alt="Wishlist" className="w-5" />
          </button>

          <button onClick={() => setShowCart(true)} className="relative">
            <img src={assets.cart_icon} className="w-5" alt="cart" />
            {totalItems > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </div>
            )}
          </button>

          <button>
            <img src={assets.bell_icon} alt="Notifications" className="w-5" />
          </button>

          {/* Profile or Login Icon */}
          <div className="relative">
            <img
              src={user?.profilePic || assets.profile_icon}
              className="w-6 h-6 rounded-full object-cover cursor-pointer"
              alt="profile"
              onClick={handleProfileClick}
            />
            {showProfile && user && (
                <div
                className="absolute right-0 top-8 z-[150]"
                onMouseLeave={() => setShowProfile(false)}
              >
                <UserProfileView onClose={() => setShowProfile(false)} />
              </div>
            )}
          </div>

          <img
            onClick={() => setVisible(true)}
            src={assets.menu_icon}
            alt="menu"
            className="w-6 cursor-pointer lg:hidden"
          />
        </div>
      </div>

      {/* Search Input (Mobile) */}
      {showSearchMobile && (
        <div className="block md:hidden mt-3 px-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full border rounded-full px-4 py-2 text-sm"
          />
        </div>
      )}

      {/* Sidebar (Mobile Navigation) */}
      <div
        className={`fixed top-0 right-0 bottom-0 bg-white z-[110] transition-transform duration-300 ease-in-out ${
          visible
            ? "translate-x-0 w-3/4 p-4"
            : "translate-x-full w-0 overflow-hidden"
        }`}
      >
        <div className="flex flex-col gap-4 text-gray-700">
          <button onClick={() => setVisible(false)} className="mb-4 self-end">
            <img src={assets.close_icon} alt="close" className="w-4" />
          </button>
          <NavLink to="/bestsellers" onClick={() => setVisible(false)}>
            Best Sellers
          </NavLink>
          <NavLink to="/new" onClick={() => setVisible(false)}>
            New Arrivals
          </NavLink>
          <NavLink to="/affiliates" onClick={() => setVisible(false)}>
            Affiliates
          </NavLink>
          <NavLink to="/track" onClick={() => setVisible(false)}>
            Track Order
          </NavLink>
          {user && (
            <NavLink to="/profile" onClick={() => setVisible(false)}>
              My Profile
            </NavLink>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      {showCart && (
        <div className="fixed top-0 right-0 w-full sm:max-w-md h-full bg-white shadow-lg z-[120] transition-all p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">My Cart</h3>
            <button onClick={() => setShowCart(false)}>
              <img src={assets.close_icon} alt="close" className="w-4" />
            </button>
          </div>
          <MyCart />
        </div>
      )}

      {/* Simulate Login Button (DEV ONLY) */}
      <div className="flex">
        <button onClick={simulateLogin}>Simulate Login</button>
      </div>
    </div>
  );
};

export default Navbar;
