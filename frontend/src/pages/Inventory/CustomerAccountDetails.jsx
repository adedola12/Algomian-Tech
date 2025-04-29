// src/pages/customers/CustomerAccountDetails.jsx
import React from 'react'
import CustomerReportCard   from '../../components/customers/CustomerReportCard'
import CustomerOrderTable   from '../../components/customers/CustomerOrderTable'
import CustomerSideBar      from '../../components/customers/CustomerSideBar'

export default function CustomerAccountDetails() {
  return (
    <main className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* two-col layout: stack on mobile, row on lg+ */}
        <div className="flex flex-col lg:flex-row lg:space-x-6">
                  {/* ─── Left: reports + table */}
        <div className="flex-1 flex flex-col space-y-6">
          <CustomerReportCard />
          {/* Order card now stretches to fill remaining height */}
          <div className="flex-1">
            <CustomerOrderTable className="h-full" />
          </div>
        </div>

           {/* ─── Right: full-height sidebar */}
         <aside className="mt-6 lg:mt-0 lg:w-1/3 flex-shrink-0">
           {/* 100 vh minus the top padding you gave <main> (6 = 1.5rem) */}
           <div className="h-[calc(100vh-1.5rem)] sticky top-6">
             <CustomerSideBar className="h-full" />
           </div>
         </aside>
        </div>
      </div>
    </main>
  )
}
