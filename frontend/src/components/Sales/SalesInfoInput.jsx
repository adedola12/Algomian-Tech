/*  src/components/SalesInfoInput.jsx  */
import React, { useState, useEffect } from "react";
import axios           from "axios";
import { FiSearch }    from "react-icons/fi";
import SelectedItemCard from "./SelectedItemCard";

export default function SalesInfoInput({
  items,
  setItems,
  onBack            = () => {},
  onNext            = () => {},
  hideNav           = false,  // ← hide Go-back / Next when editing
  initialTaxPercent = 0,      // ← pre-fill tax %
}) {
  const [query, setQuery]         = useState("");
  const [allProducts, setAll]     = useState([]);
  const [suggestions, setSug]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [focused, setFocused]     = useState(false);
  const [taxPercent, setTax]      = useState(initialTaxPercent);

  /* ── sync if parent opens another order ────────────────────────── */
  useEffect(() => setTax(initialTaxPercent), [initialTaxPercent]);

  /* ── fetch full catalogue once ────────────────────────────────── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/products?search=&page=1&limit=100",
                                         { withCredentials: true });
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
          ? data.products
          : [];
        setAll(list);   setSug(list);
      } catch (e) { console.error(e); }
      finally   { setLoading(false);  }
    })();
  }, []);

  /* ── debounced search ─────────────────────────────────────────── */
  useEffect(() => {
    if (!query.trim()) return setSug(allProducts);
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `/api/products?search=${encodeURIComponent(query)}&page=1&limit=50`
        );
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
          ? data.products
          : [];
        setSug(list);
      } catch { setSug([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query, allProducts]);

  /* ── add product line ─────────────────────────────────────────── */
  const handleSelect = (p) => {
    const newLine = {
      id:           p._id,
      image:        p.images?.[0] || "",
      name:         p.productName,
      baseRam:      p.baseRam,       //  ✓ specs preserved
      baseStorage:  p.baseStorage,
      baseCPU:      p.baseCPU,
      price:        p.sellingPrice,
      qty:          1,
      maxQty:       p.quantity,
      expanded:     false,
    };
    setItems((prev) => [...prev, newLine]);
    setQuery("");      setSug(allProducts);      setFocused(true);
  };

  /* helpers */
  const updateItem = (id, changes) =>
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...changes } : x)));
  const removeItem = (id) => setItems((prev) => prev.filter((x) => x.id !== id));

  /* money */
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const taxTotal = (subtotal * taxPercent) / 100;
  const total    = subtotal + taxTotal;

  /* ── render ───────────────────────────────────────────────────── */
  return (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-6 space-y-6">

      {/* header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-semibold text-gray-800">Sales Management</h2>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">Sales</button>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg"
            >
              Sales History
            </button>
          </div>
        </div>

        {/* search */}
        <div className="w-full lg:w-1/3 relative">
          <FiSearch className="absolute left-3 top-12 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search products by name / brand…"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {loading && <div className="absolute right-3 top-12 text-gray-500">…</div>}

          {focused && suggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border w-full mt-1 rounded-lg max-h-64 overflow-auto">
              {suggestions.map((p) => (
                <li
                  key={p._id}
                  onClick={() => handleSelect(p)}
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
                      {p.brand} — ₦{p.costPrice.toLocaleString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* order lines */}
      <div className="space-y-4">
        {items.map((it) => (
          <SelectedItemCard
            key={it.id}
            product={it}
            expanded={it.expanded}
            onToggle={() => updateItem(it.id, { expanded: !it.expanded })}
            onQtyChange={(id, qty) => updateItem(id, { qty })}
            onSpecChange={(id, f, v)   => updateItem(id, { [f]: v })}
            onRemove={removeItem}
          />
        ))}
      </div>

      {/* summary */}
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
            = NGN {taxTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>NGN {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* nav buttons (hidden in edit-modal) */}
      {!hideNav && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg"
          >
            Go back
          </button>
          <button
            onClick={onNext}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
