/* ──────────────────────────────────────────────────────────────────
   4. src/components/Logistics/CreateShipment.jsx
   ────────────────────────────────────────────────────────────────── */
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { toast } from "react-toastify";

import api from "../../api";
import OrderCard from "./OrderCard";
import ShipmentCard from "./ShipmentCard";
import CustomerCard from "./CustomerCard";
import ShippingInfoCard from "./ShippingInfoCard";
import TrackOrderCard from "./TrackOrderCard";

export default function CreateShipment() {
  const nav = useNavigate();
  const { state } = useLocation(); // from LogisticsTable
  const orderId = state?.orderId;
  const readonly = state?.readonly || false;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [ship, setShip] = useState({
    shippingMethod: "Park Pick Up",
    sendingPark: "",
    destinationPark: "",
    trackingId: "", // ← prefill later with order.trackingId
    driverContact: "",
    driverName: "", // NEW
    assignedTo: "", // NEW
    dispatchDate: "",
    expectedDate: "",
  });
  const [timeline, setTimeline] = useState([]);
  const [contact, setContact] = useState({
    address: "",
    phone: "",
    email: "",
  });

  /* ----------------------- load order & shipment ----------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const { data: ord } = await api.get(`/api/orders/${orderId}`, {
          withCredentials: true,
        });
        setOrder(ord);

        /* default tracking id */
        setShip((prev) => ({ ...prev, trackingId: ord.trackingId }));

        try {
          const res = await api.get(`/api/logistics/order/${orderId}`, {
            withCredentials: true,
            validateStatus: () => true,
          });
          if (res.status !== 204) {
            const lg = res.data;
            setShip((prev) => ({ ...prev, ...lg }));
            setContact({
              address: lg.deliveryAddress || ord.shippingAddress.address,
              phone: lg.deliveryPhone || ord.shippingAddress.phone,
              email: lg.deliveryEmail || ord.user.email,
            });
            setTimeline(lg.timeline || []);
          }
        } catch {
          setContact({
            address: ord.shippingAddress.address,
            phone: ord.shippingAddress.phone || "",
            email: ord.user.email,
          });
        }
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
        nav("/logistics");
      } finally {
        setLoading(false);
      }
    };
    if (orderId) load();
  }, [orderId, nav]);

  /* ----------------------------- handlers ------------------------ */
  const onFieldChange = (field, val) =>
    setShip((prev) => ({ ...prev, [field]: val }));

  const saveContact = async (addr, phone, mail) => {
    setContact({ address: addr, phone, email: mail });
    await api.patch(
      `/api/logistics/order/${orderId}/contact`,
      { deliveryAddress: addr, deliveryPhone: phone, deliveryEmail: mail },
      { withCredentials: true }
    );
    toast.success("Delivery contact updated");
  };

  const saveShipment = async () => {
    try {
      await api.post(
        "/api/logistics",
        { orderId, ...ship },
        { withCredentials: true }
      );
      toast.success("Shipment saved & order marked Shipped");
      nav("/logistics");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  /* ----------------------------- render -------------------------- */
  if (loading) return <p className="p-6">Loading…</p>;
  if (!order) return null;

  const deliveryMode = order.shippingAddress.address
    ? `${order.shippingAddress.address}, ${order.shippingAddress.city}`
    : order.pointOfSale || "—";

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <button
          onClick={() => nav("/logistics")}
          className="inline-flex items-center text-gray-600 hover:text-gray-800"
        >
          <FiChevronLeft className="mr-2" /> Back
        </button>

        {!readonly && (
          <div className="flex space-x-2">
            <button
              onClick={() => nav("/logistics")}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={saveShipment}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Order ID: {order.trackingId.slice(0, 5)}
        </h1>
        <span
          className={`inline-block mt-1 sm:mt-0 px-3 py-0.5 rounded-full text-xs font-medium ${
            order.status === "Pending"
              ? "bg-yellow-100 text-yellow-800"
              : order.status === "Shipped"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="space-y-6 lg:col-span-2">
          <OrderCard
            items={order.orderItems.map((it) => ({
              id: it._id,
              image: it.image,
              name: it.name,
              qty: it.qty,
              cpu: it.baseCPU,
              ram: it.baseRam,
              storage: it.baseStorage,
            }))}
            deliveryMode={deliveryMode}
          />

          <ShipmentCard
            readonly={readonly}
            shippingMethod={ship.shippingMethod}
            onChangeMethod={(val) => onFieldChange("shippingMethod", val)}
            fields={ship}
            onFieldChange={onFieldChange}
          />

          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Legend</h3>
            <div className="flex items-center space-x-6">
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full" />
                <span className="text-sm text-gray-700">Processing</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-700">Delivered</span>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <CustomerCard
            name={`${order.user.firstName} ${order.user.lastName}`}
            phone={
              order.shippingAddress.phone || order.user?.whatAppNumber || "—"
            }
            email={order.user.email}
          />
          <ShippingInfoCard
            address={contact.address}
            phone={contact.phone}
            email={contact.email}
            readonly={readonly}
            onSave={saveContact}
          />
          <TrackOrderCard timeline={timeline} />
        </div>
      </div>
    </div>
  );
}
