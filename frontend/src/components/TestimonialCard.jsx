import React from 'react';
import { FaStar } from 'react-icons/fa';

const TestimonialCard = ({ image, name, date, rating, testimony }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 w-[250px] flex-shrink-0">
      {/* Top - Image + Name */}
      <div className="flex items-center gap-3 mb-3">
        <img src={image} alt={name} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <h4 className="font-semibold text-sm">{name}</h4>
          <p className="text-gray-500 text-xs">{date}</p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-2 text-orange-500 text-sm">
        {Array.from({ length: rating }).map((_, i) => (
          <FaStar key={i} />
        ))}
      </div>

      {/* Testimony */}
      <p className="text-xs text-gray-600">{testimony}</p>
    </div>
  );
};

export default TestimonialCard;
