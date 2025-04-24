import React from 'react';
import OrderTop   from '../components/OrderTop';
import OrderTable from '../components/OrderTable';

export default function InventoryOrder() {
  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-12 bg-gray-50 min-h-screen">
      <OrderTop />
      <OrderTable />
    </main>
  );
}
