import React from "react";
import { assets } from "../assets/assets";

const Hero = () => {
  return (
    <div
      className="w-full bg-cover bg-center text-white flex items-center justify-start px-6 sm:px-12 lg:px-24"
      style={{
        backgroundImage: `url(${assets.hero_back})`,
        height: "500px", // you can adjust this to min-h-screen or h-[600px]
      }}
    >
      <div className="max-w-2xl">
        <p className="text-sm font-semibold bg-blue-600 text-white px-3 py-1 rounded-full w-fit mb-4">
          ENDLESS SUMMER SALE
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
          Up to <span className="text-orange-400">60% off</span>
          <br />
          on all items till <br />
          <span className="text-white">September 11</span>
        </h1>
        <button className="mt-2 px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition">
          Shop now
        </button>
      </div>
    </div>
  );
};

export default Hero;
