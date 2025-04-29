import React from 'react';
import { Outlet } from 'react-router-dom';
import LogisticsTop   from '../../components/Logistics/LogisticsTop';
import LogisticsTable from '../../components/Logistics/LogisticsTable';

export default function Logistics() {
  return (
    <main className="bg-gray-50 min-h-screen py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top metrics + Create button */}
        <section className="bg-white rounded-2xl shadow p-6">
          <LogisticsTop />
        </section>
        {/* Table */}
        <section className="bg-white rounded-2xl shadow p-6">
          <LogisticsTable />
        </section>
        {/* Nested route for /logistics/create will render here */}
        <Outlet />
      </div>
    </main>
  );
}
