import React from 'react';
import { assets } from '../assets/assets';

const Brand = () => {
  return (
    <div className="bg-[#f3f4f6] py-8">
      <div className="max-w-full mx-auto px-4">
        <h3 className="text-[#5A4FCF] text-sm font-semibold mb-6">Brands</h3>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          <img src={assets.hp_img} alt="HP" className="h-10 object-contain grayscale opacity-80" />
          <img src={assets.dell_img} alt="Dell" className="h-10 object-contain grayscale opacity-80" />
          <img src={assets.lenovo_img} alt="Lenovo" className="h-10 object-contain grayscale opacity-80" />
          <img src={assets.apple_img} alt="Apple" className="h-10 object-contain grayscale opacity-80" />
          <img src={assets.logi2_img} alt="Brand Logo" className="h-10 object-contain grayscale opacity-80" />
          <img src={assets.logi_img} alt="Brand Logo" className="h-10 object-contain grayscale opacity-80" />
        </div>
      </div>
    </div>
  );
};

export default Brand;
