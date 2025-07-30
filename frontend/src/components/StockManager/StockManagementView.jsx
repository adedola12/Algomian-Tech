import { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

export default function StockManagementView() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(false);
  const [totalStock, setTotalStock] = useState(0);

  const [reorderInputs, setReorderInputs] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/products/grouped");
      setData(res.data.grouped);
      setTotalStock(res.data.totalStock);

      const inputs = {};
      const saveState = {};
      res.data.grouped.forEach((item) => {
        inputs[item.displayName] = item.reorderLevel;
        saveState[item.displayName] = false;
      });
      setReorderInputs(inputs);
      setSaving(saveState);
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

  const filtered = data
    .filter((d) => d.displayName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortAsc
        ? a.displayName.localeCompare(b.displayName)
        : b.displayName.localeCompare(a.displayName)
    );

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
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
        >
          Save All Reorder Levels
        </button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm border-collapse">
            <thead className="text-left border-b text-gray-500">
              <tr>
                <th
                  className="cursor-pointer py-3"
                  onClick={() => setSortAsc(!sortAsc)}
                >
                  Product Name {sortAsc ? "▲" : "▼"}
                </th>
                <th>Brand</th>
                <th>Category</th>
                <th>Total Qty</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th className="text-center">Save</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
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
                  if (item.totalQuantity === 0) {
                    return (
                      <span className="text-red-600 font-medium">
                        Out of stock
                      </span>
                    );
                  } else if (item.totalQuantity <= currentLevel) {
                    return (
                      <span className="text-orange-500 font-medium">
                        Low stock
                      </span>
                    );
                  } else {
                    return (
                      <span className="text-green-600 font-medium">
                        In stock
                      </span>
                    );
                  }
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
                        className="text-blue-500 hover:text-blue-700 text-sm"
                        title="Save reorder level"
                      >
                        💾
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No matching products
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
