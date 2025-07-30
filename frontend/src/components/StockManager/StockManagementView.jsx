import { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

export default function StockManagementView() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/products/grouped");
      setData(res.data);
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <section className="bg-white p-5 rounded shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Stock Overview</h2>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead className="border-b text-left">
            <tr>
              <th>Product Name</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Total Qty</th>
              <th>Reorder Level</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id} className="border-b hover:bg-gray-50">
                <td>{item._id}</td>
                <td>{item.brand}</td>
                <td>{item.category}</td>
                <td>{item.totalQuantity}</td>
                <td>
                  <input
                    type="number"
                    defaultValue={item.reorderLevel}
                    className="border px-2 py-1 w-20 rounded"
                    onBlur={(e) =>
                      updateReorderLevel(item._id, Number(e.target.value))
                    }
                  />
                </td>
                <td>
                  {item.totalQuantity === 0 ? (
                    <span className="text-red-500 font-semibold">
                      Out of stock
                    </span>
                  ) : item.totalQuantity <= item.reorderLevel ? (
                    <span className="text-yellow-500">Low</span>
                  ) : (
                    <span className="text-green-500">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
