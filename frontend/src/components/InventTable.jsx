import { useEffect, useState, useMemo, useCallback } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import InventDetails from "./InventDetails";
import { fetchProducts } from "../api";

const badge = (qty, reorder) =>
  qty === 0
    ? "bg-red-100 text-red-700"
    : qty <= reorder
    ? "bg-yellow-100 text-yellow-700"
    : "bg-green-100 text-green-700";

const toEmbedUrl = (url) => {
  if (!url) return url;
  const match = url.match(/(?:file\/d\/|id=)([^/&?]+)/);
  return match ? `https://drive.google.com/uc?export=view&id=${match[1]}` : url;
};

const testImageUrl = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
  });
};

export default function InventTable() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { products, total: grandTotal } = await fetchProducts({
        search,
        category,
      });

      // Check each product image URL accessibility
      const verifiedProducts = await Promise.all(
        products.map(async (product) => {
          const imageUrl = product.images?.[0]
            ? toEmbedUrl(product.images[0])
            : null;
          const isImageAccessible = imageUrl
            ? await testImageUrl(imageUrl)
            : false;

          return {
            ...product,
            verifiedImage: isImageAccessible ? imageUrl : null,
          };
        })
      );

      setRows(verifiedProducts);
      setTotal(grandTotal);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = useMemo(
    () => [...new Set(rows.map((p) => p.productCategory))],
    [rows]
  );

  if (loading) return <p className="p-4">Loading…</p>;
  if (error) return <p className="p-4 text-red-600">Error: {error}</p>;
  if (!rows.length) return <p className="p-4">No products match your query.</p>;

  return (
    <>
      <section className="space-y-4 rounded-lg bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-grow sm:flex-grow-0 sm:basis-64">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search here…"
              className="peer w-full rounded border-gray-300 py-2 pl-10 pr-3 text-sm focus:outline-none"
            />
            <svg
              className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400 peer-focus:text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M9.5 17a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
              />
            </svg>
          </div>

          <select
            className="ml-auto rounded border px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gray-500">
          Total items:{" "}
          <span className="font-medium text-gray-900">{total}</span>
        </p>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="whitespace-nowrap border-b text-left text-gray-500">
              <tr>
                <th className="py-3 pl-4">
                  <input type="checkbox" className="accent-orange-500" />
                </th>
                <th className="py-3">Name</th>
                <th className="py-3 hidden xs:table-cell">Product&nbsp;ID</th>
                <th className="py-3 hidden sm:table-cell">Category</th>
                <th className="py-3 hidden lg:table-cell">Unit&nbsp;Price</th>
                <th className="py-3">Qty</th>
                <th className="py-3 hidden xs:table-cell">Status</th>
                <th className="py-3 pr-4 text-right"></th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {rows.map((p) => (
                <tr key={p._id} className="whitespace-nowrap hover:bg-gray-50">
                  <td className="py-3 pl-4">
                    <input type="checkbox" className="accent-orange-500" />
                  </td>
                  <td className="py-3 flex min-w-[160px] items-center gap-3">
                    <img
                      src={
                        p.verifiedImage ||
                        `https://ui-avatars.com/api/?size=128&name=${encodeURIComponent(
                          p.productName
                        )}` || "https://drive.usercontent.google.com/download?id=1jvulaDtxvT-ciRe2ubmSAopWq2VnMMaO&export=view&authuser=0"
                      }
                      alt={p.productName}
                      className="h-9 w-9 shrink-0 rounded object-cover"
                    />
                    <span className="truncate">{p.productName}</span>
                  </td>
                  <td className="hidden xs:table-cell">{p.productId}</td>
                  <td className="hidden sm:table-cell">{p.productCategory}</td>
                  <td className="hidden lg:table-cell">
                    NGN {p.sellingPrice.toLocaleString()}
                  </td>
                  <td>{p.quantity}</td>
                  <td className="hidden xs:table-cell">
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-medium ${badge(
                        p.quantity,
                        p.reorderLevel
                      )}`}
                    >
                      {p.quantity === 0
                        ? "Out of stock"
                        : p.quantity <= p.reorderLevel
                        ? "Low stock"
                        : "In stock"}
                    </span>
                  </td>
                  <td className="pr-4 text-right">
                    <button
                      onClick={() => setSelected(p)}
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

      {selected && (
        <InventDetails product={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
