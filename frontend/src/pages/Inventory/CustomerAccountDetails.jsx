// src/pages/customers/CustomerAccountDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CustomerReportCard from "../../components/customers/CustomerReportCard";
import CustomerOrderTable from "../../components/customers/CustomerOrderTable";
import CustomerSideBar from "../../components/customers/CustomerSideBar";
import { fetchCustomerById, fetchCustomerOrders } from "../../api";

export default function CustomerAccountDetails() {
  const { id } = useParams(); // ✅ from route
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const user = await fetchCustomerById(id);
        const userOrders = await fetchCustomerOrders(id);
        setCustomer(user);
        setOrders(userOrders);
      } catch (err) {
        console.error("Failed to fetch customer details", err);
        setError("Could not load customer data.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCustomerData();
  }, [id]);

  // if (loading) return <p className="p-6">Loading customer data...</p>;
  if (error || !customer) return <p className="p-6 text-red-600">{error || "Customer not found."}</p>;

  const fullName = `${customer.firstName || ""} ${customer.lastName || ""}`.trim();

  return (
    <main className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:space-x-6">
          {/* LEFT COLUMN */}
          <div className="flex-1 flex flex-col space-y-6">
            <CustomerReportCard
              name={fullName}
              stats={{
                spent: "₦" + orders.reduce((sum, o) => sum + o.totalPrice, 0).toLocaleString(),
                profit: "—",
                items: orders.reduce((sum, o) => sum + o.orderItems.length, 0),
                orders: orders.length,
                delta: "5 %",
              }}
            />
            <CustomerOrderTable className="h-full" orders={orders} />
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="mt-6 lg:mt-0 lg:w-1/3 flex-shrink-0">
            <div className="h-[calc(100vh-1.5rem)] sticky top-6">
              <CustomerSideBar
                className="h-full"
                user={{
                  name: fullName,
                  email: customer.email,
                  id: customer._id,
                  phone: customer.whatAppNumber,
                  address: customer.address || "N/A",
                  added: customer.createdAt,
                  lastVisited: customer.updatedAt,
                  status: customer.status || "Subscribed",
                }}
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
