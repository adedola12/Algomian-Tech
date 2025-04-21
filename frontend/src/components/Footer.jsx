import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <footer className="bg-[#524D9B] text-white px-4 md:px-10 py-6">
      <div className="max-w-full mx-auto">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-4">
          {/* Logo & Address */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <img src={assets.logo_black} alt="Algomian Logo" className="w-36 mb-2" />
            <p className="text-sm">
              Suite 13, District Plaza, Francis Onwugbu, Abuja, Lagos
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center lg:justify-end gap-4 text-sm text-white/90">
            <Link to="/shop">Shop</Link>
            <Link to="/track">Track Order</Link>
            <Link to="/affiliate">Affiliate</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>

        <hr className="border-white/20 my-4" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/70">
          <p>Copyright © 2023 Algomian Technologies. All rights reserved</p>

          <div className="flex gap-4">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
          </div>

          <div className="flex gap-3 text-white text-sm">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
