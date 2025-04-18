import React from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInstagram,
  FaYoutube,
  FaFacebook,
  FaTwitter,
} from "react-icons/fa";

const Header = () => {
  return (
    <div className="bg-[#1D1B36] text-white text-[10px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] py-2 px-4">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row justify-between items-center sm:items-start gap-2 sm:gap-4">
        {/* Left Section */}
        <div className="flex-1 flex flex-col sm:flex-row flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-6 text-center sm:text-left">
          <div className="flex items-center gap-1 whitespace-nowrap">
            <FaPhoneAlt className="text-[11px]" />
            <span>+234 (0)90 118 6016</span>
          </div>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <FaEnvelope className="text-[11px]" />
            <span>info@algomiantechnologies.com</span>
          </div>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <FaMapMarkerAlt className="text-[11px]" />
            <span>Suite 15, Distinct Plaza, Francis Oremeji, Ikeja, Lagos</span>
          </div>
        </div>

        {/* Right Section - visible on sm and lg, hidden on md only */}
        <div className="hidden sm:flex md:hidden lg:flex flex-col items-end gap-2 whitespace-nowrap">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">Follow Us :</span>
            <div className="flex justify-between gap-2">
              <FaInstagram className="cursor-pointer hover:text-pink-400" />
              <FaYoutube className="cursor-pointer hover:text-red-400" />
              <FaFacebook className="cursor-pointer hover:text-blue-400" />
              <FaTwitter className="cursor-pointer hover:text-black" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
