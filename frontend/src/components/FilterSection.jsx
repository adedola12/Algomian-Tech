import React, { useState } from 'react'

const FilterSection = ({title, children}) => {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div className="border-b pb-4 mb-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-left font-semibold text-sm text-gray-700 mb-2 flex justify-between items-center"
          >
            {title}
            <span>{isOpen ? "−" : "+"}</span>
          </button>
          {isOpen && <div className="space-y-2">{children}</div>}
        </div>
      );
}

export default FilterSection