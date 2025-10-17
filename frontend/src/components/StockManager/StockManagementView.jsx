import { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

export default function StockManagementView() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [sortBy, setSortBy] = useState("name"); // "name" | "status"
  const [loading, setLoading] = useState(false);
  const [totalStock, setTotalStock] = useState(0);

  const [reorderInputs, setReorderInputs] = useState({});
  const [saving, setSaving] = useState({});

  // ── pagination ─────────────────────────────────────────────
  const PAGE_SIZE = 25;
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const handleSortToggle = (key) => {
    setSortBy((prevKey) => {
      if (prevKey === key) {
        setSortAsc((prev) => !prev); // same column → flip direction
        return prevKey;
      }
      setSortAsc(true); // new column → default to ascending
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
      setPage(1); // reset to first page on fresh load
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

  /* ---------- status helpers (declare BEFORE use) ---------- */
  const getStatusRank = (item, currentLevel) => {
    if (item.totalQuantity === 0) return 0; // Out of stock
    if (item.totalQuantity <= currentLevel) return 1; // Low stock
    return 2; // In stock
  };

  const getStatusLabel = (item, currentLevel) => {
    const r = getStatusRank(item, currentLevel);
    return r === 0 ? "Out of stock" : r === 1 ? "Low stock" : "In stock";
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
        // name
        return sortAsc
          ? a.displayName.localeCompare(b.displayName)
          : b.displayName.localeCompare(a.displayName);
      }
    });

  // Reset to first page when filters/sort change
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

  return (
    <section className="bg-white p-5 rounded-2xl shadow">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <h2 className="text-xl font-semibold">Stock Overview</h2>

        <div className="text-sm text-gray-600">
          <strong>Total Stock Available:</strong> {totalStock}
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="border rounded px-3 py-2 text-sm w-64"
        />

        <button
          onClick={updateAllReorderLevels}
          className="bg-orange-500 text-white text-sm px-4 py-2 rounded hover:bg-orange-600"
        >
          Save All Reorder Levels
        </button>
      </div>

      {/* Status counters */}
      <div className="flex flex-wrap gap-2 mb-3 text-sm">
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
            <table className="w-full min-w-[900px] text-sm border-collapse">
              <thead className="text-left border-b text-gray-500">
                <tr>
                  <th
                    className="cursor-pointer py-3"
                    onClick={() => handleSortToggle("name")}
                    title="Sort by name"
                  >
                    Product Name{" "}
                    {sortBy === "name" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Total Qty</th>
                  <th>Reorder Level</th>
                  <th
                    className="cursor-pointer"
                    onClick={() => handleSortToggle("status")}
                    title="Sort by status"
                  >
                    Status {sortBy === "status" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th className="text-center">Save</th>
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

                  const statusBadge = () => {
                    const label = getStatusLabel(item, currentLevel);
                    if (label === "Out of stock") {
                      return (
                        <span className="text-red-600 font-medium">
                          Out of stock
                        </span>
                      );
                    } else if (label === "Low stock") {
                      return (
                        <span className="text-orange-500 font-medium">
                          Low stock
                        </span>
                      );
                    }
                    return (
                      <span className="text-green-600 font-medium">
                        In stock
                      </span>
                    );
                  };

                  return (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      <td className="py-3">{item.displayName}</td>
                      <td>{item.brand}</td>
                      <td>{item.category}</td>
                      <td>{item.totalQuantity}</td>
                      <td className="flex items-center gap-2 py-2">
                        <input
                          type="number"
                          value={currentLevel}
                          onChange={(e) =>
                            setReorderInputs((prev) => ({
                              ...prev,
                              [item.displayName]: Number(e.target.value),
                            }))
                          }
                          className={`border rounded px-2 py-1 w-20 ${inputColor}`}
                        />
                      </td>
                      <td>{statusBadge()}</td>
                      <td className="text-center">
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
                    <td colSpan="7" className="text-center py-6 text-gray-500">
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
