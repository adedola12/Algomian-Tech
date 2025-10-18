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

/* ---------- helpers ---------- */
const norm = (s = "") => String(s).trim().toLowerCase();

const specLabel = (p = {}) => {
  const b =
    Array.isArray(p.baseSpecs) && p.baseSpecs.length ? p.baseSpecs[0] : {};
  const cpu = b.baseCPU || p.baseCPU || "";
  const ram = b.baseRam || p.storageRam || "";
  const sto = b.baseStorage || p.Storage || "";
  const bits = [
    cpu && `CPU: ${cpu}`,
    ram && `RAM: ${ram}`,
    sto && `Storage: ${sto}`,
  ].filter(Boolean);
  return bits.length ? bits.join(" | ") : "Standard spec";
};

const makeEmptyLine = () => ({
  // selection
  _picked: null, // display info (first product of group)
  _groupKey: "", // normalized name key
  _groupProducts: [], // all product docs with the same name
  _search: "",
  _selectedIds: [], // MULTI: chosen product ids
  _selectedLabels: [], // pretty labels (same index as ids)
  _specOpen: false, // 👈 controls collapsed/expanded spec panel

  // money/qty
  qty: 0, // mirrors _selectedIds.length when multi is used
  price: 0,
});

const makeEmptyCustomer = () => ({
  customerName: "",
  customerPhone: "",
  isPaid: true,
  paymentMethod: "cash",
  rows: [makeEmptyLine()],
});

