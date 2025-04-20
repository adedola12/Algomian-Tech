import React from "react";
import { products } from "../assets/assets";
import { useSearch } from "../context/SearchContext";
import ProductItem from "./ProductItem";

const RecommendedProduct = () => {
  const { filteredProducts } = useSearch();

  // Determine category of the first matching product
  const category =
    filteredProducts.length > 0 ? filteredProducts[0].category : null;

  // Get recommended products based on that category or fallback to random
  let recommended = [];

  if (category) {
    recommended = products.filter(
      (item) => item.category === category && !filteredProducts.includes(item)
    );
  }

  // If no related products, fallback to random
  if (recommended.length === 0) {
    recommended = [...products]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4); // fallback to 4 random
  } else {
    recommended = recommended.slice(0, 4);
  }

  return (
    <div className="my-16 px-4">
      <h2 className="text-lg font-semibold text-orange-600 mb-4">
        Recommended Product
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommended.map((item, idx) => (
          <ProductItem key={idx} {...item} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedProduct;
