import React from 'react';
import OrderInfo from '../components/OrderInfo';
import ContactInfo from '../components/ContactInfo';
import Footer from '../components/Footer';

const OrderSuccess = () => {
  return (
    <div className="bg-white">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <OrderInfo />
        <div className="mt-1 pt-1">
          <ContactInfo />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
