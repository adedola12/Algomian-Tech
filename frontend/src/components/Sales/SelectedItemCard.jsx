/*  SelectedItemCard.jsx  */
import React, { useState, useEffect, useMemo } from "react";
import { FiChevronRight, FiChevronDown, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";

/**
 *  product.variants = [
 *     { attribute : "GPU",  value : "RTX 3050",  inputCost : 45000 },
 *     { attribute : "GPU",  value : "RTX 3060",  inputCost : 95000 },
 *     { attribute : "CPU",  value : "i5-12450H", inputCost : 0      },
 *     { attribute : "CPU",  value : "i7-12700H", inputCost : 65000 },
 *     ...
 *  ]
 */
export default function SelectedItemCard({
  expanded,
  onToggle,
  product,
  onQtyChange,
  onSpecChange, // (id, field, value)
  onDelete,
}) {
  /* ───────────── base specs ───────────── */
  const [ram, setRam] = useState(product.baseRam || "");
  const [storage, setStorage] = useState(product.baseStorage || "");
  const [cpu, setCpu] = useState(product.baseCPU || "");
  const maxQty = product.maxQty || 1;

  /* ───────────── variant selections ───── */
  /**
   *  state shape: { GPU : idx, CPU : idx … }
   *               where idx is the index inside product.variants
   */
  const [picked, setPicked] = useState(() => {
    // rebuild from existing line when editing
    const map = {};
    if (Array.isArray(product.variantSelections)) {
      product.variantSelections.forEach((sel) => {
        const i = product.variants?.findIndex(
          (v) => `${v.attribute}: ${v.value}` === sel.label
        );
        if (i !== -1) map[product.variants[i].attribute] = i;
      });
    }
    return map;
  });

  /* derived helpers */
  const variantsByAttr = useMemo(() => {
    const g = {};
    (product.variants || []).forEach((v, i) => {
      g[v.attribute] = g[v.attribute] || [];
      g[v.attribute].push({ ...v, _idx: i });
    });
    return g;
  }, [product.variants]);

  const selectedArray = useMemo(
    () =>
      Object.values(picked).map((i) => ({
        label: `${product.variants[i].attribute}: ${product.variants[i].value}`,
        cost: Number(product.variants[i].inputCost) || 0,
      })),
    [picked, product.variants]
  );

  const variantsCostTotal = selectedArray.reduce((s, v) => s + v.cost, 0);

  /* ────────── bubble changes upward ───── */
  useEffect(() => {
    onSpecChange(product.id, "baseRam", ram);
  }, [ram]);
  useEffect(() => {
    onSpecChange(product.id, "baseStorage", storage);
  }, [storage]);
  useEffect(() => {
    onSpecChange(product.id, "baseCPU", cpu);
  }, [cpu]);

  useEffect(() => {
    onSpecChange(product.id, "variantSelections", selectedArray);
    onSpecChange(product.id, "variantCost", variantsCostTotal);
  }, [selectedArray, variantsCostTotal]); // eslint-disable-line

  /* qty guard */
  const handleQty = (val) => {
    const q = Number(val);
    if (q < 1) return toast.error("Quantity must be at least 1");
    if (q > maxQty) return toast.error(`Only ${maxQty} in stock`);
    onQtyChange(product.id, q);
  };

  /* ───────────── render ─────────────── */
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* header row */}
      <div
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
      >
        {expanded ? <FiChevronDown /> : <FiChevronRight />}

        <div className="flex items-center space-x-4 flex-1 px-2">
          <img
            src={product.image}
            alt={product.name}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div>
            <h3 className="text-gray-800 font-medium">{product.name}</h3>
            <p className="text-gray-500 text-sm">
              {ram || "—"}, {storage || "—"}, {cpu || "—"}
            </p>

            {selectedArray.map((v) => (
              <p key={v.label} className="text-xs text-purple-600">
                {v.label} {v.cost ? `( +₦${v.cost.toLocaleString()} )` : ""}
              </p>
            ))}
          </div>
        </div>

        <FiTrash2
          onClick={(e) => {
            e.stopPropagation();
            onDelete(product.id);
          }}
          className="text-gray-400 hover:text-gray-600 mr-4"
        />
      </div>

      {/* expanded content */}
      {expanded && (
        <div className="border-t border-gray-200 px-4 py-6 space-y-6">
          {/* _____ base specs _____ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              ["RAM", ram, setRam],
              ["Storage", storage, setStorage],
              ["CPU", cpu, setCpu],
            ].map(([label, val, setter]) => (
              <div key={label}>
                <label className="block text-sm text-gray-600 mb-1">
                  {label}
                </label>
                <input
                  value={val}
                  onChange={(e) => setter(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2
                                  focus:ring-2 focus:ring-orange-500"
                />
              </div>
            ))}
          </div>

          {/* _____ multi-variant pickers _____ */}
          {Object.keys(variantsByAttr).length > 0 && (
            <div className="space-y-4">
              {Object.entries(variantsByAttr).map(([attr, arr]) => (
                <div key={attr}>
                  <label className="block text-sm text-gray-600 mb-1">
                    {attr}
                  </label>
                  <select
                    value={picked[attr] ?? -1}
                    onChange={(e) =>
                      setPicked((prev) => ({
                        ...prev,
                        [attr]: Number(e.target.value),
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2
                               focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={-1}>— Select {attr} (optional)</option>
                    {arr.map((v) => (
                      <option key={v._idx} value={v._idx}>
                        {v.value}
                        {v.inputCost
                          ? ` (+₦${Number(v.inputCost).toLocaleString()})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* qty + base price (excludes variant) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                max={maxQty}
                value={product.qty}
                onChange={(e) => handleQty(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2
                                focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Base Price
              </label>
              <input
                readOnly
                value={`₦ ${product.price.toLocaleString()}`}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg
                                px-3 py-2"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
