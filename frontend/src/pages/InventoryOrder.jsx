import React from "react";
import OrderTop from "../components/OrderTop";
import OrderTable from "../components/OrderTable";

export default function InventoryOrder() {
  return (
    <main className="bg-gray-50 min-h-screen overflow-x-hidden">
      {/* Responsive container: narrow on mobile, roomy on larger screens */}
      <div className="mx-auto w-full max-w-[420px] sm:max-w-2xl lg:max-w-6xl px-3 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Top summary/cards */}
        <section className="max-w-full">
          <OrderTop />
        </section>

        {/* Orders table */}
        <section className="max-w-full">
          <OrderTable />
        </section>
      </div>
    </main>
  );
}
