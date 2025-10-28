import { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

const firstThreeWords = (s = "") => {
  const words = String(s).trim().split(/\s+/);
  if (words.length <= 3) return s;
  return `${words.slice(0, 3).join(" ")}…`;
};

export default function StockManagementView() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [sortBy, setSortBy] = useState("name"); // "name" | "status"
  const [loading, setLoading] = useState(false);
  const [totalStock, setTotalStock] = useState(0);

  const [reorderInputs, setReorderInputs] = useState({});
  const [saving, setSaving] = useState({});

  // mobile: toggle to show hidden columns
  const [showMoreCols, setShowMoreCols] = useState(false);

  // ── pagination ─────────────────────────────────────────────
  const PAGE_SIZE = 25;
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const handleSortToggle = (key) => {
    setSortBy((prevKey) => {
      if (prevKey === key) {
        setSortAsc((prev) => !prev);
        return prevKey;
      }
      setSortAsc(true);
      return key;
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/products/grouped");
      setData(res.data.grouped || []);
      setTotalStock(res.data.totalStock || 0);

      const inputs = {};
      const saveState = {};
      (res.data.grouped || []).forEach((item) => {
        inputs[item.displayName] = item.reorderLevel;
        saveState[item.displayName] = false;
      });
      setReorderInputs(inputs);
      setSaving(saveState);
      setPage(1);
    } catch (err) {
      toast.error("Error fetching stock data");
    } finally {
      setLoading(false);
    }
  };

  const updateReorderLevel = async (productName) => {
    const match = data.find((d) => d.displayName === productName);
    const level = reorderInputs[productName];
    if (!match) return;

    setSaving((prev) => ({ ...prev, [productName]: true }));
    try {
      await Promise.all(
        match.productIds.map((id) =>
          api.put(`/api/products/${id}`, { reorderLevel: level })
        )
      );
      toast.success(`Saved: ${productName}`);
    } catch {
      toast.error(`Failed to save: ${productName}`);
    } finally {
      setSaving((prev) => ({ ...prev, [productName]: false }));
    }
  };

  const updateAllReorderLevels = async () => {
    const updates = data.map(async (item) => {
      const level = reorderInputs[item.displayName];
      try {
        await Promise.all(
          item.productIds.map((id) =>
            api.put(`/api/products/${id}`, { reorderLevel: level })
          )
        );
      } catch {
        throw new Error(`Failed to update ${item.displayName}`);
      }
    });

    try {
      await Promise.all(updates);
      toast.success("All reorder levels saved successfully");
      fetchData();
    } catch (e) {
      toast.error("Some reorder levels failed to save");
    }
  };

  /* ---------- status helpers ---------- */
  const getStatusRank = (item, currentLevel) => {
    if (item.totalQuantity === 0) return 0; // Out of stock
    if (item.totalQuantity <= currentLevel) return 1; // Low stock
    return 2; // In stock
  };

  const getStatusLabel = (item, currentLevel) => {
    const r = getStatusRank(item, currentLevel);
    return r === 0 ? "Out of stock" : r === 1 ? "Low stock" : "In stock";
  };

  const getStatusDotClass = (item, currentLevel) => {
    const r = getStatusRank(item, currentLevel);
    // colors for the tiny dot on <=360px
    return r === 0 ? "bg-red-500" : r === 1 ? "bg-orange-500" : "bg-green-500";
  };

  // ── filter + sort ──────────────────────────────────────────
  const filtered = (data || [])
    .filter((d) => d.displayName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "status") {
        const aLevel = reorderInputs[a.displayName] ?? a.reorderLevel;
        const bLevel = reorderInputs[b.displayName] ?? b.reorderLevel;
        const ra = getStatusRank(a, aLevel);
        const rb = getStatusRank(b, bLevel);
        return sortAsc ? ra - rb : rb - ra;
      } else {
        return sortAsc
          ? a.displayName.localeCompare(b.displayName)
          : b.displayName.localeCompare(a.displayName);
      }
    });

  useEffect(() => {
    setPage(1);
  }, [search, sortAsc, sortBy, data]);

  // ── pagination derivations ─────────────────────────────────
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const start = (clampedPage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, totalItems);
  const pageRows = filtered.slice(start, end);

  // derive counts for badges
  const counts = (() => {
    let inStock = 0,
      low = 0,
      out = 0;
    (data || []).forEach((item) => {
      const lvl = reorderInputs[item.displayName] ?? item.reorderLevel;
      const r = getStatusRank(item, lvl);
      if (r === 2) inStock++;
      else if (r === 1) low++;
      else out++;
    });
    return { inStock, low, out };
  })();

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));

  // helpers: hide on mobile (unless toggled)
  const hideOnMobile = (extra = "") =>
    `${showMoreCols ? "table-cell" : "hidden"} md:table-cell ${extra}`;

  return (
    <section className="bg-white p-4 sm:p-5 rounded-2xl shadow">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Stock Overview</h2>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="text-xs sm:text-sm text-gray-600">
            <strong>Total Stock Available:</strong> {totalStock}
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="border rounded px-2 py-1 text-sm w-40 sm:w-64"
          />

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setShowMoreCols((s) => !s)}
            className="md:hidden border rounded px-2 py-1 text-xs"
          >
            {showMoreCols ? "Hide extra columns" : "View more columns"}
          </button>

          <button
            onClick={updateAllReorderLevels}
            className="bg-orange-500 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-orange-600"
          >
            Save All Reorder Levels
          </button>
        </div>
      </div>

      {/* Status counters */}
      <div className="flex flex-wrap gap-2 mb-3 text-xs sm:text-sm">
        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">
          In stock: {counts.inStock}
        </span>
        <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700">
          Low stock: {counts.low}
        </span>
        <span className="px-2 py-1 rounded-full bg-red-100 text-red-700">
          Out of stock: {counts.out}
        </span>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            {/* md+ enforces layout width; mobile stays fluid */}
            <table className="w-full text-sm md:min-w-[900px] border-collapse">
              <thead className="text-left border-b text-gray-500">
                <tr className="[&>th]:py-2 md:[&>th]:py-3">
                  <th
                    className="cursor-pointer w-[46%] sm:w-auto"
                    onClick={() => handleSortToggle("name")}
                    title="Sort by name"
                  >
                    Product Name{" "}
                    {sortBy === "name" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  {/* Hidden by default on mobile, available via toggle */}
                  <th className={hideOnMobile("w-[14%]")}>Brand</th>
                  <th className={hideOnMobile("w-[14%]")}>Category</th>

                  <th className="w-[14%]">Total Qty</th>

                  <th className={hideOnMobile("w-[16%]")}>Reorder Level</th>

                  <th
                    className="cursor-pointer w-[12%]"
                    onClick={() => handleSortToggle("status")}
                    title="Sort by status"
                  >
                    Status {sortBy === "status" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>

                  <th className={hideOnMobile("text-center w-[10%]")}>Save</th>
                </tr>
              </thead>

              <tbody>
                {pageRows.map((item) => {
                  const currentLevel =
                    reorderInputs[item.displayName] ?? item.reorderLevel;
                  const isSaving = saving[item.displayName];

                  const inputColor =
                    item.totalQuantity === 0
                      ? "bg-red-100 border-red-400 text-red-800"
                      : item.totalQuantity <= currentLevel
                      ? "bg-orange-100 border-orange-400 text-orange-800"
                      : "bg-green-100 border-green-400 text-green-800";

                  const label = getStatusLabel(item, currentLevel);
                  const dotClass = getStatusDotClass(item, currentLevel);

                  return (
                    <tr
                      key={item._id}
                      className="border-b hover:bg-gray-50 [&&>td]:py-2 md:[&&>td]:py-3"
                    >
                      {/* Product Name (3 words on mobile) */}
                      <td className="align-middle">
                        <span
                          className="inline-block max-w-[180px] sm:max-w-none truncate text-sm"
                          title={item.displayName}
                        >
                          {firstThreeWords(item.displayName)}
                        </span>
                      </td>

                      {/* Brand (hidden on mobile unless toggled) */}
                      <td className={hideOnMobile("align-middle")}>
                        {item.brand || "—"}
                      </td>

                      {/* Category (hidden on mobile unless toggled) */}
                      <td className={hideOnMobile("align-middle")}>
                        {item.category || "—"}
                      </td>

                      {/* Total Qty (always visible) */}
                      <td className="align-middle">{item.totalQuantity}</td>

                      {/* Reorder Level input (hidden on mobile unless toggled) */}
                      <td className={hideOnMobile("align-middle")}>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={currentLevel}
                            onChange={(e) =>
                              setReorderInputs((prev) => ({
                                ...prev,
                                [item.displayName]: Number(e.target.value),
                              }))
                            }
                            className={`border rounded px-2 py-1 w-16 sm:w-20 ${inputColor}`}
                          />
                        </div>
                      </td>

                      {/* Status: text normally; on <=360px show only a colored dot with tooltip */}
                      <td className="align-middle">
                        {/* Text label (hidden on very small screens) */}
                        <span className="max-[360px]:hidden text-sm font-medium">
                          {label === "Out of stock" ? (
                            <span className="text-red-600">Out of stock</span>
                          ) : label === "Low stock" ? (
                            <span className="text-orange-500">Low stock</span>
                          ) : (
                            <span className="text-green-600">In stock</span>
                          )}
                        </span>

                        {/* Dot for tiny screens (<=360px) */}
                        <span
                          className={`hidden max-[360px]:inline-block h-2.5 w-2.5 rounded-full align-middle ${dotClass}`}
                          title={label}
                          aria-label={label}
                        />
                      </td>

                      {/* Save button (hidden on mobile unless toggled) */}
                      <td className={hideOnMobile("text-center align-middle")}>
                        <button
                          disabled={isSaving}
                          onClick={() => updateReorderLevel(item.displayName)}
                          className="text-blue-500 hover:text-blue-700 text-sm disabled:opacity-50"
                          title="Save reorder level"
                        >
                          💾
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {!pageRows.length && (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-500">
                      No matching products
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── pagination controls ─────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">
                {totalItems === 0 ? 0 : start + 1}
              </span>{" "}
              – <span className="font-medium">{end}</span> of{" "}
              <span className="font-medium">{totalItems}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={clampedPage === 1}
                className="px-3 py-1.5 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {clampedPage} / {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={clampedPage === totalPages}
                className="px-3 py-1.5 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
