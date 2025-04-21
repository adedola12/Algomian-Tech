// components/DeliveryInfo.js
import React from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaPen } from "react-icons/fa";

const DeliveryInfo = ({
  deliveries = [],
  onEdit,
  onDelete,
  onAddNew,
  onNext,
  readOnly = false,
  selectedIndex,
  onSelect,
}) => {
  return (
    <div className="w-full bg-white rounded-lg border shadow-sm p-4 text-sm flex flex-col justify-between min-h-[400px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Delivery Information</h3>
        {!readOnly && (
          <button
            className="bg-[#5A4FCF] text-white text-xs px-4 py-2 rounded hover:bg-[#483dc2] transition"
            onClick={onAddNew}
          >
            Add new shipping details
          </button>
        )}
      </div>

      {/* Delivery Entries */}
      <div className="space-y-4 flex-1">
        {deliveries.map((item, index) => (
          <div
            key={index}
            className={`relative bg-[#f3f2fc] p-4 rounded text-gray-700 space-y-2 border cursor-pointer ${
              selectedIndex === index ? "border-[#5A4FCF]" : "border-transparent"
            }`}
            onClick={() => onSelect?.(index)}
          >
            {readOnly && (
              <button
                className="absolute right-4 top-4 text-[#5A4FCF] flex items-center gap-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(index);
                }}
              >
                <FaPen className="text-[13px]" />
                Edit
              </button>
            )}

            <p className="font-medium text-gray-800">
              {item.firstName} {item.lastName}
            </p>

            <div className="flex items-start gap-2">
              <FaMapMarkerAlt className="mt-1 text-[13px]" />
              <p className="text-sm leading-tight">{item.address}</p>
            </div>

            <div className="flex items-center gap-2">
              <FaPhoneAlt className="text-[13px]" />
              <p className="text-sm">{item.phone}</p>
            </div>

            <div className="flex items-center gap-2">
              <FaEnvelope className="text-[13px]" />
              <p className="text-sm">{item.email}</p>
            </div>

            {!readOnly && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(index);
                  }}
                  className="text-xs text-blue-600 font-medium hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(index);
                  }}
                  className="text-xs text-red-500 font-medium hover:underline"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* NEXT Button */}
      {!readOnly && (
        <div className="pt-6 text-right">
          <button
            onClick={onNext}
            className="bg-[#5A4FCF] text-white px-6 py-2 rounded hover:bg-[#483dc2] transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryInfo;
