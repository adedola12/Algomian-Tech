import React from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

const Offer = () => {
  return (
    <div className="my-10 px-4 max-w-[1500px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left - Main Offer */}
        <div
          className="relative flex-1 rounded-lg overflow-hidden min-h-[250px] md:min-h-[300px] lg:min-h-[400px] bg-cover bg-center transition-transform duration-300 hover:scale-[1.01]"
          style={{ backgroundImage: `url(${assets.samp_img})` }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40 z-[1]" />

          {/* Text Content */}
          <div className="relative z-[2] p-6 flex flex-col justify-end h-full">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded mb-3 w-max drop-shadow">
              UP TO 80% OFF
            </span>
            <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold leading-tight mb-3 drop-shadow">
              Kiddies Korean <br /> Summer Collection
            </h2>
            <Link
              to="/shop"
              className="inline-block bg-orange-500 text-white px-4 py-2 text-sm font-semibold rounded hover:bg-orange-600 transition w-max drop-shadow"
            >
              Shop now
            </Link>
          </div>
        </div>

        {/* Right - 2 Smaller Offers */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Top Right */}
          <div
            className="relative rounded-lg overflow-hidden min-h-[160px] md:min-h-[180px] lg:min-h-[190px] bg-cover bg-center transition-transform duration-300 hover:scale-[1.01]"
            style={{ backgroundImage: `url(${assets.samp_img2})` }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 z-[1]" />

            {/* Text */}
            <div className="relative z-[2] p-4 flex flex-col justify-end h-full">
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded mb-2 w-max drop-shadow">
                UP TO 80% OFF
              </span>
              <h3 className="text-white text-base font-semibold leading-snug drop-shadow">
                Dell new pc <br /> line up
              </h3>
            </div>
          </div>

          {/* Bottom Right */}
          <div
            className="relative rounded-lg overflow-hidden min-h-[160px] md:min-h-[180px] lg:min-h-[190px] bg-cover bg-center transition-transform duration-300 hover:scale-[1.01]"
            style={{ backgroundImage: `url(${assets.samp_img3})` }}
          >
            {/* No overlay or content: image has text already */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offer;
