import React from "react";
import FilterSection from "./FilterSection";
import {
  productBrands,
  processorType,
  ramSize,
  storageSize,
  rating,
  graphicsCard,
} from "../assets/assets";
import { useSearch } from "../context/SearchContext"; // Make sure this path is correct

const Filters = () => {
  const { filters, setFilters } = useSearch();

  const handleToggle = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const handleRange = (e) => {
    setFilters((prev) => ({ ...prev, price: parseInt(e.target.value) }));
  };

  return (
    <div className="hidden lg:block w-full max-w-[250px] border-r pr-4 sticky top-0 h-full overflow-y-auto">
      <h3 className="text-sm font-bold mb-4">Filters:</h3>

      <FilterSection title="Brand">
        {productBrands.map((brand, index) => (
          <label key={index} className="block text-sm text-gray-700">
            <input
              type="checkbox"
              checked={filters.brand?.includes(brand)}
              onChange={() => handleToggle("brand", brand)}
              className="mr-2"
            />
            {brand}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Price Range">
        <input
          type="range"
          min="0"
          max="1000000"
          value={filters.price}
          onChange={handleRange}
          className="w-full bg-orange-500"
        />
        <div className="flex justify-between text-xs text-orange-600">
          <span>₦0</span>
          <span>₦{filters.price.toLocaleString()}</span>
        </div>
      </FilterSection>

      <FilterSection title="Processor Type">
        {processorType.map((item, index) => (
          <label key={index} className="block text-sm text-gray-700">
            <input
              type="checkbox"
              checked={filters.processor?.includes(item)}
              onChange={() => handleToggle("processor", item)}
              className="mr-2"
            />
            {item}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Ram">
        {ramSize.map((item, index) => (
          <label key={index} className="block text-sm text-gray-700">
            <input
              type="checkbox"
              checked={filters.ram.includes(item)}
              onChange={() => handleToggle("ram", item)}
              className="mr-2"
            />
            {item}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Storage Size">
        {storageSize.map((item, index) => (
          <label key={index} className="block text-sm text-gray-700">
            <input
              type="checkbox"
              checked={filters.storage?.includes(item)}
              onChange={() => handleToggle("storage", item)}
              className="mr-2"
            />
            {item}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Ratings">
        {rating.map((item, index) => (
          <label key={index} className="block text-sm text-gray-700">
            <input
              type="checkbox"
              checked={filters.rating?.includes(item.value)}
              onChange={() => handleToggle("rating", item.value)}
              className="mr-2"
            />
            {"★".repeat(item.value)} & up
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Graphics Card">
        {graphicsCard.map((item, index) => (
          <label key={index} className="block text-sm text-gray-700">
            <input
              type="checkbox"
              checked={filters.graphics?.includes(item)}
              onChange={() => handleToggle("graphics", item)}
              className="mr-2"
            />
            {item}
          </label>
        ))}
      </FilterSection>
    </div>
  );
};

export default Filters;
