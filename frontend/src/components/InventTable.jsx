import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import InventDetails from "./InventDetails";
import { fetchProducts } from "../api";
import { useAuth } from "../context/AuthContext";

const badge = (qty, reorder) =>
  qty === 0
    ? "bg-red-100 text-red-700"
    : qty <= reorder
    ? "bg-yellow-100 text-yellow-700"
    : "bg-green-100 text-green-700";

const toEmbedUrl = (url) => {
  if (!url) return url;
  const m = url.match(/(?:file\/d\/|id=)([^/&?]+)/);
  return m ? `https://drive.google.com/uc?export=view&id=${m[1]}` : url;
};

const testImage = (url) =>
  new Promise((ok) => {
    const img = new Image();
    img.src = url;
    img.onload = () => ok(true);
    img.onerror = () => ok(false);
  });

export default function InventTable() {
  const nav = useNavigate();
  const { user } = useAuth();
  const userType = user?.userType;

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [menuRow, setMenuRow] = useState(null);
  const [selected, setSelected] = useState(null);
  const isPrivileged = ["Admin", "Manager", "Inventory"].includes(userType);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      } else {
        return { key, direction: "asc" };
      }
    });
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { products, total: grandTotal } = await fetchProducts({
        search,
        category,
      });
      const verified = await Promise.all(
        products.map(async (p) => {
          const img = p.images?.[0] ? toEmbedUrl(p.images[0]) : null;
          return {
            ...p,
            verifiedImage: img && (await testImage(img)) ? img : null,
          };
        })
      );
      setRows(verified);
      setTotal(grandTotal);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const close = () => setMenuRow(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const categories = useMemo(
    () => [...new Set(rows.map((p) => p.productCategory))],
    [rows]
  );

  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return rows;
    const compare = (a, b) => {
      const valA =
        sortConfig.key === "status"
          ? a.quantity === 0
            ? 1
            : a.quantity <= a.reorderLevel
            ? 2
            : 3
          : a[sortConfig.key];
      const valB =
        sortConfig.key === "status"
          ? b.quantity === 0
            ? 1
            : b.quantity <= b.reorderLevel
            ? 2
            : 3
          : b[sortConfig.key];

      if (typeof valA === "string") return valA.localeCompare(valB);
      return valA - valB;
    };
    const sorted = [...rows].sort(compare);
    return sortConfig.direction === "asc" ? sorted : sorted.reverse();
  }, [rows, sortConfig]);

  const fmtNGN = (n) =>
    "NGN " +
    Number(n || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const compactDetails = (p) => {
    const cpu = p.baseCPU || p.storageCPU || "";
    const ram = p.baseRam || p.storageRam || "";
    const sto = p.baseStorage || p.Storage || "";
    return [cpu, ram, sto].filter(Boolean).join("/") || "—";
  };

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
              placeholder="Search here…"
              className="peer w-full rounded border-gray-300 py-2 pl-10 pr-3 text-sm focus:outline-none"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="ml-auto rounded border px-3 py-2 text-sm"
          >
            <option value="">Categories</option>
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
          <table className="w-full min-w-[900px] text-sm">
            <thead className="whitespace-nowrap border-b text-left text-gray-500">
              <tr>
                {isPrivileged && (
                  <th className="py-3 pl-4">
                    <input type="checkbox" className="accent-orange-500" />
                  </th>
                )}
                <th
                  className="py-3 cursor-pointer"
                  onClick={() => handleSort("productName")}
                >
                  Name
                </th>
                <th className="py-3">Details</th>
                <th
                  className="py-3 cursor-pointer"
                  onClick={() => handleSort("sellingPrice")}
                >
                  Selling Price
                </th>
                <th
                  className="py-3 cursor-pointer"
                  onClick={() => handleSort("quantity")}
                >
                  Quantity
                </th>
                {isPrivileged && (
                  <th className="py-3 hidden md:table-cell">Supplier</th>
                )}
                {isPrivileged && (
                  <th
                    className="py-3 hidden md:table-cell cursor-pointer"
                    onClick={() => handleSort("costPrice")}
                  >
                    Cost Price
                  </th>
                )}
                <th
                  className="py-3 cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  Status
                </th>
                <th className="py-3 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedRows.map((p) => (
                <tr
                  key={p._id}
                  className="whitespace-nowrap hover:bg-gray-50 relative"
                >
                  {isPrivileged && (
                    <td className="py-3 pl-4">
                      <input type="checkbox" className="accent-orange-500" />
                    </td>
                  )}
                  <td className="py-3 flex min-w-[180px] items-center gap-3">
                    <img
                      src={
                        p.verifiedImage ||
                        `https://ui-avatars.com/api/?size=128&name=${encodeURIComponent(
                          p.productName
                        )}`
                      }
                      alt={p.productName}
                      className="h-9 w-9 shrink-0 rounded object-cover"
                    />
                    <span className="truncate">{p.productName}</span>
                  </td>
                  <td className="py-3">{compactDetails(p)}</td>
                  <td className="py-3">{fmtNGN(p.sellingPrice)}</td>
                  <td className="py-3">{p.quantity}</td>
                  {isPrivileged && (
                    <td className="py-3 hidden md:table-cell">
                      {p.supplier || "—"}
                    </td>
                  )}
                  {isPrivileged && (
                    <td className="py-3 hidden md:table-cell">
                      {fmtNGN(p.costPrice)}
                    </td>
                  )}
                  <td className="py-3">
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
                  <td className="pr-4 text-right relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuRow(menuRow === p._id ? null : p._id);
                      }}
                      className="rounded p-1 hover:bg-gray-100"
                    >
                      <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
                    </button>
                    {menuRow === p._id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-3 top-8 z-20 w-32 rounded border bg-white py-1 text-sm shadow-lg"
                      >
                        <button
                          onClick={() => {
                            setSelected(p);
                            setMenuRow(null);
                          }}
                          className="flex w-full items-center px-3 py-2 hover:bg-gray-100"
                        >
                          View product
                        </button>
                        {isPrivileged && (
                          <button
                            onClick={() =>
                              nav(`/inventory/edit-product/${p._id}`)
                            }
                            className="flex w-full items-center px-3 py-2 hover:bg-gray-100"
                          >
                            Edit product
                          </button>
                        )}
                      </div>
                    )}
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
