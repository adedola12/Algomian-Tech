import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";

const columns = [
  "Name",
  "Brand",
  "CPU",
  "RAM",
  "Storage",
  "Serial Number",
  "Supplier",
];

const createEmptyRow = () => ({
  productName: "",
  brand: "",
  baseCPU: "",
  baseRam: "",
  baseStorage: "",
  serialNumber: "",
  supplier: "",
});

const BulkAddProduct = () => {
  const [rows, setRows] = useState(
    Array.from({ length: 10 }, () => createEmptyRow())
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (idx, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  const addNewRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const handleSubmit = async () => {
    const validRows = rows.filter((row) => row.productName && row.brand);
    if (!validRows.length)
      return toast.error("Please fill at least one product correctly");

    try {
      setLoading(true);
      await api.post("/api/products/bulk", { products: validRows });
      toast.success("Products added successfully!");
      setRows(Array.from({ length: 10 }, () => createEmptyRow()));
    } catch (e) {
      toast.error(e.response?.data?.message || "Error adding products");
      console.error("Bulk add error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Bulk Add Products</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-medium">
              {columns.map((col) => (
                <th key={col} className="p-2 border">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="text-sm">
                <td className="p-2 border">
                  <input
                    value={row.productName}
                    onChange={(e) =>
                      handleChange(idx, "productName", e.target.value)
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    value={row.brand}
                    onChange={(e) => handleChange(idx, "brand", e.target.value)}
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    value={row.baseCPU}
                    onChange={(e) =>
                      handleChange(idx, "baseCPU", e.target.value)
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    value={row.baseRam}
                    onChange={(e) =>
                      handleChange(idx, "baseRam", e.target.value)
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    value={row.baseStorage}
                    onChange={(e) =>
                      handleChange(idx, "baseStorage", e.target.value)
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    value={row.serialNumber}
                    onChange={(e) =>
                      handleChange(idx, "serialNumber", e.target.value)
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    value={row.supplier}
                    onChange={(e) =>
                      handleChange(idx, "supplier", e.target.value)
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={addNewRow}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          + Add Row
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          {loading ? "Adding..." : "Save Products"}
        </button>
      </div>
    </div>
  );
};

export default BulkAddProduct;
