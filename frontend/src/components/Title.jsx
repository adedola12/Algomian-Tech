import React from 'react';

const Title = ({ text1, text2 }) => {
  return (
    <h2 className="text-xl sm:text-2xl md:text-[22px] font-semibold text-left text-gray-700">
      <span className="text-purple-700">{text1} </span>
      <span className="text-gray-900">{text2}</span>
    </h2>
  );
};

export default Title;
