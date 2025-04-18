import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    const bestProduct = products.filter((item) => item.bestseller);
    setBestSeller(bestProduct.slice(0, 4));
  }, []);

  return (
    <div className="my-10">
      <div className="flex items-center justify-between mb-6">
        <Title text1="Best" text2="Sellers" />
        <Link
          to="/collection"
          className="text-sm sm:text-base text-orange-500 hover:underline flex items-center gap-1 font-medium"
        >
          More Products <FaArrowRight className="text-[10px] mt-[1px]" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {bestSeller.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            name={item.name}
            image={item.image}
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
};

export default BestSeller;
