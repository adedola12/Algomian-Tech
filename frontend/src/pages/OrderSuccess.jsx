import React from 'react';
import OrderInfo from '../components/OrderInfo';
import ContactInfo from '../components/ContactInfo';
import Footer from '../components/Footer';

const OrderSuccess = () => {
  return (
    <div className="bg-white">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <OrderInfo />
        {/* Tighten spacing between order info and contact info */}
        <div className="mt-4 sm:mt-2 pt-0 border-t">
          <ContactInfo />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
