/* ────────────────────────────────────────────────────────────
   InventTable.jsx • Tailwind CSS 3 + React 18
   ──────────────────────────────────────────────────────────── */
   import { useState } from "react";
   import {
     FunnelIcon,
     ChevronDownIcon,
     EllipsisVerticalIcon,
   } from "@heroicons/react/24/outline";
   import InventDetails from "./InventDetails";

   /* demo data ----------------------------------------------------------- */
   const rows = [
     {
       id: 1,
       name: "Oraimo EarBuds",
       description:
         "High quality earbuds with superb bass - perfect for everyday use.",
       img: "https://via.placeholder.com/400x300?text=🎧",
       sku: "#28373",
       category: "Oraimo",
       costPrice: "NGN 4 800",
       unitPrice: "NGN 5 600",
       qty: 1,
       reorderLevel: 5,
       status: "Low stock",
       brand: "Oraimo",
       baseRam: "—",
       baseStorage: "—",
       baseCPU: "—",
     },
     {
       id: 2,
       name: "Macbook pro M4Pro chip",
       description:
         "Buy a new laptop, they sell the best laptops and offer the best services. I'd recommend anyone looking for a laptop to Algomian Tech anytime anyday! Totally top notch!",
       img: "https://via.placeholder.com/400x300?text=🖥️",
       sku: "#32876",
       category: "Macbook",
       costPrice: "NGN 1 500 000",
       unitPrice: "NGN 2 000 000",
       qty: 15,
       reorderLevel: 10,
       status: "In stock",
       brand: "Apple",
       baseRam: "16 gb",
       baseStorage: "256 gb",
       baseCPU: "Core i7",
     },
     // …add more rows as needed
   ];
   
   /* status → badge colour ---------------------------------------------- */
   const badge = (s) =>
     s === "In stock"
       ? "bg-green-100 text-green-700"
       : s === "Low stock"
       ? "bg-yellow-100 text-yellow-700"
       : "bg-red-100 text-red-700";
   
   export default function InventTable() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      {/* card */}
      <section className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
        {/* top bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* search */}
          <div className="relative grow sm:grow-0 sm:basis-64">
            <input
              type="text"
              placeholder="Search here…"
              className="peer w-full rounded border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 peer-focus:text-gray-500"
              fill="none" strokeWidth="2" stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-4.35-4.35M9.5 17a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
            </svg>
          </div>

          {/* controls collapse into menu later if you wish */}
          <button className="flex items-center gap-1 rounded border px-3 py-2 text-sm">
            <FunnelIcon className="h-4 w-4" /> Filter
          </button>

          <div className="ml-auto">
            <button className="flex items-center gap-2 rounded border px-3 py-2 text-sm">
              Categories <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* table wrapper – horizontal scroll on < md  */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="whitespace-nowrap border-b text-left text-gray-500">
              <tr>
                <th className="py-3 pl-4">
                  <input type="checkbox" className="accent-orange-500" />
                </th>
                <th className="py-3">Name</th>
                <th className="py-3 hidden sm:table-cell">Product ID</th>
                <th className="py-3 hidden md:table-cell">Category</th>
                <th className="py-3 hidden lg:table-cell">Unit Price</th>
                <th className="py-3">Qty</th>
                <th className="py-3 hidden sm:table-cell">Status</th>
                <th className="py-3 pr-4 text-right"> </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id} className="whitespace-nowrap hover:bg-gray-50">
                  <td className="py-3 pl-4">
                    <input type="checkbox" className="accent-orange-500" />
                  </td>

                  <td className="py-3 flex items-center gap-3">
                    <img
                      src={r.img} alt=""
                      className="h-8 w-8 shrink-0 rounded object-cover md:h-10 md:w-10"
                    />
                    <span className="max-w-[140px] truncate sm:max-w-none">
                      {r.name}
                    </span>
                  </td>

                  <td className="py-3 hidden sm:table-cell">{r.sku}</td>
                  <td className="py-3 hidden md:table-cell">{r.category}</td>
                  <td className="py-3 hidden lg:table-cell">
                    {r.unitPrice ?? r.price}
                  </td>
                  <td className="py-3">{r.qty}</td>

                  <td className="py-3 hidden sm:table-cell">
                    <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${badge(r.status)}`}>
                      {r.status}
                    </span>
                  </td>

                  <td className="py-3 pr-4 text-right">
                    <button
                      onClick={() => setSelected(r)}
                      className="rounded p-1 hover:bg-gray-100"
                    >
                      <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* slide-over */}
      {selected && (
        <InventDetails
          product={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
   