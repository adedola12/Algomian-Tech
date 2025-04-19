import React, { createContext, useContext, useState } from "react";
import { products as allProducts } from "../assets/assets";

const SearchContext = createContext();
export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    brand: [],
    processor: [],
    ram: [],
    storage: [],
    rating: [],
    graphics: [],
    price: 1000000, // default high
    query: "",
  });

  const filteredProducts = allProducts.filter((product) => {
    const {
      brand,
      processor,
      ram,
      storage,
      rating,
      graphics,
      price,
      query,
    } = filters;

    return (
      (brand.length === 0 || brand.includes(product.brand)) &&
      (processor.length === 0 || processor.includes(product.processor)) &&
      (ram.length === 0 || ram.includes(product.ram)) &&
      (storage.length === 0 || storage.includes(product.storage)) &&
      (rating.length === 0 || rating.includes(product.rating)) &&
      (graphics.length === 0 || graphics.includes(product.graphicsCard)) &&
      product.price <= price &&
      product.name.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <SearchContext.Provider value={{ filters, setFilters, filteredProducts }}>
      {children}
    </SearchContext.Provider>
  );
};
