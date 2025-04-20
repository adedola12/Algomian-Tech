import React, { useContext } from "react";
import Footer from "../components/Footer";
import ShoppingCart from "../components/ShoppingCart";
import OrderSummary from "../components/OrderSummary";
import EmptyCart from "../components/EmptyCart";
import { ShopContext } from "../context/ShopContext";

const Cart = () => {
  const { cartItems } = useContext(ShopContext);

  const hasItems = cartItems && cartItems.length > 0;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fafafa]">
      <div className="w-full max-w-[1440px] mx-auto px-4 py-10">
        {hasItems ? (
          // When cart has items
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left: Shopping Cart */}
            <div className="flex-1 w-full">
              <ShoppingCart />
            </div>

            {/* Right: Order Summary */}
            <div className="w-full lg:w-[320px]">
              <OrderSummary />
            </div>
          </div>
        ) : (
          // When cart is empty
          <EmptyCart />
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Cart;
