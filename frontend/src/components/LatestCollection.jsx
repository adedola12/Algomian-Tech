import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProduct] = useState([]);

  useEffect(() => {
    setLatestProduct(products.slice(0, 10));
  }, []);

  return (
    <div className="my-10 max-w-[1500px] mx-auto px-4">
      {/* Top Section */}
      <div className="flex items-center justify-between mb-6">
        <Title text1="New" text2="Arrivals" />
        <Link
          to="/collection"
          className="text-sm sm:text-base text-orange-500 hover:underline flex items-center gap-1 font-medium"
        >
          More Products <FaArrowRight className="text-[10px] mt-[1px]" />
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {latestProducts.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            image={item.image}
            name={item.name}
            description={item.description}
            rating={item.rating}
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;
