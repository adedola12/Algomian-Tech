// src/pages/InvManViewOrder.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";

const InvManViewOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/api/orders/${id}`, {
          withCredentials: true,
        });
        setOrder(data);
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p className="p-4">Loading order...</p>;
  if (!order) return <p className="p-4 text-red-600">Order not found.</p>;

  return (
    <div className="bg-white border rounded-lg p-6 shadow space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
      >
        ← Back
      </button>

      <h2 className="text-xl font-semibold">Order Details</h2>

      <p className="text-sm text-gray-600">
        <strong>Tracking ID:</strong> {order.trackingId}
      </p>
      <p className="text-sm text-gray-600">
        <strong>Status:</strong> {order.status}
      </p>
      <p className="text-sm text-gray-600">
        <strong>Total Value:</strong> NGN {order.totalPrice.toLocaleString()}
      </p>

      <h3 className="text-lg font-medium mt-4">Items Ordered</h3>
      {order.orderItems.map((item, i) => (
        <div key={i} className="border-t pt-4 mt-4">
          <p className="font-medium">
            {item.name} — Qty: {item.qty} — NGN {item.price.toLocaleString()}
          </p>

          {item.soldSpecs?.length > 0 && (
            <div className="mt-2 space-y-1 text-sm">
              <h4 className="font-semibold text-gray-700">Sold Specs:</h4>
              {item.soldSpecs.map((s, j) => (
                <p key={j} className="text-gray-600">
                  SN: {s.serialNumber} | CPU: {s.baseCPU || "—"} | RAM:{" "}
                  {s.baseRam || "—"} | Storage: {s.baseStorage || "—"}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InvManViewOrder;
