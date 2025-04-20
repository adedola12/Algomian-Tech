import React from "react";
import { useParams, Link } from "react-router-dom";
import { products } from "../assets/assets";
import ProductItem from "./ProductItem";

const SimilarProduct = () => {
  const { productId } = useParams();
  const currentProduct = products.find((p) => p._id === productId);

  if (!currentProduct) return null;

  const similarProducts = products
    .filter(
      (p) =>
        p._id !== productId &&
        p.category === currentProduct.category &&
        p.subCategory === currentProduct.subCategory
    )
    .slice(0, 8); // Limit to 8 items

  return (
    <div className="mt-14 max-w-[1500px] mx-auto px-4">
      {/* Top Row */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-[15px] sm:text-base font-semibold text-orange-500">Similar Product</h3>
        <Link
          to={`/search?category=${currentProduct.category}&subcategory=${currentProduct.subCategory}`}
          className="text-sm sm:text-[15px] font-medium text-orange-500 hover:underline"
        >
          More Products &rarr;
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-4 gap-y-6">
        {similarProducts.map((product) => (
          <ProductItem
            key={product._id}
            id={product._id}
            image={product.image}
            name={product.name}
            description={product.description}
            price={product.price}
            rating={product.rating}
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarProduct;
