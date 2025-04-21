// components/ShippingInfo.js
import React, { useState } from "react";

const ShippingInfo = ({ onContinue }) => {
  const [formData, setFormData] = useState({
    whatsapp: "",
    firstName: "",
    lastName: "",
    state: "",
    city: "",
    district: "",
    address: "",
    areaCode: "+234",
    phone: "",
    email: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onContinue(formData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-md shadow p-6 text-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">
        Shipping Information
      </h2>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 font-medium">WhatsApp Number*</label>
          <input
            name="whatsapp"
            type="text"
            placeholder="Placeholder"
            onChange={handleChange}
            className="w-full border rounded px-4 py-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input name="firstName" placeholder="First Name*" onChange={handleChange} className="border rounded px-4 py-2" />
          <input name="lastName" placeholder="Last Name" onChange={handleChange} className="border rounded px-4 py-2" />
        </div>

        <input name="state" placeholder="State/Province*" onChange={handleChange} className="w-full border rounded px-4 py-2" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select name="city" onChange={handleChange} className="border rounded px-4 py-2">
            <option>Placeholder</option>
          </select>
          <select name="district" onChange={handleChange} className="border rounded px-4 py-2">
            <option>Placeholder</option>
          </select>
        </div>

        <div>
          <input name="address" placeholder="State Address*" onChange={handleChange} className="w-full border rounded px-4 py-2" />
          <p className="text-xs text-gray-500 mt-1">
            A detailed street address helps our rider locate you quickly
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input name="areaCode" value="+234" onChange={handleChange} className="border rounded px-4 py-2" />
          <input name="phone" placeholder="Call line*" onChange={handleChange} className="border rounded px-4 py-2" />
        </div>

        <div>
          <input name="email" placeholder="Email (optional)" onChange={handleChange} className="w-full border rounded px-4 py-2" />
        </div>

        <button type="submit" className="w-full bg-[#5A4FCF] text-white py-2 rounded">
          Continue
        </button>
      </form>
    </div>
  );
};

export default ShippingInfo;
