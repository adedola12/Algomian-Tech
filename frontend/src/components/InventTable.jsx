/* ────────────────────────────────────────────────────────────
   InventTable.jsx • Tailwind CSS 3
   ──────────────────────────────────────────────────────────── */
   import {
    FunnelIcon,
    ChevronDownIcon,
    EllipsisVerticalIcon,
  } from "@heroicons/react/24/outline";
  
  const rows = [
    {
      id: 1,
      name: "Oraimo EarBuds",
      img: "https://via.placeholder.com/40?text=🎧",
      sku: "#28373",
      category: "Oraimo",
      price: "NGN 5 600",
      qty: 1,
      status: "Low stock",
    },
    {
      id: 2,
      name: "Macbook pro M4Pro chip",
      img: "https://via.placeholder.com/40?text=🖥️",
      sku: "#32876",
      category: "Macbook",
      price: "NGN 3 150 000",
      qty: 15,
      status: "In stock",
    },
    {
      id: 3,
      name: "Macbook pro M4Pro chip",
      img: "https://via.placeholder.com/40?text=🖥️",
      sku: "#11394",
      category: "Macbook",
      price: "NGN 2 400 000",
      qty: 12,
      status: "In stock",
    },
    {
      id: 4,
      name: "Macbook pro M4Pro chip",
      img: "https://via.placeholder.com/40?text=🖥️",
      sku: "#99822",
      category: "Macbook",
      price: "NGN 3 150 000",
      qty: 0,
      status: "Out of stock",
    },
    {
      id: 5,
      name: "Lenovo dual core",
      img: "https://via.placeholder.com/40?text=🖥️",
      sku: "#11873",
      category: "Lenovo",
      price: "NGN 3 150 000",
      qty: 10,
      status: "In stock",
    },
    /* …repeat rows to taste… */
  ];
  
  /* status → badge colour ------------------------------------------------ */
  const badge = (s) => {
    if (s === "In stock")      return "bg-green-100 text-green-700";
    if (s === "Low stock")     return "bg-yellow-100 text-yellow-700";
    if (s === "Out of stock")  return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  };
  
  export default function InventTable() {
    return (
      <section className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
  
        {/* top bar -------------------------------------------------------- */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search here..."
              className="w-full rounded border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:ring-0"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
              fill="none" stroke="currentColor" strokeWidth="2"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-4.35-4.35M9.5 17a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"/>
            </svg>
          </div>
  
          <button
            className="flex items-center gap-1 rounded border px-3 py-2 text-sm">
            <FunnelIcon className="h-4 w-4"/> Filter
          </button>
  
          <div className="ml-auto relative">
            <button className="flex items-center gap-2 rounded border px-3 py-2 text-sm">
              Categories <ChevronDownIcon className="h-4 w-4"/>
            </button>
            {/* dropdown would go here */}
          </div>
        </div>
  
        {/* table ---------------------------------------------------------- */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] table-auto text-sm">
            <thead className="whitespace-nowrap border-b text-left text-gray-500">
              <tr>
                <th className="py-3 pl-4">
                  <input type="checkbox" className="accent-orange-500"/>
                </th>
                <th className="py-3">Name</th>
                <th className="py-3">Product ID</th>
                <th className="py-3">Category</th>
                <th className="py-3">Unit Price</th>
                <th className="py-3">Quantity</th>
                <th className="py-3">Status</th>
                <th className="py-3 pr-4 text-right">Action</th>
              </tr>
            </thead>
  
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id} className="whitespace-nowrap hover:bg-gray-50">
  
                  {/* checkbox */}
                  <td className="py-3 pl-4">
                    <input type="checkbox" className="accent-orange-500"/>
                  </td>
  
                  {/* Name + thumbnail */}
                  <td className="py-3 flex items-center gap-3">
                    <img src={r.img} alt="" className="h-10 w-10 rounded object-cover"/>
                    {r.name}
                  </td>
  
                  <td className="py-3">{r.sku}</td>
                  <td className="py-3">{r.category}</td>
                  <td className="py-3">{r.price}</td>
                  <td className="py-3">{r.qty}</td>
  
                  {/* Status badge */}
                  <td className="py-3">
                    <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${badge(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
  
                  {/* Action dropdown trigger */}
                  <td className="py-3 pr-4 text-right">
                    <button className="rounded p-1 hover:bg-gray-100">
                      <EllipsisVerticalIcon className="h-5 w-5 text-gray-500"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }
  