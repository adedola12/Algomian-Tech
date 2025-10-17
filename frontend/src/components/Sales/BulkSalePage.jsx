// src/components/sales/BulkSalePage.jsx
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiSearch,
  FiUser,
  FiPhone,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { fetchProducts, createBulkOrders } from "../../api";

const makeEmptyLine = () => ({
  productId: "",
  qty: 1,
  price: 0,
  _picked: null,
  _search: "",
});

const makeEmptyCustomer = () => ({
  customerName: "",
  customerPhone: "",
  isPaid: true,
  paymentMethod: "cash",
  rows: [makeEmptyLine()], // start with 1 line
});

export default function BulkSalePage({ onClose }) {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // customers
  const minCustomers = 2; // ← minimum of 2; no max
  const [customers, setCustomers] = useState(
    Array.from({ length: minCustomers }, () => makeEmptyCustomer())
  );

  useEffect(() => {
    (async () => {
      try {
        const { products = [] } = await fetchProducts({
          limit: 1000,
          inStockOnly: 1,
        });
        setAllProducts(products);
      } catch {
        toast.error("Could not load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const visibleOptions = (needle) => {
    const q = (needle || "").trim().toLowerCase();
    if (!q) return allProducts.slice(0, 10);
    return allProducts
      .filter((p) => p.productName.toLowerCase().includes(q))
      .slice(0, 10);
  };

  // per-customer operations
  const updateCustomer = (idx, patch) => {
    setCustomers((prev) => {
      const cp = [...prev];
      cp[idx] = { ...cp[idx], ...patch };
      return cp;
    });
  };

  const addCustomer = () =>
    setCustomers((prev) => [...prev, makeEmptyCustomer()]);

  const removeCustomer = (idx) =>
    setCustomers((prev) => {
      if (prev.length <= minCustomers) return prev; // keep at least 2
      const cp = [...prev];
      cp.splice(idx, 1);
      return cp;
    });

  // per-row operations
  const addRow = (cIdx) =>
    setCustomers((prev) => {
      const cp = [...prev];
      cp[cIdx] = { ...cp[cIdx], rows: [...cp[cIdx].rows, makeEmptyLine()] };
      return cp;
    });

  const removeRow = (cIdx, rIdx) =>
    setCustomers((prev) => {
      const cp = [...prev];
      const rows = [...cp[cIdx].rows];
      if (rows.length <= 1) return prev; // keep at least one line per customer card
      rows.splice(rIdx, 1);
      cp[cIdx] = { ...cp[cIdx], rows };
      return cp;
    });

  const updateRow = (cIdx, rIdx, patch) =>
    setCustomers((prev) => {
      const cp = [...prev];
      const rows = [...cp[cIdx].rows];
      const next = { ...rows[rIdx], ...patch };

      // reset pick when search changes
      if (
        patch._search !== undefined &&
        patch._search !== next._picked?.productName
      ) {
        next._picked = null;
        next.productId = "";
      }

      rows[rIdx] = next;
      cp[cIdx] = { ...cp[cIdx], rows };
      return cp;
    });

  const pickProduct = (cIdx, rIdx, p) =>
    setCustomers((prev) => {
      const cp = [...prev];
      const rows = [...cp[cIdx].rows];
      rows[rIdx] = {
        ...rows[rIdx],
        productId: p._id,
        price: Number(p.sellingPrice || 0),
        _picked: p,
        _search: p.productName,
      };
      cp[cIdx] = { ...cp[cIdx], rows };
      return cp;
    });

  const customerSubtotal = (c) =>
    c.rows.reduce(
      (s, r) =>
        r.productId ? s + Number(r.qty || 0) * Number(r.price || 0) : s,
      0
    );

  const grandTotal = useMemo(
    () => customers.reduce((s, c) => s + customerSubtotal(c), 0),
    [customers]
  );

  const validate = () => {
    // at least one customer must have at least one product selected
    const anyLines = customers.some((c) => c.rows.some((r) => !!r.productId));
    if (!anyLines) return "Pick at least one product across customers.";

    // each customer that has any product must have name & phone
    for (const [idx, c] of customers.entries()) {
      const hasLines = c.rows.some((r) => !!r.productId);
      if (!hasLines) continue;
      if (!c.customerName.trim())
        return `Customer #${idx + 1}: name is required.`;
      if (!c.customerPhone.trim())
        return `Customer #${idx + 1}: mobile is required.`;
      for (const r of c.rows) {
        if (!r.productId) continue;
        if (!Number(r.qty) || Number(r.qty) <= 0)
          return `Customer #${idx + 1}: quantity must be positive.`;
        if (!Number.isFinite(Number(r.price)) || Number(r.price) < 0)
          return `Customer #${idx + 1}: price must be valid.`;
      }
    }
    return null;
  };

  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const err = validate();
    if (err) return toast.error(err);

    const sales = customers
      .map((c) => {
        const orderItems = c.rows
          .filter((r) => !!r.productId)
          .map((r) => ({
            product: r.productId,
            qty: Number(r.qty || 0),
            price: Number(r.price || 0),
          }));
        if (!orderItems.length) return null;

        return {
          customerName: c.customerName,
          customerPhone: c.customerPhone,
          isPaid: !!c.isPaid,
          paymentMethod: c.isPaid ? c.paymentMethod : undefined,
          orderItems,
        };
      })
      .filter(Boolean);

    if (!sales.length) return toast.error("No valid sales to submit.");

    setSaving(true);
    try {
      const res = await createBulkOrders({ sales });
      const okCount = Array.isArray(res?.results)
        ? res.results.filter((r) => r.ok).length
        : 0;

      if (okCount > 0) {
        toast.success(
          `Created ${okCount} sale${okCount > 1 ? "s" : ""} successfully`
        );
        onClose?.();
      } else {
        toast.error(res?.results?.[0]?.error || "Bulk sale failed");
        setSaving(false);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Save failed");
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          <button onClick={onClose} className="mr-3 text-gray-500">
            <FiArrowLeft />
          </button>
          Bulk Sales (multiple customers)
        </h2>

        <button
          onClick={addCustomer}
          className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50"
        >
          <FiPlus /> Add new customer
        </button>
      </div>

      {/* customers list */}
      <div className="space-y-8">
        {customers.map((c, cIdx) => (
          <div key={cIdx} className="border rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">
                Customer #{cIdx + 1}
              </h3>
              <button
                disabled={customers.length <= minCustomers}
                onClick={() => removeCustomer(cIdx)}
                className={`p-2 rounded-lg border hover:bg-gray-50 ${
                  customers.length <= minCustomers
                    ? "opacity-40 cursor-not-allowed"
                    : ""
                }`}
                title={
                  customers.length <= minCustomers
                    ? `Keeps minimum ${minCustomers} customers`
                    : "Remove customer"
                }
              >
                <FiTrash2 />
              </button>
            </div>

            {/* customer header */}
            <div className="grid gap-3 md:grid-cols-4">
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={c.customerName}
                  onChange={(e) =>
                    updateCustomer(cIdx, { customerName: e.target.value })
                  }
                  placeholder="Customer full name"
                  className="border rounded-lg pl-9 pr-3 py-2 w-full"
                />
              </div>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={c.customerPhone}
                  onChange={(e) =>
                    updateCustomer(cIdx, { customerPhone: e.target.value })
                  }
                  placeholder="Mobile number"
                  className="border rounded-lg pl-9 pr-3 py-2 w-full"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={c.isPaid}
                  onChange={() => updateCustomer(cIdx, { isPaid: !c.isPaid })}
                />
                Payment received?
              </label>
              {c.isPaid ? (
                <select
                  value={c.paymentMethod}
                  onChange={(e) =>
                    updateCustomer(cIdx, { paymentMethod: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="cash">cash</option>
                  <option value="bank">bank</option>
                  <option value="card">card</option>
                </select>
              ) : (
                <div className="text-sm text-gray-500 self-center">Unpaid</div>
              )}
            </div>

            {/* rows table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Products for this customer</h4>
                <button
                  onClick={() => addRow(cIdx)}
                  className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50"
                >
                  <FiPlus /> Add line
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2">Product</th>
                      <th className="text-left px-3 py-2">Qty</th>
                      <th className="text-left px-3 py-2">Price</th>
                      <th className="text-left px-3 py-2">Line total</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.rows.map((r, rIdx) => {
                      const options = visibleOptions(r._search);
                      const maxQty =
                        r._picked?.quantity ??
                        allProducts.find((p) => p._id === r.productId)
                          ?.quantity ??
                        0;
                      return (
                        <tr key={rIdx} className="border-b">
                          <td className="px-3 py-2 min-w-[320px]">
                            <div className="relative">
                              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                value={r._search}
                                onChange={(e) =>
                                  updateRow(cIdx, rIdx, {
                                    _search: e.target.value,
                                  })
                                }
                                placeholder="Search product…"
                                className="w-full pl-9 pr-3 py-2 border rounded-lg"
                              />
                              {!loading && (r._search?.trim() || "") !== "" && (
                                <div className="absolute z-20 bg-white border rounded-lg shadow mt-1 max-h-56 overflow-auto w-full">
                                  {options.length ? (
                                    options.map((p) => (
                                      <div
                                        key={p._id}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          pickProduct(cIdx, rIdx, p);
                                        }}
                                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                                      >
                                        <img
                                          alt=""
                                          src={
                                            p.images?.[0] ||
                                            "https://via.placeholder.com/24"
                                          }
                                          className="w-6 h-6 rounded object-cover"
                                        />
                                        <div className="flex-1">
                                          <div className="text-sm">
                                            {p.productName}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            ₦
                                            {Number(
                                              p.sellingPrice || 0
                                            ).toLocaleString()}{" "}
                                            — in stock: {p.quantity}
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="px-3 py-2 text-sm text-gray-500">
                                      No matches
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            {r._picked && (
                              <div className="text-xs text-gray-500 mt-1">
                                Selected:{" "}
                                <strong>{r._picked.productName}</strong> (in
                                stock: {r._picked.quantity})
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min={1}
                              max={Math.max(1, maxQty)}
                              value={r.qty}
                              onChange={(e) =>
                                updateRow(cIdx, rIdx, {
                                  qty: Math.max(1, Number(e.target.value || 1)),
                                })
                              }
                              className="w-24 border rounded-lg px-2 py-1"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={r.price}
                              onChange={(e) =>
                                updateRow(cIdx, rIdx, {
                                  price: Number(e.target.value || 0),
                                })
                              }
                              className="w-32 border rounded-lg px-2 py-1"
                            />
                          </td>
                          <td className="px-3 py-2">
                            ₦
                            {(
                              Number(r.qty || 0) * Number(r.price || 0)
                            ).toLocaleString()}
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => removeRow(cIdx, rIdx)}
                              className="p-2 rounded-lg border hover:bg-gray-50"
                              title="Remove row"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="text-right font-medium">
                Subtotal: ₦{customerSubtotal(c).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary + Save */}
      <section className="max-w-sm ml-auto space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Grand total (all customers)</span>
          <span>₦{grandTotal.toLocaleString()}</span>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className={`w-full mt-3 text-white py-2 rounded-lg ${
            saving
              ? "bg-orange-400 opacity-70 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-700"
          }`}
        >
          {saving ? "Saving…" : "Complete"}
        </button>
      </section>
    </div>
  );
}
