import React, { useState } from "react";
import api from "../../api";

/* ---------------------- small modal ---------------------- */
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded p-2 hover:bg-gray-100"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">{children}</div>
        <div className="flex justify-end gap-2 border-t px-5 py-3">
          <button
            onClick={onClose}
            className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- helpers ---------------------- */
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

/* ---------------------- main component ---------------------- */
const BulkAddProduct = () => {
  const [rows, setRows] = useState(
    Array.from({ length: 10 }, () => createEmptyRow())
  );
  const [loading, setLoading] = useState(false);

  // mobile: which rows are expanded to show hidden fields
  const [expanded, setExpanded] = useState(() => new Set());

  // modals
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summary, setSummary] = useState({ added: 0, failed: 0, failures: [] });
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const FIELDS = [
    "productName",
    "brand",
    "baseCPU",
    "baseRam",
    "baseStorage",
    "serialNumber",
    "supplier",
  ];

  /** Excel/Sheets paste support (works in both layouts) */
  const handleCellPaste = (e, rowIdx, colIdx) => {
    const text = e.clipboardData?.getData("text");
    if (!text) return;
    e.preventDefault();

    const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);

    setRows((prev) => {
      const out = [...prev];

      // Multi-row / multi-col paste
      if (lines.length > 1 || lines[0].includes("\t")) {
        lines.forEach((line, r) => {
          const cells = line.split("\t");
          const targetRow = rowIdx + r;
          if (targetRow >= out.length) out.push(createEmptyRow());
          cells.forEach((cell, c) => {
            const f = FIELDS[colIdx + c];
            if (f) out[targetRow][f] = cell.trim();
          });
        });
        while (out.length < 10) out.push(createEmptyRow());
        return out;
      }

      // Single value → fill-down
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

  const toggleExpanded = (idx) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleSubmit = async () => {
    const validRows = rows
      .filter((row) => row.productName && row.productName.trim())
      .map((r) => ({
        ...r,
        productName: r.productName.trim(),
        brand: (r.brand || "").trim(),
      }));

    if (!validRows.length) {
      setErrorMsg("Please fill at least one product name");
      setErrorOpen(true);
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/api/products/bulk", {
        products: validRows,
      });
      setSummary({
        added: data.added ?? 0,
        failed: data.failed ?? 0,
        failures: Array.isArray(data.failures) ? data.failures : [],
      });
      setSummaryOpen(true);
      setRows(Array.from({ length: 10 }, () => createEmptyRow()));
      setExpanded(new Set());
    } catch (e) {
      setErrorMsg(e?.response?.data?.message || "Error adding products");
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded bg-white p-4 sm:p-6 shadow">
      <h2 className="mb-4 text-xl font-bold">Bulk Add Products</h2>

      {/* ───────────────── Mobile cards (default) ───────────────── */}
      <div className="space-y-3 md:hidden">
        {rows.map((row, idx) => {
          const isOpen = expanded.has(idx);
          return (
            <div key={idx} className="rounded-xl border border-gray-200 p-3">
              {/* Always-visible fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Name
                  </label>
                  <input
                    value={row.productName}
                    onChange={(e) =>
                      handleChange(idx, "productName", e.target.value)
                    }
                    onPasteCapture={(e) => handleCellPaste(e, idx, 0)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="e.g., EliteBook 840 G3"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Brand
                  </label>
                  <input
                    value={row.brand}
                    onChange={(e) => handleChange(idx, "brand", e.target.value)}
                    onPasteCapture={(e) => handleCellPaste(e, idx, 1)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="(optional)"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    CPU
                  </label>
                  <input
                    value={row.baseCPU}
                    onChange={(e) =>
                      handleChange(idx, "baseCPU", e.target.value)
                    }
                    onPasteCapture={(e) => handleCellPaste(e, idx, 2)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="e.g., i5-8350U"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    RAM
                  </label>
                  <input
                    value={row.baseRam}
                    onChange={(e) =>
                      handleChange(idx, "baseRam", e.target.value)
                    }
                    onPasteCapture={(e) => handleCellPaste(e, idx, 3)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="e.g., 8GB"
                  />
                </div>
              </div>

              {/* Hidden-on-mobile group */}
              {isOpen && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      Storage
                    </label>
                    <input
                      value={row.baseStorage}
                      onChange={(e) =>
                        handleChange(idx, "baseStorage", e.target.value)
                      }
                      onPasteCapture={(e) => handleCellPaste(e, idx, 4)}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      placeholder="e.g., 256GB SSD"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      Serial Number
                    </label>
                    <input
                      value={row.serialNumber}
                      onChange={(e) =>
                        handleChange(idx, "serialNumber", e.target.value)
                      }
                      onPasteCapture={(e) => handleCellPaste(e, idx, 5)}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      placeholder="(optional)"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      Supplier
                    </label>
                    <input
                      value={row.supplier}
                      onChange={(e) =>
                        handleChange(idx, "supplier", e.target.value)
                      }
                      onPasteCapture={(e) => handleCellPaste(e, idx, 6)}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      placeholder="(optional)"
                    />
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => toggleExpanded(idx)}
                  className="text-xs font-semibold text-orange-600"
                >
                  {isOpen ? "Hide extra fields" : "More fields"}
                </button>

                <button
                  onClick={() =>
                    setRows((prev) => {
                      const next = [...prev];
                      next.splice(idx + 1, 0, createEmptyRow());
                      return next;
                    })
                  }
                  className="rounded border px-3 py-1.5 text-xs hover:bg-gray-50"
                >
                  + Add Row Below
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ───────────────── Desktop table (md and up) ───────────────── */}
      <div className="mt-4 hidden md:block">
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-700">
                {columns.map((col) => (
                  <th key={col} className="border-b px-3 py-2">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="text-sm">
                  <td className="border-b px-3 py-2">
                    <input
                      value={row.productName}
                      onChange={(e) =>
                        handleChange(idx, "productName", e.target.value)
                      }
                      onPasteCapture={(e) => handleCellPaste(e, idx, 0)}
                      className="w-full rounded border px-2 py-1"
                    />
                  </td>
                  <td className="border-b px-3 py-2">
                    <input
                      value={row.brand}
                      onChange={(e) =>
                        handleChange(idx, "brand", e.target.value)
                      }
                      onPasteCapture={(e) => handleCellPaste(e, idx, 1)}
                      className="w-full rounded border px-2 py-1"
                      placeholder="(optional)"
                    />
                  </td>
                  <td className="border-b px-3 py-2">
                    <input
                      value={row.baseCPU}
                      onChange={(e) =>
                        handleChange(idx, "baseCPU", e.target.value)
                      }
                      onPasteCapture={(e) => handleCellPaste(e, idx, 2)}
                      className="w-full rounded border px-2 py-1"
                    />
                  </td>
                  <td className="border-b px-3 py-2">
                    <input
                      value={row.baseRam}
                      onChange={(e) =>
                        handleChange(idx, "baseRam", e.target.value)
                      }
                      onPasteCapture={(e) => handleCellPaste(e, idx, 3)}
                      className="w-full rounded border px-2 py-1"
                    />
                  </td>
                  <td className="border-b px-3 py-2">
                    <input
                      value={row.baseStorage}
                      onChange={(e) =>
                        handleChange(idx, "baseStorage", e.target.value)
                      }
                      onPasteCapture={(e) => handleCellPaste(e, idx, 4)}
                      className="w-full rounded border px-2 py-1"
                    />
                  </td>
                  <td className="border-b px-3 py-2">
                    <input
                      value={row.serialNumber}
                      onChange={(e) =>
                        handleChange(idx, "serialNumber", e.target.value)
                      }
                      onPasteCapture={(e) => handleCellPaste(e, idx, 5)}
                      className="w-full rounded border px-2 py-1"
                    />
                  </td>
                  <td className="border-b px-3 py-2">
                    <input
                      value={row.supplier}
                      onChange={(e) =>
                        handleChange(idx, "supplier", e.target.value)
                      }
                      onPasteCapture={(e) => handleCellPaste(e, idx, 6)}
                      className="w-full rounded border px-2 py-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => setRows((prev) => [...prev, createEmptyRow()])}
          className="rounded border px-4 py-2 hover:bg-gray-100"
        >
          + Add Row
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 disabled:opacity-70"
        >
          {loading ? "Adding..." : "Save Products"}
        </button>
      </div>

      {/* Success / Partial-success summary */}
      <Modal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        title="Bulk Add Summary"
      >
        <div className="space-y-3">
          <p className="text-sm">
            <span className="font-semibold">Added:</span> {summary.added}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Failed:</span> {summary.failed}
          </p>

          {summary.failed > 0 && (
            <>
              <p className="mt-2 text-sm font-semibold">
                Products that did not get added:
              </p>
              <ul className="max-h-48 list-disc space-y-1 overflow-y-auto pl-5 text-sm">
                {summary.failures.map((f, i) => (
                  <li key={i}>
                    <span className="font-medium">{f.name}</span>
                    {f.reason ? (
                      <span className="text-gray-500"> — {f.reason}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Modal>

      {/* Error modal */}
      <Modal
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Bulk Add Error"
      >
        <p className="text-sm">{errorMsg}</p>
      </Modal>
    </div>
  );
};

export default BulkAddProduct;
