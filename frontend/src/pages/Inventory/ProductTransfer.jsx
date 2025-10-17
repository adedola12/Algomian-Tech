// src/pages/Inventory/ProductTransfer.jsx
import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiArrowRight, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import { fetchProducts } from "../../api";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function ProductTransfer() {
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW: search + totals
  const [query, setQuery] = useState("");
  const [totalAll, setTotalAll] = useState(0);
  const [totalSelected, setTotalSelected] = useState(0);

  // selection
  const [targetLocation, setTargetLocation] = useState("");
  const [checked, setChecked] = useState({}); // productId -> boolean
  const [qty, setQty] = useState({}); // productId -> number

  const loadLocations = async () => {
    const { data } = await axios.get("/api/locations");
    setLocations(data || []);
    if (!targetLocation && data?.[0]) setTargetLocation(data[0].name);
  };

  const loadProducts = async (loc) => {
    setLoading(true);
    try {
      // 1) total across ALL locations (for the badge)
      const totalResp = await fetchProducts({
        limit: 1,
        page: 1,
        search: query,
        inStockOnly: 1,
      });
      setTotalAll(Number(totalResp?.total || 0));

      // 2) rows for the selected tab
      const { products: list = [], total: selTotal = 0 } = await fetchProducts({
        limit: 1000,
        search: query,
        inStockOnly: 1,
        ...(loc && loc !== "All" ? { stockLocation: loc } : {}),
      });

      setProducts(list);
      setTotalSelected(selTotal);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);
  useEffect(() => {
    loadProducts(activeTab);
    setChecked({});
    setQty({});
  }, [activeTab, query]);

  const tabs = useMemo(
    () => ["All", ...locations.map((l) => l.name)],
    [locations]
  );

  const toggle = (id, max) => {
    setChecked((p) => ({ ...p, [id]: !p[id] }));
    setQty((p) => ({ ...p, [id]: Math.min(p[id] || 1, max || 1) || 1 }));
  };

  const doAddLocation = async () => {
    const name = window.prompt("New location name:");
    if (!name) return;
    try {
      await axios.post("/api/locations", { name });
      toast.success("Location added");
      loadLocations();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add location");
    }
  };

  const doTransfer = async () => {
    const list = products
      .filter((p) => checked[p._id])
      .map((p) => ({
        productId: p._id,
        qty: Math.max(
          1,
          Math.min(Number(qty[p._id] || 1), Number(p.quantity || 0))
        ),
      }));
    if (!list.length) return toast.warn("Select at least one product");

    const fromLocation =
      activeTab === "All" ? user?.location || "Lagos" : activeTab;
    if (!fromLocation) return toast.error("Choose a source tab");
    if (!targetLocation || targetLocation === fromLocation)
      return toast.error("Pick a different destination");

    try {
      const { data } = await axios.post("/api/products/transfer", {
        fromLocation,
        toLocation: targetLocation,
        items: list,
      });
      const ok = data.results?.filter((r) => r.ok).length || 0;
      const bad = (data.results?.length || 0) - ok;
      if (ok) toast.success(`Transferred ${ok} item(s)`);
      if (bad) toast.warn(`${bad} item(s) failed`);
      loadProducts(activeTab);
      setChecked({});
      setQty({});
    } catch (e) {
      toast.error(e?.response?.data?.message || "Transfer failed");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header / actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold">Product Transfer</h2>

        {/* mobile-friendly action bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Move to</span>
            <select
              value={targetLocation}
              onChange={(e) => setTargetLocation(e.target.value)}
              className="border rounded-lg px-2 py-2 text-sm"
            >
              {locations.map((l) => (
                <option key={l._id} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
            <button
              onClick={doTransfer}
              className="px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-2"
            >
              Transfer <FiArrowRight />
            </button>
          </div>

          <button
            onClick={doAddLocation}
            className="px-3 py-2 rounded-lg border hover:bg-gray-50 flex items-center gap-2"
          >
            <FiPlus /> Add location
          </button>
        </div>
      </div>

      {/* Search + Totals */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full border rounded-lg pl-9 pr-3 py-2"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-gray-100 px-3 py-1">
            All locations: <b>{totalAll}</b>
          </span>
          <span className="rounded-full bg-orange-50 text-orange-700 px-3 py-1">
            {activeTab} : <b>{totalSelected}</b>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3 py-1.5 rounded-full border text-sm ${
              t === activeTab
                ? "bg-orange-100 text-orange-600 border-orange-200"
                : "hover:bg-gray-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List – table on desktop, cards on mobile */}
      <div className="bg-white rounded-xl border">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-3 py-2 w-10"></th>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Brand</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Move</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-3 py-6 text-center" colSpan={6}>
                    Loading…
                  </td>
                </tr>
              ) : products.length ? (
                products.map((p) => (
                  <tr key={p._id} className="border-t">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={!!checked[p._id]}
                        onChange={() => toggle(p._id, p.quantity)}
                      />
                    </td>
                    <td className="px-3 py-2">{p.productName}</td>
                    <td className="px-3 py-2">{p.brand || "—"}</td>
                    <td className="px-3 py-2">{p.stockLocation || "Lagos"}</td>
                    <td className="px-3 py-2">{p.quantity}</td>
                    <td className="px-3 py-2 w-40">
                      <input
                        type="number"
                        min={1}
                        max={Math.max(1, Number(p.quantity || 0))}
                        disabled={!checked[p._id]}
                        value={qty[p._id] || 1}
                        onChange={(e) =>
                          setQty((prev) => ({
                            ...prev,
                            [p._id]: Math.min(
                              Math.max(1, Number(e.target.value || 1)),
                              Number(p.quantity || 0)
                            ),
                          }))
                        }
                        className="w-24 border rounded-lg px-2 py-1 disabled:opacity-50"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-6 text-center" colSpan={6}>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading…
            </div>
          ) : products.length ? (
            products.map((p) => (
              <label key={p._id} className="flex gap-3 items-center p-3">
                <input
                  type="checkbox"
                  checked={!!checked[p._id]}
                  onChange={() => toggle(p._id, p.quantity)}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.productName}</div>
                  <div className="text-xs text-gray-600">
                    {p.brand || "—"} • {p.stockLocation || "Lagos"} • Qty:{" "}
                    {p.quantity}
                  </div>
                </div>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, Number(p.quantity || 0))}
                  disabled={!checked[p._id]}
                  value={qty[p._id] || 1}
                  onChange={(e) =>
                    setQty((prev) => ({
                      ...prev,
                      [p._id]: Math.min(
                        Math.max(1, Number(e.target.value || 1)),
                        Number(p.quantity || 0)
                      ),
                    }))
                  }
                  className="w-20 border rounded-lg px-2 py-1 text-sm disabled:opacity-50"
                />
              </label>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No products found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
