/*  src/components/OrderItemDet.jsx  */
import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiChevronDown, FiChevronUp } from "react-icons/fi";
import api from "../api";
import { toast } from "react-toastify";

import EditModal from "./EditModal";
import SalesInfoInput from "./Sales/SalesInfoInput"; // ← already exists

export default function OrderItemDet({ order, onOrderChange }) {
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(false); // ← modal flag
  const [items, setItems] = useState(
    order.orderItems.map((it) => ({
      id: it.product,
      image: it.image,
      name: it.name,
      baseRam: it.baseRam ?? "", // ⬅ keep specs if they exist
      baseStorage: it.baseStorage ?? "",
      baseCPU: it.baseCPU ?? "",
      price: it.price,
      qty: it.qty,
      maxQty: it.maxQty ?? 1000,
      expanded: false,
    }))
  );

  /* ─── advance workflow (status only) ─── */
  const NEXT = {
    Pending: "Processing",
    Processing: "Shipped",
    Shipped: "Delivered",
  };
  const nextStatus = NEXT[order.status];

  const markNext = async () => {
    if (!nextStatus) return;
    setBusy(true);
    try {
      await api.put(
        `/api/orders/${order._id}/status`,
        { status: nextStatus },
        { withCredentials: true }
      );
      toast.success(`Order marked “${nextStatus}”`);
      onOrderChange();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  /* ─── save items edit ─── */
  const saveItems = async () => {
    setBusy(true);
    try {
      await api.patch(
        `/api/orders/${order._id}`,
        {
          orderItems: items.map((it) => ({
                product:      it.id,
                name:         it.name,
                image:        it.image,
                maxQty:       it.maxQty,
            
                qty:          it.qty,
                price:        it.price,
            
                baseRam:      it.baseRam,
                baseStorage:  it.baseStorage,
                baseCPU:      it.baseCPU,
              })),
        },
        { withCredentials: true }
      );
      toast.success("Items updated");
      setEdit(false);
      onOrderChange();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  /* ─── derived money figures ─── */
  const discount = 0;
  const shipping = order.shippingPrice;
  const tax = order.taxPrice;
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const total = subtotal + shipping + tax - discount;

  return (
    <>
      {/* main card */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        {/* header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Order Item – {items.length}</h2>
          <button
            onClick={() => setEdit(true)}
            className="flex items-center text-orange-500 hover:text-orange-600"
          >
            <FiEdit2 className="mr-1" /> Edit
          </button>
        </div>

        {/* list */}
        <div className="divide-y divide-gray-200">
          {items.map((i, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-start sm:items-center px-6 py-4"
            >
              <img
                src={i.image}
                alt={i.name}
                className="w-16 h-16 rounded object-cover flex-shrink-0"
              />
              <div className="mt-3 sm:mt-0 sm:ml-4 flex-1">
                <p className="font-medium">{i.name}</p>
                <p className="text-xs text-gray-500">ID: {i.id}</p>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center space-x-4">
                <div className="px-3 py-1 border rounded text-sm">
                  {i.qty} × ₦{i.price.toLocaleString()}
                </div>
                <div className="font-medium">
                  ₦{(i.qty * i.price).toLocaleString()}
                </div>
                <FiTrash2 className="text-gray-300" />
              </div>
            </div>
          ))}
        </div>

        {/* summary accordion */}
        <div className="px-6 py-4 border-t">
          <button
            onClick={() => setOpen((o) => !o)}
            className="w-full flex justify-between items-center"
          >
            <span className="font-medium">Order Summary</span>
            {open ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {open && (
            <div className="mt-4 space-y-3">
              {[
                ["Subtotal", subtotal],
                ["Discount", discount],
                ["Tax", tax],
                ["Shipping", shipping],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-gray-600">
                  <span>{label}</span>
                  <span className="text-gray-900">₦{val.toLocaleString()}</span>
                </div>
              ))}

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>

              {nextStatus && (
                <div className="mt-6 text-right">
                  <button
                    onClick={markNext}
                    disabled={busy}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded disabled:opacity-50"
                  >
                    {busy ? "…" : `Mark as ${nextStatus}`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---------- Edit Items MODAL ---------- */}
      {edit && (
        <EditModal
          title="Edit order items"
          onClose={() => setEdit(false)}
          onSave={saveItems}
          busy={busy}
        >
          <SalesInfoInput
            items={items}
            setItems={setItems}
            hideNav={true} /* hide Go-back / Next */
            initialTaxPercent={
              order.itemsPrice
                ? Math.round((order.taxPrice / order.itemsPrice) * 100)
                : 0
            }
          />
        </EditModal>
      )}
    </>
  );
}
