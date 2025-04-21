import React from 'react';

const ContactInfo = () => {
  return (
    <div className="w-full border-t bg-white text-sm text-gray-700 py-8 px-4 lg:px-20">
      <h3 className="font-semibold text-gray-800 mb-3">Contact Information</h3>
      <p className="mb-2 text-sm text-gray-700">
        For any assistance or inquiries, feel free to reach out:
      </p>
      <p className="mb-1">
        <span className="font-semibold">Email:</span> ask@schoolinka.com
      </p>
      <p className="mb-1">
        <span className="font-semibold">WhatsApp:</span> +2349066040167
      </p>
      <p className="mb-1">
        <span className="font-semibold">Office Hours:</span> Monday to Friday, 9:00 AM to 5:00 PM (GMT)
      </p>
      <p className="mt-4 text-sm text-gray-600">
        Our dedicated support team is here to help you every step of the way.
      </p>
    </div>
  );
};

export default ContactInfo;
