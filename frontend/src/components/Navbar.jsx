import React, { useState } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  const [visible, setVisisble] = useState(false)
  return (
    <div className="flex items-center justify-between py-5 font-medium">
      <img src={assets.color_logo} alt="Logo" className="w-50" />

      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>HOME</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700" />
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          <p>COLLECTION</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700" />
        </NavLink>
        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <p>ABOUT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700" />
        </NavLink>
        <NavLink to="/contact" className="flex flex-col items-center gap-1">
          <p>CONTACT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700" />
        </NavLink>
      </ul>

      <div className="flex items-center gap-6">
        <img src={assets.search_icon} className="w-5 cursor-pointer" alt="" />

        <div className="group relative">
          <img
            src={assets.profile_icon}
            className="w-5 cursor-pointer"
            alt=""
          />
          <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
            <div className="flex flex-col gap-2 w-36 py-3 bg-slate-50 text-gray-500 rounded">
              <p className="cursor-pointer hover:text-black">My Profile</p>
              <p className="cursor-pointer hover:text-black">Orders</p>
              <p className="cursor-pointer hover:text-black">LogOut</p>
            </div>
          </div>
        </div>

        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-5 min-w-5 cursor-pointer" alt="" />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            10
          </div>

        </Link>

        <img onClick={() => setVisisble(true)} src={assets.menu_icon} alt="" className="w-5 cursor-pointer sm:hidden" />
      </div> 

      {/*Side bar menu for smaller screen*/}
      <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible? 'w-full': 'w-0'}`}>
        <div className="flex flex-col text-gray-600">
          <div onClick={() => setVisisble(false)} className="flex items-center gap-4 p-3 cursor-pointer">
            <img src={assets.dropdown_icon} alt="" className="h-4 rotate-100 " />
            <p>Back</p>
          </div>

          <NavLink onClick={() => setVisisble(false)} className="py-2 pl-6 border " to='/'>HOME</NavLink>
          <NavLink onClick={() => setVisisble(false)} className="py-2 pl-6 border" to='/collection'>COLLECTION</NavLink>
          <NavLink onClick={() => setVisisble(false)} className="py-2 pl-6 border" to='/about'>ABOUT</NavLink>
          <NavLink onClick={() => setVisisble(false)} className="py-2 pl-6 border" to='/contact'>CONTACT</NavLink>

        </div>
      </div>
    </div>
  );
};

export default Navbar;
