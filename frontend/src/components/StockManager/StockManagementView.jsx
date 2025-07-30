import { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

export default function StockManagementView() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(false);
  const [restockTarget, setRestockTarget] = useState(null);
  const [totalStock, setTotalStock] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
  setLoading(true);
  try {
    const res = await api.get("/api/products/grouped");
    setData(res.data.grouped);
    setTotalStock(res.data.totalStock);
  } catch (err) {
    toast.error("Error fetching stock data");
  } finally {
    setLoading(false);
  }
};

  const updateReorderLevel = async (productName, level) => {
    const match = data.find((d) => d._id === productName);
    if (!match) return;
    try {
      await Promise.all(
        match.productIds.map((id) =>
          api.put(`/api/products/${id}`, { reorderLevel: level })
        )
      );
      toast.success("Reorder level updated");
      fetchData();
    } catch {
      toast.error("Update failed");
    }
  };

  const filtered = data
    .filter((d) => d._id.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortAsc ? a._id.localeCompare(b._id) : b._id.localeCompare(a._id)
    );

  const reorderInputColor = (qty, level) =>
    qty === 0
      ? "bg-red-100 border-red-400 text-red-800"
      : qty <= level
      ? "bg-yellow-100 border-yellow-400 text-yellow-800"
      : "bg-green-100 border-green-400 text-green-800";

  return (
    <section className="bg-white p-5 rounded-2xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Stock Overview</h2>
        <div className="text-sm text-gray-600 mb-2">
          <strong>Total Stock Available:</strong> {totalStock}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="border rounded px-3 py-2 text-sm w-64"
        />
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
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="py-3">{item.displayName}</td>
                  <td>{item.brand}</td>
                  <td>{item.category}</td>
                  <td>{item.totalQuantity}</td>
                  <td>
                    <input
                      type="number"
                      defaultValue={item.reorderLevel}
                      className={`border rounded px-2 py-1 w-24 ${reorderInputColor(
                        item.totalQuantity,
                        item.reorderLevel
                      )}`}
                      onBlur={(e) =>
                        updateReorderLevel(
                          item.displayName,
                          Number(e.target.value)
                        )
                      }
                    />
                  </td>
                  <td>
                    {item.totalQuantity === 0 ? (
                      <span className="text-red-500 font-semibold">
                        Out of stock
                      </span>
                    ) : item.totalQuantity <= item.reorderLevel ? (
                      <span className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
                        Restock now!
                      </span>
                    ) : (
                      <span className="text-green-500">OK</span>
                    )}
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => setRestockTarget(item.displayName)}
                      className="text-blue-500 underline text-sm"
                    >
                      Restock
                    </button>
                  </td>
                </tr>
              ))}
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

      {/* Restock Modal */}
      {restockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">
              Restock: {restockTarget._id}
            </h3>
            <p className="mb-2 text-sm text-gray-600">
              This will open a restock form or trigger inventory update logic.
            </p>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setRestockTarget(null)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success("Restock initiated");
                  setRestockTarget(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
