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

  // /* ───── Excel ⇢ table ───── */
  // const handlePaste = (e) => {
  //   const text = e.clipboardData?.getData("text");
  //   if (!text) return;
  //   e.preventDefault(); // stop the default “paste into one cell”

  //   // const lines = text.trim().split(/\r?\n/);
  //   // const parsedRows = lines.map((line) => {
  //   //   const cells = line.split("\t"); // Excel → tab-separated
  //   //   return {
  //   //     productName: cells[0] || "",
  //   //     brand: cells[1] || "",
  //   //     baseCPU: cells[2] || "",
  //   //     baseRam: cells[3] || "",
  //   //     baseStorage: cells[4] || "",
  //   //     serialNumber: cells[5] || "",
  //   //     supplier: cells[6] || "",
  //   //   };
  //   // });

  //   // setRows((prev) => {
  //   //   const copy = [...prev];
  //   //   // overwrite / extend existing rows
  //   //   parsedRows.forEach((row, idx) => {
  //   //     copy[idx] = { ...(copy[idx] || createEmptyRow()), ...row };
  //   //   });
  //   //   // ensure at least 10 blank rows stay visible
  //   //   while (copy.length < 10) copy.push(createEmptyRow());
  //   //   return copy;
  //   // });

  //   /** 1️⃣ split rows & cells (tab-separated) */
  //   const newRows = text
  //     .trim()
  //     .split(/\r?\n/)
  //     .map((line) => {
  //       const c = line.split("\t");
  //       return {
  //         productName: c[0] ?? "",
  //         brand: c[1] ?? "",
  //         baseCPU: c[2] ?? "",
  //         baseRam: c[3] ?? "",
  //         baseStorage: c[4] ?? "",
  //         serialNumber: c[5] ?? "",
  //         supplier: c[6] ?? "",
  //       };
  //     });
  //   /** 2️⃣ merge – APPEND when we run out of existing blank rows */
  //   setRows((prev) => {
  //     const out = [...prev];
  //     newRows.forEach((row, i) => {
  //       const idx = i; // row number inside paste block
  //       if (idx < out.length) {
  //         out[idx] = { ...out[idx], ...row };
  //       } else {
  //         out.push({ ...createEmptyRow(), ...row });
  //       }
  //     });
  //     /** 3️⃣ keep at least 10 empty rows underneath */
  //     while (out.length < 10) out.push(createEmptyRow());
  //     return out;
  //   });
  // };

  const FIELDS = [
    "productName",
    "brand",
    "baseCPU",
    "baseRam",
    "baseStorage",
    "serialNumber",
    "supplier",
  ];

  /** Excel / Google-Sheets paste -- handles
   *  • single value  -> fill-down
   *  • row block     -> paste vertically
   *  • row+col block -> paste matrix
   */
  const handleCellPaste = (e, rowIdx, colIdx) => {
    const text = e.clipboardData?.getData("text");
    if (!text) return;
    e.preventDefault();

    const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);

    setRows((prev) => {
      const out = [...prev];

      /* 1️⃣  MULTI-ROW (one or several columns) -------------------- */
      if (lines.length > 1 || lines[0].includes("\t")) {
        lines.forEach((line, r) => {
          const cells = line.split("\t");
          const targetRow = rowIdx + r;
          if (targetRow >= out.length) out.push(createEmptyRow()); // extend sheet
          cells.forEach((cell, c) => {
            const f = FIELDS[colIdx + c];
            if (f) out[targetRow][f] = cell.trim();
          });
        });
        while (out.length < 10) out.push(createEmptyRow());
        return out;
      }

      /* 2️⃣  SINGLE value  ->  fill-down in the current column ------ */
      const value = lines[0].trim();
      for (let r = rowIdx; r < out.length; r++) {
        out[r][FIELDS[colIdx]] = value;
      }
      return out;
    });
  };

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
                    onPasteCapture={(e) => handleCellPaste(e, idx, 0)}
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    value={row.brand}
                    onChange={(e) => handleChange(idx, "brand", e.target.value)}
                    onPasteCapture={(e) => handleCellPaste(e, idx, 1)}
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    value={row.baseCPU}
                    onChange={(e) =>
                      handleChange(idx, "baseCPU", e.target.value)
                    }
                    onPasteCapture={(e) => handleCellPaste(e, idx, 2)}
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    value={row.baseRam}
                    onChange={(e) =>
                      handleChange(idx, "baseRam", e.target.value)
                    }
                    onPasteCapture={(e) => handleCellPaste(e, idx, 3)}
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    value={row.baseStorage}
                    onChange={(e) =>
                      handleChange(idx, "baseStorage", e.target.value)
                    }
                    onPasteCapture={(e) => handleCellPaste(e, idx, 4)}
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    value={row.serialNumber}
                    onChange={(e) =>
                      handleChange(idx, "serialNumber", e.target.value)
                    }
                    onPasteCapture={(e) => handleCellPaste(e, idx, 5)}
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    value={row.supplier}
                    onChange={(e) =>
                      handleChange(idx, "supplier", e.target.value)
                    }
                    onPasteCapture={(e) => handleCellPaste(e, idx, 6)}
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
