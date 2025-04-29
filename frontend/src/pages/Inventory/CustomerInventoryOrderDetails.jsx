import React from 'react'
import CustomerTop   from '../../components/customers/CustomerTop'
import CustomerTable from '../../components/customers/CustomerTable'

export default function CustomerInventoryOrderDetails() {
  return (
    <main className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Metrics + Export */}
        <CustomerTop />

        {/* Customers Table */}
        <CustomerTable />
      </div>
    </main>
  )
}
