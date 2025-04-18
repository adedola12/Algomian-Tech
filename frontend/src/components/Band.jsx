import React from 'react';
import { FaTruck, FaLock, FaPhoneAlt } from 'react-icons/fa';

const Band = () => {
  return (
    <div className="max-w-[1500px] mx-auto my-10 px-4">
      <div className="bg-[#5A4FCF] text-white rounded-md py-6 px-6 flex flex-col sm:flex-row justify-center items-center gap-6 lg:gap-30 xl:gap-40">
        {/* Item 1 */}
        <div className="flex items-center gap-4 text-center sm:text-left max-w-xs">
          <FaTruck className="text-3xl" />
          <div>
            <p className="uppercase font-semibold text-sm">Nationwide Delivery</p>
            <p className="text-xs">Delivery within 24 - 48 hours</p>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex items-center gap-4 text-center sm:text-left max-w-xs">
          <FaLock className="text-3xl" />
          <div>
            <p className="font-semibold text-sm">Secure Payments</p>
            <p className="text-xs">Secured by Stripe</p>
          </div>
        </div>

        {/* Item 3 */}
        <div className="flex items-center gap-4 text-center sm:text-left max-w-xs">
          <FaPhoneAlt className="text-3xl" />
          <div>
            <p className="font-semibold text-sm">24/7 Support</p>
            <p className="text-xs">Phone and message support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Band;
