import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price }) => {
    const { currency } = useContext(ShopContext);
  
    const imageSrc = typeof image?.[0] === "string" ? image[0] : image?.[0]?.default || image?.[0];
  
    return (
      <Link className="text-gray-700 cursor-pointer" to={`/product/${id}`}>
        <div className="overflow-hidden">
          <img
            src={imageSrc || "/fallback.png"}
            alt={name}
            className="hover:scale-110 transition ease-in-out w-full object-cover"
          />
        </div>
        <p className="pt-3 pb-1 text-sm">{name}</p>
        <p className="text-sm font-medium">
          {currency} {price}
        </p>
      </Link>
    );
  };
  

export default ProductItem;
