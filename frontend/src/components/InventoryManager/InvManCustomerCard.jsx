import React, { useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiMapPin,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../api";
import EditModal from "../EditModal";
import SalesDelivery from "../Sales/SalesDelivery";

/* ------------------------------------------------------------------ */

export default function InvManCustomerCard({ order, onOrderChange }) {
  /* collapse state for “Customer” card */
  const [custOpen, setCustOpen] = useState(true);

  /* shipping-edit modal state */
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  /* draft shipping data pre-filled from the order */
  const [draft, setDraft] = useState({
    customerName: `${order.user.firstName} ${order.user.lastName}`,
    /* ① phone falls back to user.whatAppNumber when address.phone is missing */
    customerPhone:
      order.shippingAddress.phone || order.user.whatAppNumber || "",
    /* ② keep real POS */
    pointOfSale: order.pointOfSale || "",

    deliveryMethod: "logistics",
    shippingAddress: order.shippingAddress.address,
    parkLocation: "",
    selectedCustomerId: order.user._id,
    summary: { subtotal: 0, tax: 0, total: 0 },
  });

  /* -------------------------------------------------- save PATCH ---- */
  const saveShipping = async () => {
    setSaving(true);
    try {
      await api.patch(
        `/api/orders/${order._id}`,
        {
          pointOfSale: draft.pointOfSale,
          shippingAddress: {
            ...order.shippingAddress,
            address: draft.shippingAddress,
            phone: draft.customerPhone,
          },
        },
        { withCredentials: true }
      );

      toast.success("Shipping information updated");
      setEditOpen(false);
      onOrderChange(); // refresh parent
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------- render -------- */
  return (
    <>
      <div className="space-y-6">
        {/* ========= CUSTOMER CARD ========= */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <button
            onClick={() => setCustOpen((o) => !o)}
            className="w-full flex items-center justify-between px-6 py-4"
          >
            <h3 className="text-lg font-medium">Customer</h3>
            {custOpen ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {custOpen && (
            <div className="px-6 pb-6 space-y-3 border-t">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p>
                  {order.user.firstName} {order.user.lastName}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p>{order.user.email}</p>
              </div>

              {order.shippingAddress.phone && (
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p>{order.shippingAddress.phone}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========= SHIPPING CARD ========= */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4">
            <h3 className="text-lg font-medium">Shipping Information</h3>

            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center text-orange-500 hover:text-orange-600"
            >
              <FiEdit2 className="mr-1" /> Edit
            </button>
          </div>

          <div className="px-6 pb-6 space-y-3 border-t">
            <div className="flex items-center">
              <FiMapPin className="mr-2" />
              {order.shippingAddress.address}, {order.shippingAddress.city}
            </div>

            <div className="flex items-center">
              <FiMail className="mr-2" /> {order.user.email}
            </div>

            <div className="flex items-center">
              <FiPhone className="mr-2" />
              {order.shippingAddress.phone || order.user.whatAppNumber || "—"}
            </div>

            {order.shippingAddress.phone && (
              <div className="flex items-center">
                <FiPhone className="mr-2" /> {order.shippingAddress.phone}
              </div>
            )}
          </div>
        </div>

        {/* ========= TRACKING CARD ========= */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium">Order Tracking</h3>
          </div>

          <div className="px-6 pb-6 space-y-4 border-t">
            {[
              { label: "Received", time: order.createdAt, done: true },
              {
                label: "Processing",
                time: order.updatedAt,
                done: order.status !== "Pending",
              },
              {
                label: "Shipped",
                time: order.deliveredAt,
                done: order.status === "Delivered",
              },
              {
                label: "Delivered",
                time: order.deliveredAt,
                done: order.status === "Delivered",
              },
            ].map((step, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div
                  className={`mt-1 h-3 w-3 rounded-full ${
                    step.done ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <div>
                  <p className={step.done ? "text-gray-900" : "text-gray-500"}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400">
                    {step.time && new Date(step.time).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======== EDIT-SHIPPING MODAL ======== */}
      {editOpen && (
        <EditModal
          title="Edit shipping details"
          onClose={() => setEditOpen(false)}
          onSave={saveShipping}
          busy={saving}
        >
          <SalesDelivery
            items={order.orderItems.map((i) => ({
              id: i.product,
              name: i.name,
              image: i.image,
              price: i.price,
              qty: i.qty,
            }))}
            hideNav={true}
            customerName={draft.customerName}
            customerPhone={draft.customerPhone}
            pointOfSale={draft.pointOfSale}
            deliveryMethod={draft.deliveryMethod}
            shippingAddress={draft.shippingAddress}
            parkLocation={draft.parkLocation}
            selectedCustomerId={draft.selectedCustomerId}
            onBack={() => setEditOpen(false)}
            onNext={(d) => {
              setDraft({ ...draft, ...d });
              saveShipping();
            }}
          />
        </EditModal>
      )}
    </>
  );
}
