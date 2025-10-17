// src/components/CustomerCard.jsx
import React from "react";
import { FiChevronDown } from "react-icons/fi";

function toStringSafe(val, fallback = "—") {
  if (val == null) return fallback;
  if (typeof val === "string") return val || fallback;
  if (Array.isArray(val))
    return val.map((v) => String(v ?? "")).join(", ") || fallback;
  try {
    // Handles objects (e.g. { firstName, lastName }) gracefully
    if (typeof val === "object") {
      const s =
        [val.firstName, val.lastName].filter(Boolean).join(" ").trim() ||
        val.name ||
        val.fullName;
      if (s) return String(s);
    }
  } catch {}
  const s = String(val);
  return s.trim() || fallback;
}

export default function CustomerCard({
  title = "Customers",
  name = "Ire David",
  phone = "(+234) 809 205 4532",
  email = "Olu4oye@gmail.com",
}) {
  const safeTitle = toStringSafe(title, "Customers");
  const safeName = toStringSafe(name);
  const safePhone = toStringSafe(phone);
  const safeEmail = toStringSafe(email);

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-xs">
      {/* Header with dropdown icon */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-800">{safeTitle}</h3>
        <FiChevronDown className="text-gray-500" />
      </div>

      {/* Details list */}
      <dl className="space-y-2 text-sm text-gray-700">
        <div>
          <dt className="font-medium">Recipient name</dt>
          <dd>{safeName}</dd>
        </div>
        <div>
          <dt className="font-medium">Phone number</dt>
          <dd>{safePhone}</dd>
        </div>
        <div>
          <dt className="font-medium">Email</dt>
          <dd>{safeEmail}</dd>
        </div>
      </dl>
    </div>
  );
}
