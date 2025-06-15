/*  src/components/SalesInfoInput.jsx  */

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FiSearch } from "react-icons/fi";
import SelectedItemCard from "./SelectedItemCard";
import { lineTotal } from "../../utils/money";

/* helper builds the line that SelectedItemCard expects */
const buildLine = (p) => {
  const first =
    Array.isArray(p.baseSpecs) && p.baseSpecs.length ? p.baseSpecs[0] : {};
  return {
    id: p._id,
    image: p.images?.[0] || "",
    name: p.productName,
    baseRam: first.baseRam || "",
    baseStorage: first.baseStorage || "",
    baseCPU: first.baseCPU || "",
    price: p.sellingPrice,
    qty: 1,
    maxQty: p.quantity,
    variants: p.variants || [],
    variantSelections: [],
    variantCost: 0,
    expanded: false,
  };
};

export default function SalesInfoInput({
  items,
  setItems,
  onBack = () => {},
  onNext = () => {},
  hideNav = false,
  initialTaxPercent = 0,
}) {
  /* ───────────────────────── state ───────────────────────── */
  const [query, setQuery] = useState("");
  const [allProducts, setAll] = useState([]); // full catalogue
  const [suggestions, setSug] = useState([]); // search dropdown (≤4)
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [taxPercent, setTax] = useState(initialTaxPercent);

  /* ─────────────────────── fetch catalogue ───────────────── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/products?limit=500", {
          withCredentials: true,
        });
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
          ? data.products
          : [];
        setAll(list);
        setSug(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ───────────────────── debounced search ────────────────── */
  useEffect(() => {
    if (!query.trim()) {
      setSug(allProducts);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `/api/products?search=${encodeURIComponent(query)}&limit=50`
        );
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
          ? data.products
          : [];
        setSug(list.slice(0, 4)); // limit to 4 results
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, allProducts]);

  /* ──────────────────────── helpers ──────────────────────── */
  const isSelected = (id) => items.some((l) => l.id === id);

  const toggleSelect = (prod) => {
    if (isSelected(prod._id)) {
      setItems((prev) => prev.filter((l) => l.id !== prod._id));
    } else {
      setItems((prev) => [...prev, buildLine(prod)]);
    }
  };

  const handleSelectFromSearch = (p) => {
    if (!isSelected(p._id)) setItems((prev) => [...prev, buildLine(p)]);
    setQuery("");
    setSug(allProducts);
    setFocused(false);
  };

  const updateItem = (id, changes) =>
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, ...changes } : x))
    );

  const subtotal = useMemo(
    () => items.reduce((s, it) => s + lineTotal(it), 0),
    [items]
  );
  const taxTotal = (subtotal * taxPercent) / 100;
  const total = subtotal + taxTotal;

  /* ───────────────────────── UI ──────────────────────────── */
  return (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-6 space-y-8">
      {/* ───── header ───── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Sales Management
          </h2>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">
              Sales
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg"
            >
              Sales History
            </button>
          </div>
        </div>

        {/* ───── search ───── */}
        <div className="w-full lg:w-1/3 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search products by name / brand…"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              …
            </div>
          )}

          {focused && suggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border w-full mt-1 rounded-lg max-h-64 overflow-auto">
              {suggestions.map((p) => (
                <li
                  key={p._id}
                  onClick={() => handleSelectFromSearch(p)}
                  className="px-3 py-2 flex items-center space-x-3 hover:bg-gray-100 cursor-pointer"
                >
                  <img
                    src={p.images?.[0] || "https://via.placeholder.com/40"}
                    alt={p.productName}
                    className="w-8 h-8 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{p.productName}</div>
                    <div className="text-xs text-gray-600">
                      ₦{p.sellingPrice.toLocaleString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ───── available-products slider (compact) ───── */}
      <section>
        <h3 className="mb-3 font-medium text-gray-700">Available products</h3>

        <div className="border rounded-lg overflow-x-auto pb-2">
          <div
            /* 3 rows, flows horizontally  – card min-width is now 180 px */
            className="grid grid-rows-3 gap-4 auto-cols-[90px] sm:auto-cols-[110px] md:auto-cols-[160px] grid-flow-col"
          >
            {allProducts.map((p) => (
              <label
                key={p._id}
                className="  p-2 flex items-center gap-3 cursor-pointer
                     hover:border-orange-400 transition-colors"
              >
                {/* image + checkbox (16 px) */}
                <div className="relative shrink-0">
                  <img
                    src={p.images?.[0] || "https://via.placeholder.com/64"}
                    alt={p.productName}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <input
                    type="checkbox"
                    aria-label="select product"
                    className="accent-orange-500 w-4 h-4 absolute top-1 left-1"
                    checked={isSelected(p._id)}
                    onChange={() => toggleSelect(p)}
                  />
                </div>

                {/* name & price */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{p.productName}</p>
                  <p className="text-xs font-semibold text-gray-700">
                    ₦{p.sellingPrice.toLocaleString()}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* ───── selected lines ───── */}
      <div className="space-y-4">
        {items.map((it) => (
          <SelectedItemCard
            key={it.id}
            product={it}
            expanded={it.expanded}
            onToggle={() => updateItem(it.id, { expanded: !it.expanded })}
            onQtyChange={(id, qty) => updateItem(id, { qty })}
            onSpecChange={(id, f, v) => updateItem(id, { [f]: v })}
            onDelete={(id) =>
              setItems((prev) => prev.filter((l) => l.id !== id))
            }
          />
        ))}
      </div>

      {/* ───── summary ───── */}
      <div className="max-w-md ml-auto space-y-4">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>NGN {subtotal.toLocaleString()}</span>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-gray-600">Tax %</label>
          <input
            type="number"
            value={taxPercent}
            onChange={(e) => setTax(Number(e.target.value))}
            className="w-16 px-2 py-1 border rounded-lg"
          />
          <span className="flex-1 text-right text-gray-600">
            = NGN{" "}
            {taxTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>
            NGN {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* ───── nav buttons ───── */}
      {!hideNav && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg"
          >
            Go back
          </button>
          <button
            onClick={() => onNext({ taxPercent })}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
