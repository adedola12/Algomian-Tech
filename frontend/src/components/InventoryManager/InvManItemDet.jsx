import React, { useState, useEffect } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function InvManItemDet({ order, onOrderChange }) {
  const [busy, setBusy] = useState(false);
  const [specs, setSpecs] = useState({});
  const [selectedSerials, setSelectedSerials] = useState({});
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        const result = {};
        await Promise.all(
          order.orderItems.map(async (item) => {
            const { data } = await api.get(
              `/api/products/${item.product}/base-specs`,
              { withCredentials: true }
            );
            result[item.product] = data;
          })
        );
        setSpecs(result);
      } catch (err) {
        toast.error("Failed to load product specs");
      }
    };
    fetchSpecs();
  }, [order]);

  const toggleSerial = (productId, serial) => {
    const current = selectedSerials[productId] || [];
    const index = current.indexOf(serial);
    const max = order.orderItems.find((i) => i.product === productId)?.qty || 1;

    if (index > -1) {
      setSelectedSerials({
        ...selectedSerials,
        [productId]: current.filter((s) => s !== serial),
      });
    } else {
      if (current.length >= max) {
        toast.warn(`Cannot select more than ${max} items for this product.`);
        return;
      }
      setSelectedSerials({
        ...selectedSerials,
        [productId]: [...current, serial],
      });
    }
  };

  const handleSubmit = async () => {
    for (const item of order.orderItems) {
      const selected = selectedSerials[item.product] || [];
      if (selected.length !== item.qty) {
        toast.error(`Please select exactly ${item.qty} items for ${item.name}`);
        return;
      }
    }

    setBusy(true);
    try {
      const payload = Object.entries(selectedSerials).map(
        ([productId, selectedSerials]) => ({ productId, selectedSerials })
      );

      await api.patch(
        `/api/orders/${order._id}/verify-inventory`,
        { items: payload },
        {
          withCredentials: true,
        }
      );

      await api.put(
        `/api/orders/${order._id}/status`,
        { status: "Shipped" },
        { withCredentials: true }
      );

      setSelectedSerials({});

      toast.success("Inventory verified. Order marked as Shipped.");
      onOrderChange();

      navigate("/inventoryManager");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6 shadow space-y-6">
      <h2 className="text-xl font-semibold">Inventory Assignment</h2>

      {order.orderItems.map((item) => (
        <div key={item.product} className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="font-medium">
              {item.name} — Qty: {item.qty}
            </p>
            <p className="text-sm text-gray-500">
              Selected: {(selectedSerials[item.product] || []).length}/
              {item.qty}
            </p>
          </div>

          <input
            type="text"
            placeholder="Search by SN, CPU, RAM, Storage"
            value={filters[item.product] || ""}
            onChange={(e) =>
              setFilters({ ...filters, [item.product]: e.target.value })
            }
            className="w-full p-2 border rounded"
          />

          <div className="space-y-2">
            {(specs[item.product] || [])
              .filter((spec) => {
                const query = (filters[item.product] || "").toLowerCase();
                return (
                  spec.serialNumber?.toLowerCase().includes(query) ||
                  spec.baseCPU?.toLowerCase().includes(query) ||
                  spec.baseRam?.toLowerCase().includes(query) ||
                  spec.baseStorage?.toLowerCase().includes(query)
                );
              })
              .map((spec, idx) => (
                <label
                  key={idx}
                  className={`flex items-center space-x-2 text-sm px-2 py-1 rounded transition ${
                    spec.assigned
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "hover:bg-orange-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="form-checkbox text-orange-600"
                    checked={(selectedSerials[item.product] || []).includes(
                      spec.serialNumber
                    )} 
                    onChange={() =>
                      toggleSerial(item.product, spec.serialNumber)
                    }
                    disabled={spec.assigned}
                  />
                  <span>
                    SN: {spec.serialNumber} | CPU: {spec.baseCPU || "—"} | RAM:{" "}
                    {spec.baseRam || "—"} | Storage: {spec.baseStorage || "—"}
                  </span>
                </label>
              ))}
          </div>
        </div>
      ))}

      <div className="pt-4 text-right">
        <button
          onClick={handleSubmit}
          disabled={busy}
          className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
        >
          {busy ? "Processing…" : "Submit & Mark as Shipped"}
        </button>
      </div>
    </div>
  );
}
