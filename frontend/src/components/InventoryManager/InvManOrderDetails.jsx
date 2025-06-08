import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";
import OrderDetTop from "../../components/OrderDetTop";
import InvManItemDet from "./InvManItemDet";
import InvManCustomerCard from "./InvManCustomerCard";

export default function InvManOrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/api/orders/${id}`, {
        withCredentials: true,
      });
      setOrder(data);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) return <p className="p-6">Loading…</p>;
  if (!order) return <p className="p-6">Order not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <OrderDetTop order={order} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* ↓── gives OrderItemDet the refetch callback */}
            <InvManItemDet order={order} onOrderChange={fetchOrder} />
          </div>
          <div className="space-y-6">
            <InvManCustomerCard order={order} onOrderChange={fetchOrder} />
          </div>
        </div>
      </div>
    </div>
  );
}
