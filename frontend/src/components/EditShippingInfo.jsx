// components/EditShippingInfo.js
import React, { useState, useEffect } from "react";

const EditShippingInfo = ({ onContinue, initialData }) => {
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

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onContinue(formData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-md shadow p-6 text-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">
        Edit Shipping Information
      </h2>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 font-medium">WhatsApp Number*</label>
          <input
            name="whatsapp"
            type="text"
            value={formData.whatsapp}
            onChange={handleChange}
            placeholder="Placeholder"
            className="w-full border rounded px-4 py-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name*"
            className="border rounded px-4 py-2"
          />
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className="border rounded px-4 py-2"
          />
        </div>

        <input
          name="state"
          value={formData.state}
          onChange={handleChange}
          placeholder="State/Province*"
          className="w-full border rounded px-4 py-2"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="border rounded px-4 py-2"
          >
            <option>Placeholder</option>
          </select>
          <select
            name="district"
            value={formData.district}
            onChange={handleChange}
            className="border rounded px-4 py-2"
          >
            <option>Placeholder</option>
          </select>
        </div>

        <div>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="State Address*"
            className="w-full border rounded px-4 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            A detailed street address helps our rider locate you quickly
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="areaCode"
            value={formData.areaCode}
            onChange={handleChange}
            placeholder="+234"
            className="border rounded px-4 py-2"
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Call line*"
            className="border rounded px-4 py-2"
          />
        </div>

        <div>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email (optional)"
            className="w-full border rounded px-4 py-2"
          />
        </div>

        <button type="submit" className="w-full bg-[#5A4FCF] text-white py-2 rounded">
          Update & Continue
        </button>
      </form>
    </div>
  );
};

export default EditShippingInfo;
