/* ────────────────────────────────────────────────────────────
   InventDetails.jsx • Tailwind CSS 3
   ──────────────────────────────────────────────────────────── */
   import { XMarkIcon } from "@heroicons/react/24/outline";

   export default function InventDetails({ product, onClose }) {
     if (!product) return null;              // render nothing if not open
   
     /* helpers ---------------------------------------------------------- */
     const badgeColour =
       product.qty === 0
         ? "bg-red-100 text-red-700"
         : product.qty <= product.reorderLevel
         ? "bg-yellow-100 text-yellow-700"
         : "bg-green-100 text-green-700";
   
     return (
       <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm">
         {/* panel -------------------------------------------------------- */}
         + <div className="relative max-h-[90vh] w-full sm:w-[420px] overflow-y-auto
                rounded-t-2xl sm:rounded-lg bg-white p-6 shadow-xl">
           {/* close button */}
           <button
             onClick={onClose}
             className="absolute right-4 top-4 rounded p-1 hover:bg-gray-100">
             <XMarkIcon className="h-5 w-5 text-gray-500" />
           </button>
   
           {/* heading */}
           <h2 className="mb-1 text-2xl font-bold">Inventory Details</h2>
           <p className="text-sm text-gray-700 mb-4">
             Product&nbsp;ID: <span className="text-red-600 font-medium">{product.sku}</span>
           </p>
   
           {/* availability badge */}
           <span
             className={`mb-4 inline-block rounded-full px-3 py-1 text-xs font-medium ${badgeColour}`}>
             {product.qty === 0
               ? "Out of stock"
               : product.qty <= product.reorderLevel
               ? `Low stock – ${product.qty} left`
               : `Available – ${product.qty} Units left`}
           </span>
   
           {/* thumbnail */}
           <img
             src={product.img}
             alt={product.name}
             className="mb-6 h-48 w-full rounded object-cover"
           />
   
           {/* description block */}
           <h3 className="mb-1 font-semibold">
             Product Name: {product.name}
           </h3>
           <p className="mb-6 text-sm text-gray-700">{product.description}</p>
   
           {/* key/val helper */}
           {[
             ["Brand", product.brand],
             ["Category", product.category],
             ["Cost Price per Unit (NGN)", product.costPrice],
             ["Selling Price per Unit (NGN)", product.unitPrice],
             ["Base Ram", product.baseRam],
             ["Base Storage", product.baseStorage],
             ["Base CPU / Processor", product.baseCPU],
             ["Product Quantity", product.qty],
             ["Product Status (Low-stock alert when stock is less than)", product.reorderLevel],
           ].map(([label, value], idx) => (
             <div key={label} className="mb-6 last:mb-0">
               <p className="text-xs uppercase tracking-wide text-gray-400">
                 {label}
               </p>
               <p className="mt-1 font-medium">{value}</p>
   
               {/* divider except after last row */}
               {idx !== 8 && (
                 <hr className="mt-4 border-t border-gray-200" />
               )}
             </div>
           ))}
         </div>
       </div>
     );
   }
   