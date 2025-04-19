import React, { useState } from "react";
import TestimonialCard from "./TestimonialCard";
// import { testimonials } from '../data/testimonials';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { testimonials } from "../assets/assets";

const Testimony = () => {
  const [startIndex, setStartIndex] = useState(0);

  const perView =
    window.innerWidth >= 1024 ? 5 : window.innerWidth >= 640 ? 5 : 2;
  const visibleTestimonials = testimonials.slice(
    startIndex,
    startIndex + perView
  );

  const handleNext = () => {
    if (startIndex + perView < testimonials.length) {
      setStartIndex(startIndex + perView);
    }
  };

  const handlePrev = () => {
    if (startIndex - perView >= 0) {
      setStartIndex(startIndex - perView);
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto px-4 my-16">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-[#5A4FCF] font-medium">Testimonials</p>
          <h2 className="text-2xl font-bold text-[#222]">
            What our customers are saying
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500"
          >
            <FaArrowLeft />
          </button>
          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white"
          >
            <FaArrowRight />
          </button>
        </div>
      </div>

      {/* Testimonial Cards */}
      <div className="overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth snap-x">
        <div className="flex gap-4 transition-all duration-300 ease-in-out">
          {visibleTestimonials.map((item, idx) => (
            <TestimonialCard key={idx} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimony;
