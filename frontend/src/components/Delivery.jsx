import React from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

const Delivery = () => {
  return (
    <div className="px-4 my-8">
      <div
        className={`
          relative rounded-md w-full max-w-[1500px] mx-auto
          flex items-center justify-center 
          overflow-hidden responsive-bg
          min-h-[160px] sm:min-h-[220px] md:min-h-[240px] lg:min-h-[300px]
        `}
        style={{
          backgroundImage: `url(${assets.delivery_img})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        {/* Custom CSS media queries to handle background size (optional override if needed) */}
        <style>
          {`
            @media (max-width: 640px) {
              .responsive-bg {
                background-size: 100% auto;
              }
            }
            @media (min-width: 641px) and (max-width: 1023px) {
              .responsive-bg {
                background-size: 100% auto;
              }
            }
            @media (min-width: 1024px) {
              .responsive-bg {
                background-size: cover;
              }
            }
          `}
        </style>

        {/* Text and CTA */}
        <div className="z-10 text-center sm:text-left max-w-[90%] sm:max-w-[60%] px-4 sm:px-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#222] mb-4">
            Free delivery on all <span className="text-[#5A4FCF]">Lagos Orders</span>
          </h2>
          <Link
            to="/shop"
            className="inline-block bg-orange-500 text-white px-5 py-2 text-sm font-semibold rounded hover:bg-orange-600 transition"
          >
            Shop now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