export default function BulkSalePage({ onClose }) {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // customers
  const minCustomers = 2;
  const [customers, setCustomers] = useState(
    Array.from({ length: minCustomers }, () => makeEmptyCustomer())
  );

  /* load stock */
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

  /* group stock by product name (case-insensitive) */
  const grouped = useMemo(() => {
    const map = new Map();
    for (const p of allProducts) {
      const key = norm(p.productName);
      if (!map.has(key)) {
        map.set(key, {
          key,
          displayName: p.productName,
          totalQty: 0,
          price: Number(p.sellingPrice || 0),
          image: p.images?.[0] || "",
          products: [],
        });
      }
      const g = map.get(key);
      g.totalQty += Number(p.quantity || 0);
      g.products.push(p);
      if (!g.price && Number(p.sellingPrice || 0))
        g.price = Number(p.sellingPrice || 0);
      if (!g.image && p.images?.[0]) g.image = p.images[0];
    }
    return map;
  }, [allProducts]);

  /* search options use grouped names */
  const visibleOptions = (needle) => {
    const q = norm(needle);
    const arr = Array.from(grouped.values());
    if (!q) return arr.slice(0, 10);
    return arr.filter((g) => norm(g.displayName).includes(q)).slice(0, 10);
  };

  // per-customer ops
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
      if (prev.length <= minCustomers) return prev;
      const cp = [...prev];
      cp.splice(idx, 1);
      return cp;
    });

  // per-row ops
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
      if (rows.length <= 1) return prev;
      rows.splice(rIdx, 1);
      cp[cIdx] = { ...cp[cIdx], rows };
      return cp;
    });

  const updateRow = (cIdx, rIdx, patch) =>
    setCustomers((prev) => {
      const cp = [...prev];
      const rows = [...cp[cIdx].rows];
      const next = { ...rows[rIdx], ...patch };

      // if user edits search, clear selection so dropdown can re-open
      if (
        patch._search !== undefined &&
        patch._search !== (next._picked?.productName || "")
      ) {
        next._picked = null;
        next._groupKey = "";
        next._groupProducts = [];
        next._selectedIds = [];
        next._selectedLabels = [];
        next._specOpen = false;
        next.qty = 0;
      }

      // if multiselect changed, mirror qty and auto-collapse when >=1 chosen
      if (patch._selectedIds) {
        next.qty = patch._selectedIds.length;
        if (patch._selectedIds.length > 0) {
          next._specOpen = false; // 👈 collapse after choosing
        }
      }

      rows[rIdx] = next;
      cp[cIdx] = { ...cp[cIdx], rows };
      return cp;
    });

  /* when a grouped name is picked */
  const pickProduct = (cIdx, rIdx, group) =>
    setCustomers((prev) => {
      const cp = [...prev];
      const rows = [...cp[cIdx].rows];
      const first = group.products[0] || {};
      const totalLeft = group.totalQty;

      if (totalLeft <= 0) toast.warn(`No stock left for ${group.displayName}`);

      rows[rIdx] = {
        ...rows[rIdx],
        _picked: first,
        _groupKey: group.key,
        _groupProducts: group.products,
        _selectedIds: [],
        _selectedLabels: [],
        _specOpen: true, // 👈 open picker initially
        _search: "",
        price:
          rows[rIdx].price && rows[rIdx].price > 0
            ? rows[rIdx].price
            : Number(first.sellingPrice || group.price || 0),
        qty: 0, // multi-select drives qty
      };
      cp[cIdx] = { ...cp[cIdx], rows };
      return cp;
    });

  /* remaining for a specific variant (productId), excluding a row's own usage */
  const remainingForVariant = (customer, productId, excludeIndex = -1) => {
    if (!productId) return 0;
    const prod = allProducts.find((p) => String(p._id) === String(productId));
    const total = Number(prod?.quantity || 0);
    const usedByOthers = (customer.rows || []).reduce((s, r, idx) => {
      if (idx === excludeIndex) return s;
      const count =
        Array.isArray(r._selectedIds) && r._selectedIds.length
          ? r._selectedIds.filter((id) => String(id) === String(productId))
              .length
          : 0;
      return s + count;
    }, 0);
    return Math.max(0, total - usedByOthers);
  };

  /* group remaining (only used when no specs selected and user typed qty) */
  const remainingForName = (customer, groupKey, excludeIndex = -1) => {
    if (!groupKey) return 0;
    const total = grouped.get(groupKey)?.totalQty || 0;
    const usedByOthers = (customer.rows || []).reduce((s, r, idx) => {
      if (idx === excludeIndex) return s;
      if (r._groupKey === groupKey) {
        const take =
          Array.isArray(r._selectedIds) && r._selectedIds.length
            ? r._selectedIds.length
            : Number(r.qty || 0);
        return s + take;
      }
      return s;
    }, 0);
    return Math.max(0, total - usedByOthers);
  };

  const customerSubtotal = (c) =>
    c.rows.reduce(
      (s, r) =>
        r._groupKey ? s + Number(r.qty || 0) * Number(r.price || 0) : s,
      0
    );

  const grandTotal = useMemo(
    () => customers.reduce((s, c) => s + customerSubtotal(c), 0),
    [customers]
  );

  /* validation */
  const validate = () => {
    const anyLines = customers.some((c) => c.rows.some((r) => !!r._groupKey));
    if (!anyLines) return "Pick at least one product across customers.";

    for (const [idx, c] of customers.entries()) {
      const hasLines = c.rows.some((r) => !!r._groupKey);
      if (!hasLines) continue;
      if (!c.customerName.trim())
        return `Customer #${idx + 1}: name is required.`;
      if (!c.customerPhone.trim())
        return `Customer #${idx + 1}: mobile is required.`;

      for (let i = 0; i < c.rows.length; i++) {
        const r = c.rows[i];
        if (!r._groupKey) continue;

        if (Array.isArray(r._selectedIds) && r._selectedIds.length) {
          for (const id of r._selectedIds) {
            const cap = remainingForVariant(c, id, i);
            if (cap <= 0)
              return `Customer #${
                idx + 1
              }: selected spec is no longer available.`;
          }
        } else {
          const cap = remainingForName(c, r._groupKey, i);
          if (!Number(r.qty) || Number(r.qty) <= 0)
            return `Customer #${idx + 1}: quantity must be positive.`;
          if (Number(r.qty) > cap)
            return `Customer #${
              idx + 1
            }: qty exceeds stock for this item. Available: ${cap}.`;
        }

        if (!Number.isFinite(Number(r.price)) || Number(r.price) < 0)
          return `Customer #${idx + 1}: price must be valid.`;
      }
    }
    return null;
  };

  const [saving, setSaving] = useState(false);

  /* explode row into concrete orderItems */
  const explodeRowIntoItems = (row) => {
    if (Array.isArray(row._selectedIds) && row._selectedIds.length) {
      return row._selectedIds.map((id) => ({
        product: id,
        qty: 1,
        price: Number(row.price || 0),
      }));
    }
    const items = [];
    let need = Number(row.qty || 0);
    const products = row._groupProducts || [];
    for (const p of products) {
      if (need <= 0) break;
      const available = Number(p.quantity || 0);
      if (available <= 0) continue;
      const take = Math.min(need, available);
      items.push({ product: p._id, qty: take, price: Number(row.price || 0) });
      need -= take;
    }
    return items;
  };

  const onSave = async () => {
    const err = validate();
    if (err) return toast.error(err);

    const sales = customers
      .map((c) => {
        const orderItems = c.rows
          .filter(
            (r) =>
              !!r._groupKey &&
              (Number(r.qty || 0) > 0 ||
                (Array.isArray(r._selectedIds) && r._selectedIds.length))
          )
          .flatMap((r) => explodeRowIntoItems(r));

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
                      const maxForGroup = r._groupKey
                        ? remainingForName(c, r._groupKey, rIdx)
                        : 0;
                      const hasMulti =
                        Array.isArray(r._selectedIds) &&
                        r._selectedIds.length > 0;

                      return (
                        <tr key={rIdx} className="border-b align-top">
                          <td className="px-3 py-2 min-w-[360px]">
                            {/* Search input */}
                            <div className="relative">
                              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                value={r._search}
                                onChange={(e) =>
                                  updateRow(cIdx, rIdx, {
                                    _search: e.target.value,
                                  })
                                }
                                placeholder={
                                  r._picked?.productName
                                    ? r._picked.productName
                                    : "Search product…"
                                }
                                className="w-full pl-9 pr-3 py-2 border rounded-lg"
                              />
                              {/* dropdown */}
                              {!loading &&
                                (r._search?.trim() || "") !== "" &&
                                !r._picked && (
                                  <div className="absolute z-20 bg-white border rounded-lg shadow mt-1 max-h-56 overflow-auto w-full">
                                    {options.length ? (
                                      options.map((g) => (
                                        <div
                                          key={g.key}
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            pickProduct(cIdx, rIdx, g);
                                          }}
                                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                                        >
                                          <img
                                            alt=""
                                            src={
                                              g.image ||
                                              "https://via.placeholder.com/24"
                                            }
                                            className="w-6 h-6 rounded object-cover"
                                          />
                                          <div className="flex-1">
                                            <div className="text-sm">
                                              {g.displayName}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              ₦
                                              {Number(
                                                g.price || 0
                                              ).toLocaleString()}{" "}
                                              — in stock: {g.totalQty}
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

                            {/* Chosen group */}
                            {r._picked && (
                              <>
                                {/* Clickable product name toggles spec panel */}
                                <button
                                  type="button"
                                  className="mt-1 text-left w-full"
                                  onClick={() =>
                                    updateRow(cIdx, rIdx, {
                                      _specOpen: !r._specOpen,
                                    })
                                  }
                                  title="Click to edit specifications"
                                >
                                  <div className="text-xs text-gray-600">
                                    Selected item:{" "}
                                    <strong className="underline decoration-dotted">
                                      {r._picked.productName}
                                    </strong>{" "}
                                    (group stock:{" "}
                                    {grouped.get(r._groupKey)?.totalQty ?? 0})
                                  </div>
                                  {/* If collapsed & has selections, show a summary chip list */}
                                  {!r._specOpen && hasMulti && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {r._selectedLabels.map((lbl, i) => (
                                        <span
                                          key={`${lbl}-${i}`}
                                          className="text-[11px] bg-gray-100 border rounded px-2 py-0.5"
                                        >
                                          {lbl}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </button>

                                {/* Edit link (alternative target to open) */}
                                {!r._specOpen && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateRow(cIdx, rIdx, { _specOpen: true })
                                    }
                                    className="mt-1 text-xs text-blue-600 underline"
                                  >
                                    Edit specs
                                  </button>
                                )}

                                {/* Spec panel (collapsible) */}
                                {r._specOpen && (
                                  <div className="mt-2 border rounded-lg p-2">
                                    <div className="text-xs font-medium text-gray-700 mb-1">
                                      Pick specification(s):
                                    </div>
                                    <div className="space-y-1">
                                      {r._groupProducts.map((p) => {
                                        const id = String(p._id);
                                        const label = specLabel(p);
                                        const isSelected =
                                          Array.isArray(r._selectedIds) &&
                                          r._selectedIds.includes(id);
                                        const remaining = remainingForVariant(
                                          c,
                                          id,
                                          rIdx
                                        );
                                        const disable =
                                          remaining <= 0 && !isSelected;
                                        return (
                                          <label
                                            key={id}
                                            className={`flex items-start gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer ${
                                              disable
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                            }`}
                                          >
                                            <input
                                              type="checkbox"
                                              disabled={disable}
                                              checked={!!isSelected}
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  const nextIds = [
                                                    ...(r._selectedIds || []),
                                                    id,
                                                  ];
                                                  const nextLabels = [
                                                    ...(r._selectedLabels ||
                                                      []),
                                                    label,
                                                  ];
                                                  updateRow(cIdx, rIdx, {
                                                    _selectedIds: nextIds,
                                                    _selectedLabels: nextLabels,
                                                    price:
                                                      r.price > 0
                                                        ? r.price
                                                        : Number(
                                                            p.sellingPrice ||
                                                              r.price ||
                                                              0
                                                          ),
                                                  });
                                                } else {
                                                  const nextIds = (
                                                    r._selectedIds || []
                                                  ).filter((x) => x !== id);
                                                  const nextLabels = (
                                                    r._selectedLabels || []
                                                  ).filter(
                                                    (_, i) =>
                                                      (r._selectedIds || [])[
                                                        i
                                                      ] !== id
                                                  );
                                                  updateRow(cIdx, rIdx, {
                                                    _selectedIds: nextIds,
                                                    _selectedLabels: nextLabels,
                                                  });
                                                }
                                              }}
                                            />
                                            <div className="flex-1">
                                              <div className="text-sm">
                                                {label}
                                              </div>
                                              <div className="text-xs text-gray-500">
                                                In stock:{" "}
                                                {Number(p.quantity || 0)} • ₦
                                                {Number(
                                                  p.sellingPrice || r.price || 0
                                                ).toLocaleString()}
                                              </div>
                                            </div>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* If no selection yet, gentle hint */}
                                {!hasMulti && !r._specOpen && (
                                  <div className="text-xs text-orange-600 mt-1">
                                    Tip: click the product name to open specs
                                    and tick what you’re selling.
                                  </div>
                                )}
                              </>
                            )}
                          </td>

                          {/* Qty: from multi-select if present; else manual input */}
                          <td className="px-3 py-2">
                            {hasMulti ? (
                              <div className="text-sm px-2 py-1 rounded bg-gray-50 inline-block">
                                Qty: <strong>{r._selectedIds.length}</strong>
                              </div>
                            ) : (
                              <input
                                type="number"
                                min={1}
                                max={Math.max(1, maxForGroup || 1)}
                                value={r.qty || 0}
                                onChange={(e) => {
                                  const raw = Math.max(
                                    1,
                                    Number(e.target.value || 1)
                                  );
                                  const cap = maxForGroup || 0;
                                  if (cap <= 0) {
                                    if (raw > 0)
                                      toast.warn(
                                        `No stock available for this selection.`
                                      );
                                    updateRow(cIdx, rIdx, { qty: 0 });
                                    return;
                                  }
                                  const clamped = Math.min(raw, cap);
                                  if (raw > cap)
                                    toast.warn(
                                      `Qty reduced to available (${cap}).`
                                    );
                                  updateRow(cIdx, rIdx, { qty: clamped });
                                }}
                                onBlur={(e) => {
                                  const raw = Math.max(
                                    1,
                                    Number(e.target.value || 1)
                                  );
                                  const cap = maxForGroup || 0;
                                  const clamped =
                                    cap <= 0 ? 0 : Math.min(raw, cap);
                                  if (clamped !== (r.qty || 0))
                                    updateRow(cIdx, rIdx, { qty: clamped });
                                }}
                                className="w-24 border rounded-lg px-2 py-1"
                                disabled={!r._groupKey || maxForGroup === 0}
                              />
                            )}
                            {r._groupKey && !hasMulti && maxForGroup === 0 && (
                              <div className="text-xs text-red-600 mt-1">
                                Out of stock for this selection
                              </div>
                            )}
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
                              disabled={!r._groupKey}
                            />
                          </td>

                          <td className="px-3 py-2">
                            ₦
                            {(
                              Number(
                                (hasMulti ? r._selectedIds.length : r.qty) || 0
                              ) * Number(r.price || 0)
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
