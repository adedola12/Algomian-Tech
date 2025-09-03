/*  src/components/InventTable.jsx  */
import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

import InventDetails from "./InventDetails";
import { fetchProducts, deleteProduct } from "../api";
import { useAuth } from "../context/AuthContext";
import { useDebounce } from "../hooks/useDebounce";

/* ─── helpers ──────────────────────────────────────────────── */
const badge = (qty, reorder) =>
  qty === 0
    ? "bg-red-100 text-red-700"
    : qty <= reorder
    ? "bg-yellow-100 text-yellow-700"
    : "bg-green-100 text-green-700";

const toEmbedUrl = (url = "") => {
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

/* ─── component ────────────────────────────────────────────── */
export default function InventTable() {
  const nav = useNavigate();
  const { user } = useAuth();
  const isPrivileged = ["Admin", "Manager", "Inventory"].includes(
    user?.userType
  );

  /* ------------ state ------------ */
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [menuRow, setMenuRow] = useState(null);
  const [selected, setSelected] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });

  const debouncedSearch = useDebounce(search.trim(), 300);

  /* ------------ sorting handler ------------ */
  const handleSort = (key) =>
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );

  /* ------------ data loader (server pagination) ------------ */
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const {
        products = [],
        total: grandTotal = 0,
        pages: apiPages,
      } = await fetchProducts({
        search: debouncedSearch || undefined,
        category: category || undefined,
        page,
        limit: LIMIT,
        inStockOnly: true, // 👈 only fetch items with quantity > 0
      });

      const safeProducts = Array.isArray(products) ? products : [];

      const verified = await Promise.all(
        safeProducts.map(async (p) => {
          const img = p.images?.[0] ? toEmbedUrl(p.images[0]) : null;
          return {
            ...p,
            verifiedImage: img && (await testImage(img)) ? img : null,
          };
        })
      );

      setRows(verified);
      setTotal(Number.isFinite(grandTotal) ? grandTotal : verified.length);
      setPages(
        Number.isFinite(apiPages)
          ? apiPages
          : Math.max(1, Math.ceil((grandTotal || verified.length) / LIMIT))
      );
      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  useEffect(() => {
    const close = () => setMenuRow(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  /* ------------ derived data ------------ */
  const categories = useMemo(
    () => [...new Set(rows.map((p) => p.productCategory))],
    [rows]
  );

  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return rows;

    const val = (obj) =>
      sortConfig.key === "status"
        ? obj.quantity === 0
          ? 1
          : obj.quantity <= obj.reorderLevel
          ? 2
          : 3
        : obj[sortConfig.key];

    const sorted = [...rows].sort((a, b) => {
      const va = val(a),
        vb = val(b);
      return typeof va === "string" ? va.localeCompare(vb) : va - vb;
    });

    return sortConfig.direction === "asc" ? sorted : sorted.reverse();
  }, [rows, sortConfig]);

  /* ------------ helpers ------------ */
  const fmtNGN = (n) =>
    "NGN " +
    Number(n || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 0,
    });

  const compactDetails = (p) => {
    let cpu = "",
      ram = "",
      sto = "";
    if (Array.isArray(p.baseSpecs) && p.baseSpecs.length > 0) {
      const first = p.baseSpecs[0] || {};
      cpu = first.baseCPU || "";
      ram = first.baseRam || "";
      sto = first.baseStorage || "";
    }
    cpu = cpu || p.baseCPU || p.storageCPU || "";
    ram = ram || p.baseRam || p.storageRam || "";
    sto = sto || p.baseStorage || p.Storage || "";
    return [cpu, ram, sto].filter(Boolean).join("/") || "—";
  };

  const confirmDelete = async (row) => {
    if (!window.confirm(`Delete “${row.productName}” permanently?`)) return;
    try {
      await deleteProduct(row._id);
      toast.success("Product deleted");
      loadProducts();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  return (
    <>
      <section className="space-y-4 rounded-lg bg-white p-4 sm:p-5 shadow-sm">
        {/* filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-grow sm:flex-grow-0 sm:basis-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search here…"
              className="peer w-full rounded border-gray-300 py-2 pl-10 pr-3 text-sm focus:outline-none"
            />
          </div>

          {loading && <span className="text-sm text-gray-500">Loading…</span>}

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

        {error && <p className="text-sm text-red-600">Error: {error}</p>}

        <p className="text-sm text-gray-500">
          Total items:&nbsp;
          <span className="font-medium text-gray-900">{total}</span>
        </p>

        {/* table */}
        <div className="w-full overflow-x-auto relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
              <span className="text-sm text-gray-500">Loading…</span>
            </div>
          )}

          <table className="w-full min-w-[900px] text-sm">
            <thead className="whitespace-nowrap border-b text-left text-gray-500">
              <tr>
                {isPrivileged && (
                  <th className="py-3 pl-4">
                    <input type="checkbox" className="accent-orange-500" />
                  </th>
                )}
                {[
                  ["Name", "productName"],
                  ["Details", ""],
                  ["Selling Price", "sellingPrice"],
                  ["Quantity", "quantity"],
                  ...(isPrivileged
                    ? [
                        ["Supplier", ""],
                        ["Cost Price", "costPrice"],
                      ]
                    : []),
                  ["Status", "status"],
                  ["Date Added", "createdAt"],
                  ["Action", ""],
                ].map(([label, key]) => (
                  <th
                    key={label}
                    className={`py-3 ${key ? "cursor-pointer" : ""}`}
                    onClick={() => key && handleSort(key)}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {!loading && sortedRows.length === 0 && (
                <tr>
                  <td
                    colSpan={isPrivileged ? 8 : 6}
                    className="py-6 text-center text-gray-500"
                  >
                    No products match your query.
                  </td>
                </tr>
              )}

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
                    <>
                      <td className="py-3 hidden md:table-cell">
                        {p.supplier || "—"}
                      </td>
                      <td className="py-3 hidden md:table-cell">
                        {fmtNGN(p.costPrice)}
                      </td>
                    </>
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

                  <td className="py-3">
                    {new Date(p.createdAt).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
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
                        className="absolute right-3 top-8 z-20 w-40 rounded border bg-white py-1 text-sm shadow-lg"
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

                        <button
                          onClick={() => {
                            nav("/sales", { state: { product: p } });
                          }}
                          className="flex w-full items-center px-3 py-2 hover:bg-gray-100"
                        >
                          Make sale
                        </button>

                        {isPrivileged && (
                          <>
                            <button
                              onClick={() =>
                                nav(`/inventory/edit-product/${p._id}`)
                              }
                              className="flex w-full items-center px-3 py-2 hover:bg-gray-100"
                            >
                              Edit product
                            </button>

                            <button
                              onClick={() => {
                                setMenuRow(null);
                                confirmDelete(p);
                              }}
                              className="flex w-full items-center px-3 py-2 text-red-600 hover:bg-red-50"
                            >
                              Delete product
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* pagination (20 per page) */}
          <div className="flex items-center justify-between gap-3 py-4">
            <span className="text-sm text-gray-600">
              Page {page} of {pages}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className={`rounded border px-4 py-2 text-sm ${
                  page <= 1 || loading
                    ? "cursor-not-allowed bg-gray-50 text-gray-400"
                    : "hover:bg-gray-50"
                }`}
              >
                Previous
              </button>

              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages || loading}
                className={`rounded border px-4 py-2 text-sm ${
                  page >= pages || loading
                    ? "cursor-not-allowed bg-gray-50 text-gray-400"
                    : "hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {selected && (
        <InventDetails product={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
