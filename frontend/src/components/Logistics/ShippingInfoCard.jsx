/*  src/components/Logistics/ShippingInfoCard.jsx  */
import React, { useState } from "react";
import { FiEdit2, FiCheck, FiMapPin, FiPhone, FiMail } from "react-icons/fi";

/**
 * @param {string}  address   defaults from Order.shippingAddress
 * @param {string}  phone     defaults from Order or User
 * @param {string}  email     defaults from User
 * @param {boolean} readonly  disables editing (e.g. “View Shipment”)
 * @param {function(addr,phone,email):Promise<void>} onSave  async cb
 */
export default function ShippingInfoCard({
  address = "",
  phone = "",
  email = "",
  readonly = false,
  onSave = async () => {},
}) {
  const [edit, setEdit] = useState(false);
  const [addr, setAddr] = useState(address);
  const [mobile, setMob] = useState(phone);
  const [mail, setMail] = useState(email);
  const [busy, setBusy] = useState(false);

  const cancel = () => {
    setAddr(address);
    setMob(phone);
    setMail(email);
    setEdit(false);
  };

  const save = async () => {
    setBusy(true);
    await onSave(addr, mobile, mail);
    setBusy(false);
    setEdit(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-sm">
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-800">
          Shipping Information
        </h3>

        {!readonly &&
          (edit ? (
            <button
              type="button"
              disabled={busy}
              onClick={save}
              className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 disabled:opacity-50"
            >
              <FiCheck className="mr-1" />
              Save
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEdit(true)}
              className="flex items-center text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              <FiEdit2 className="mr-1" />
              Edit
            </button>
          ))}
      </div>

      {/* form / display */}
      {edit ? (
        <form className="space-y-3">
          <label className="block text-xs font-medium text-gray-600">
            Address
            <input
              type="text"
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
            />
          </label>

          <label className="block text-xs font-medium text-gray-600">
            Phone
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMob(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
            />
          </label>

          <label className="block text-xs font-medium text-gray-600">
            Email
            <input
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
            />
          </label>

          <button
            type="button"
            onClick={cancel}
            className="text-xs text-gray-500 hover:underline"
          >
            cancel
          </button>
        </form>
      ) : (
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex items-start space-x-2">
            <FiMapPin className="mt-1 text-gray-500" />
            <span>{address || "—"}</span>
          </li>
          <li className="flex items-center space-x-2">
            <FiPhone className="text-gray-500" />
            <span>{phone || "—"}</span>
          </li>
          <li className="flex items-center space-x-2">
            <FiMail className="text-gray-500" />
            <span>{email || "—"}</span>
          </li>
        </ul>
      )}
    </div>
  );
}
