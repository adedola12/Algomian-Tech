/* ──────────────────────────────────────────────────────────────────
   1. src/components/Logistics/OrderCard.jsx
   ────────────────────────────────────────────────────────────────── */
   import React from 'react';

   export default function OrderCard({ items = [], deliveryMode = '' }) {
     return (
       <div className="bg-white rounded-lg border p-4 space-y-6">
         <h3 className="text-sm font-medium text-gray-700">
           Order Item – {items.length}
         </h3>
   
         <div className="space-y-4">
           {items.map((it , idx)=> (
             <div key={it.id || idx} className="flex items-start space-x-4">
               <img
                 src={it.image}
                 alt={it.name}
                 className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
               />
               <div className="flex-1">
                 <h4 className="font-semibold text-gray-800">{it.name}</h4>
   
                 <p className="text-xs text-gray-500">
                   <span className="font-medium">Qty&nbsp;:&nbsp;</span>{it.qty}&nbsp;&nbsp;|&nbsp;&nbsp;
                   <span className="font-medium">CPU&nbsp;:&nbsp;</span>{it.cpu}&nbsp;&nbsp;|&nbsp;&nbsp;
                   <span className="font-medium">RAM&nbsp;:&nbsp;</span>{it.ram}&nbsp;&nbsp;|&nbsp;&nbsp;
                   <span className="font-medium">Storage&nbsp;:&nbsp;</span>{it.storage}
                 </p>
               </div>
             </div>
           ))}
         </div>
   
         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm">
           <span className="font-medium text-gray-700">Delivery Mode</span>
           <span className="mt-1 sm:mt-0 text-gray-800">{deliveryMode}</span>
         </div>
       </div>
     );
   }