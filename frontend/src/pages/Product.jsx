import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { products } from "../assets/assets";
import ProductDetails from "../components/ProductDetails";
import ProductSpecification from "../components/ProductSpecification";
import Testimony from "../components/Testimony";
import RecommendedProduct from "../components/RecommendedProduct";
import Footer from "../components/Footer";
import SimilarProduct from "../components/SimilarProduct";

const Product = () => {
  const { productId } = useParams();
  const product = products.find((p) => p._id === productId);

  const [selectedSpecs, setSelectedSpecs] = useState({
    ram: "",
    storage: "",
    processor: ""
  })

  if (!product) {
    return <div className="text-center mt-10 text-red-500">Product not found!</div>;
  }

  return (
    <div className="max-w-[1500px] mx-auto px-4 py-10">
      <ProductDetails product={product} selectedSpecs={selectedSpecs} setSelectedSpecs={setSelectedSpecs}  />
      <ProductSpecification product={product} selectedSpecs={selectedSpecs} />
      <Testimony/>
      <SimilarProduct />
      <Footer />
    </div>
  );
};

export default Product;
