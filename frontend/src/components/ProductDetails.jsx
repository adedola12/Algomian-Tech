import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaPlus, FaMinus } from "react-icons/fa";
import { ShopContext } from "../context/ShopContext";

const ProductDetails = ({ product, selectedSpecs, setSelectedSpecs }) => {
  const [selectedImage, setSelectedImage] = useState(product?.image[0] || "");
  const [quantity, setQuantity] = useState(1);
  const unitsRemaining = Math.max(0, product.unitsLeft - quantity);
  const { addToCart } = useContext(ShopContext);

  const isLaptop = product.category === "PC" && product.subCategory === "Laptops";

  const handleAddToCart = () => {
    if (isLaptop && (!selectedSpecs.ram || !selectedSpecs.storage || !selectedSpecs.processor)) {
      alert("Please select RAM, Storage, and Processor before adding to cart.");
      return;
    }

    const productToAdd = {
      ...product,
      quantity,
      selectedSpecs: isLaptop ? selectedSpecs : null,
    };

    addToCart(productToAdd);
  };

  return (
    <div className="mb-10">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-600 mb-4">
        <Link to={`/search?category=${product.category}`} className="text-orange-500 hover:underline font-semibold">
          {product.category}
        </Link>
        {" / "}
        <Link to={`/search?subcategory=${product.subCategory}`} className="text-orange-500 hover:underline font-semibold">
          {product.subCategory}
        </Link>
        {" / "}
        <span className="text-gray-800">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT: Images */}
        <div>
          <img src={selectedImage} alt={product.name} className="w-full h-auto rounded shadow" />
          <div className="flex gap-3 mt-4 overflow-x-auto">
            {product.image.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`thumb-${idx}`}
                className={`w-20 h-20 object-cover rounded cursor-pointer border ${
                  selectedImage === img ? "border-orange-500" : "border-gray-300"
                }`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: Product Info */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 text-sm mb-3">{product.description}</p>

          {/* Rating */}
          <div className="flex items-center flex-wrap gap-2 mb-4">
            <div className="flex text-orange-500 text-sm">
              {[...Array(product.rating)].map((_, idx) => (
                <FaStar key={idx} className="mr-1" />
              ))}
            </div>
            <span className="text-xs text-gray-500">(1221)</span>
            <span className="text-green-600 text-sm ml-2">
              Available - {product.unitsLeft} Units
            </span>
          </div>

          {/* Specs (only for laptops) */}
          {isLaptop && (
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium">Choose RAM</label>
                <select
                  value={selectedSpecs.ram}
                  onChange={(e) => setSelectedSpecs(prev => ({ ...prev, ram: e.target.value }))}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {["8gb ram", "16gb ram", "32gb ram"].map(ram => (
                    <option key={ram}>{ram}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Choose Storage</label>
                <select
                  value={selectedSpecs.storage}
                  onChange={(e) => setSelectedSpecs(prev => ({ ...prev, storage: e.target.value }))}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {["128gb", "256gb", "512gb", "1tb"].map(storage => (
                    <option key={storage}>{storage}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Choose Processor</label>
                <select
                  value={selectedSpecs.processor}
                  onChange={(e) => setSelectedSpecs(prev => ({ ...prev, processor: e.target.value }))}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {["Core i3", "Core i5", "Core i7"].map(proc => (
                    <option key={proc}>{proc}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Price */}
          <p className="text-2xl font-semibold mb-3">₦{product.price.toLocaleString()}</p>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 border px-3 rounded">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-sm p-1">
                <FaMinus />
              </button>
              <span className="px-2">{quantity}</span>
              <button onClick={() => setQuantity(q => q < product.unitsLeft ? q + 1 : q)} className="text-sm p-1">
                <FaPlus />
              </button>
            </div>
            <span className="text-sm text-red-600">
              Only <strong>{unitsRemaining}</strong> item(s) left!
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600">
              Buy Now
            </button>
            <button
              onClick={handleAddToCart}
              className="border border-gray-400 px-6 py-2 rounded hover:bg-gray-200"
            >
              Add to Cart
            </button>
          </div>

          {/* Delivery Info */}
          <div className="border rounded p-4 text-sm text-gray-700">
            <h4 className="font-medium mb-2">🚚 Delivery / Shipping Timeline</h4>
            <p>Within Lagos: <strong>24hrs</strong></p>
            <p>Outside Lagos: <strong>24 – 48hrs</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
