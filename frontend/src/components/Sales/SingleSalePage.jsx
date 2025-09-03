/*  src/components/Sales/SingleSalePage.jsx  */
import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiArrowLeft,
} from "react-icons/fi";
import { toast } from "react-toastify";

import SelectedItemCard from "./SelectedItemCard";
import { lineTotal } from "../../utils/money";
import api, { fetchProducts, createOrder, fetchOrderById } from "../../api";

/* ---------- helpers ---------- */
const buildLine = (p) => {
  const first =
    Array.isArray(p.baseSpecs) && p.baseSpecs.length ? p.baseSpecs[0] : {};
  return {
    id: p._id,
    image: p.images?.[0] || "",
    name: p.productName,
    baseRam: first.baseRam || "",
    baseStorage: first.baseStorage || "",
    baseCPU: first.baseCPU || "",
    price: Number(p.sellingPrice ?? 0),
    qty: 1,
    maxQty: p.quantity,
    variants: p.variants || [],
    variantSelections: [],
    variantCost: 0,
    expanded: false,
  };
};

const buildLineFromOrderItem = (oi) => {
  const spec = (oi.soldSpecs && oi.soldSpecs[0]) || {};
  const variantSelections = Array.isArray(oi.variantSelections)
    ? oi.variantSelections
    : [];
  const variantCost = variantSelections.reduce(
    (s, v) => s + (Number(v.cost) || 0),
    0
  );

  return {
    id: oi.product,
    image: oi.image || "",
    name: oi.name || "",
    baseRam: spec.baseRam || oi.baseRam || "",
    baseStorage: spec.baseStorage || oi.baseStorage || "",
    baseCPU: spec.baseCPU || oi.baseCPU || "",
    price: Number(oi.price || 0),
    qty: Number(oi.qty || 1),
    maxQty: Number(oi.maxQty || 9999),
    variants: [],
    variantSelections,
    variantCost,
    expanded: false,
  };
};

/* ---------- component ---------- */
export default function SingleSalePage({
  onClose,
  onBack,
  mode = "sale",
  orderId,
}) {
  /* --------------- catalogue ---------------- */
  const [catalogue, setCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState(0);

  /* ───── seed from <InventTable> … nav("/sales", {state:{product}}) ───── */
  const location = useLocation();
  const nav = useNavigate();

  const seedLine = location.state?.product
    ? buildLine(location.state.product)
    : null;

  useEffect(() => {
    (async () => {
      try {
        const { products = [] } = await fetchProducts({
          limit: 500,
          inStockOnly: 1,
        });
        setCatalogue(products);
      } catch {
        toast.error("Could not load catalogue");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ─── Prefill when editing ─────────────────────────────────────────────
  const [items, setItems] = useState(seedLine ? [seedLine] : []);
  useEffect(() => {
    if (!orderId) return;
    (async () => {
      try {
        const order = await fetchOrderById(orderId);
        setItems(
          Array.isArray(order.orderItems)
            ? order.orderItems.map(buildLineFromOrderItem)
            : []
        );
        setCustName(
          (order.customerName && order.customerName.trim()) ||
            (order.user
              ? `${order.user.firstName || ""} ${
                  order.user.lastName || ""
                }`.trim()
              : "")
        );
        setCustPhone(order.customerPhone || order.user?.whatAppNumber || "");
        setCustEmail(order.user?.email || "");
        setCustId(order.user?._id || null);

        setPOS(order.pointOfSale || "");
        const dlvMethod = order.deliveryMethod || "self";
        setMethod(dlvMethod);
        setOrderType(dlvMethod === "self" ? "order" : "pickup");
        setDeliveryFee(Number(order.shippingPrice || 0));
        setDeliveryPaid(!!order.deliveryPaid);
        setShip(order.shippingAddress?.address || "");
        setPark(order.pointOfSale || "");
        setReceiverName(order.receiverName || "");
        setReceiverPhone(order.receiverPhone || "");
        setReceiptName(order.receiptName || "");
        setReceiptAmount(order.receiptAmount || 0);
        setDeliveryNote(order.deliveryNote || "");
        setPayMethod(order.paymentMethod || "cash");
        const itemsP = Number(order.itemsPrice || 0);
        const taxP = Number(order.taxPrice || 0);
        setTax(itemsP ? (taxP / itemsP) * 100 : 0);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load order");
      }
    })();
  }, [orderId]);

  /* --------------- product picker ------------- */
  const [query, setQuery] = useState("");
  const isSel = (id) => items.some((l) => l.id === id);
  const toggle = (p) =>
    setItems((prev) =>
      isSel(p._id)
        ? prev.filter((l) => l.id !== p._id)
        : [...prev, buildLine(p)]
    );
  const update = (id, obj) =>
    setItems((prev) => prev.map((l) => (l.id === id ? { ...l, ...obj } : l)));

  /* --------------- customer ------------------- */
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custId, setCustId] = useState(null);

  const [refName, setRefName] = useState("");
  const [refPhone, setRefPhone] = useState("");
  const [pos, setPOS] = useState("");
  const [refId, setRefId] = useState(null);

  useEffect(() => {
    if (location.state?.product) nav(".", { replace: true, state: {} });
  }, []); // eslint-disable-line

  /* ──────────  load customers once (also for referral) ────────── */
  const [allPeople, setAllPeople] = useState([]);
  useEffect(() => {
    api
      .get("/api/users/customers")
      .then((r) => setAllPeople(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error("Could not fetch customers list"));
  }, []);

  const suggestions = (needle) => {
    const q = needle.trim().toLowerCase();
    if (!q) return [];
    return allPeople
      .filter((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(q))
      .sort((a, b) => (b.totalOrders || 0) - (a.totalOrders || 0))
      .slice(0, 8);
  };

  const [custSug, setCustSug] = useState([]);
  const [refSug, setRefSug] = useState([]);

  /* --------------- delivery ------------------- */
  const [orderType, setOrderType] = useState("order"); // "order" | "pickup"
  const [method, setMethod] = useState("self"); // default for pick-up
  const [paid, setPaid] = useState(true); // for pick-up only
  const [shipAddr, setShip] = useState("");
  const [park, setPark] = useState("");

  /* NEW – per-delivery details */
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const [receiptAmount, setReceiptAmount] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [deliveryPaid, setDeliveryPaid] = useState(true);

  /* --------------- payment -------------------- */
  const [taxPct, setTax] = useState(0);
  const [payMethod, setPayMethod] = useState("cash");

  /* extra payment-specific fields (only when payMethod === 'bank') */
  const [bankAccount, setBankAccount] = useState("Moniepoint - Alogoman 2");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [accountName, setAccountName] = useState("");
  const [amountTransferred, setAmountTransferred] = useState(0);

  /* --------------- totals --------------------- */
  const subtotal = useMemo(
    () => items.reduce((s, it) => s + lineTotal(it), 0),
    [items]
  );
  const taxTotal = (subtotal * taxPct) / 100;
  const deliveryIncluded = deliveryPaid ? Number(deliveryFee || 0) : 0;
  const grand = subtotal + taxTotal + deliveryIncluded;

  /* --------------- save ----------------------- */
  const [isSaving, setIsSaving] = useState(false);

  // ---- suggestion selection helpers (avoid blur-before-click) ----
  const getFullName = (c) =>
    `${c.firstName || ""} ${c.lastName || ""}`.trim() ||
    c.name ||
    c.fullName ||
    "";

  const getPhone = (c) =>
    c.whatAppNumber ??
    c.whatsAppNumber ??
    c.whatsappNumber ??
    c.phoneNumber ??
    c.phone ??
    "";

  const getEmail = (c) => c.email ?? c.primaryEmail ?? "";

  const selectCustomer = (c) => {
    setCustId(c._id);
    setCustName(getFullName(c));
    setCustPhone(getPhone(c));
    setCustEmail(getEmail(c));
    setCustSug([]);
  };

  const selectReferral = (c) => {
    setRefId(c._id);
    setRefName(getFullName(c));
    setRefPhone(getPhone(c));
    setRefSug([]);
  };

  const saveSale = async () => {
    if (isSaving) return;
    if (!items.length) return toast.error("Pick at least one product");
    if ((orderType === "order" || paid) && !payMethod)
      return toast.error("Select a payment method");

    setIsSaving(true);
    try {
      const payload = {
        orderItems: items.map((l) => ({
          product: l.id,
          qty: l.qty,
          price: l.price,
          baseRam: l.baseRam,
          baseCPU: l.baseCPU,
          baseStorage: l.baseStorage,
          variantSelections: l.variantSelections,
        })),
        orderType: mode === "invoice" ? "invoice" : "sale",
        shippingAddress: {
          address:
            method === "logistics" ? shipAddr : method === "park" ? park : pos,
          city: "N/A",
          postalCode: "N/A",
          country: "N/A",
        },
        pointOfSale: pos,
        isPaid: orderType === "order" ? true : paid,
        paymentMethod:
          mode === "invoice" ? undefined : paid ? payMethod : undefined,

        itemsPrice: subtotal,
        taxPrice: taxTotal,
        shippingPrice: Number(deliveryFee || 0),
        totalPrice:
          subtotal + taxTotal + (deliveryPaid ? Number(deliveryFee || 0) : 0),

        // 👇 Always send what’s currently in the inputs
        customerName: custName,
        customerPhone: custPhone,
        customerEmail: custEmail,
        selectedCustomerId: custId,

        referralName: refName,
        referralPhone: refPhone,
        referralId: refId,

        deliveryMethod: method,
        receiverName,
        receiverPhone,
        receiptName,
        receiptAmount: Number(receiptAmount || 0),
        deliveryNote,
        deliveryPaid,
      };

      if (mode === "edit" && orderId) {
        await api.patch(`/api/orders/${orderId}`, payload);
      } else {
        await createOrder(payload);
      }

      toast.success("Sale completed 🎉");
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      setIsSaving(false);
    }
  };

  /* --------------- UI ------------------------- */
  return (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-6 space-y-10 max-w-5xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          <button
            onClick={() => (typeof onBack === "function" ? onBack() : nav(-1))}
            className="mr-3 text-gray-500 cursor-pointer"
          >
            <FiArrowLeft />
          </button>
          Sales Management
        </h2>
      </div>

      {/* customer */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Customer details</h3>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* name + suggestions */}
          <div className="relative">
            <FiUser className="absolute left-3 top-3 text-gray-400" />
            <input
              value={custName}
              onChange={(e) => {
                const v = e.target.value;
                setCustName(v);
                // IMPORTANT: don't drop the link if the cashier edits the name slightly.
                if (!v.trim()) setCustId(null);
                setCustSug(suggestions(v));
              }}
              onFocus={() => setCustSug(suggestions(custName))}
              onBlur={() => setTimeout(() => setCustSug([]), 120)}
              placeholder="Customer name"
              className="pl-10 pr-3 py-2 border rounded-lg w-full"
            />
            {custSug.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border rounded-lg shadow max-h-56 overflow-auto">
                {custSug.map((c) => (
                  <li
                    key={c._id}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      selectCustomer(c);
                    }}
                    role="button"
                    tabIndex={-1}
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex justify-between"
                  >
                    <span>
                      {c.firstName} {c.lastName} — {getPhone(c)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(c.totalOrders || 0) > 0
                        ? `${c.totalOrders} orders`
                        : "no orders"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* phone – now editable even if existing customer */}
          <div className="relative">
            <FiPhone className="absolute left-3 top-3 text-gray-400" />
            <input
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              placeholder="Customer phone"
              className="pl-10 pr-3 py-2 border rounded-lg w-full"
            />
          </div>

          {/* email – now editable even if existing customer */}
          <div className="relative">
            <FiMail className="absolute left-3 top-3 text-gray-400" />
            <input
              value={custEmail}
              onChange={(e) => setCustEmail(e.target.value)}
              placeholder="Customer email"
              className="pl-10 pr-3 py-2 border rounded-lg w-full"
            />
          </div>
        </div>

        {/* POS */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="relative lg:col-span-1">
            <FiMapPin className="absolute left-3 top-3 text-gray-400" />
            <input
              value={pos}
              onChange={(e) => setPOS(e.target.value)}
              placeholder="Point of sale"
              className="pl-10 pr-3 py-2 border rounded-lg w-full"
            />
          </div>
        </div>

        {/* referral (unchanged except pointerDown) */}
        <div className="grid lg:grid-cols-3 gap-4 lg:justify-items-center">
          <div className="relative lg:col-start-2">
            <FiUser className="absolute left-3 top-3 text-gray-400" />
            <input
              value={refName}
              onChange={(e) => {
                const v = e.target.value;
                setRefName(v);
                if (!v.trim()) setRefId(null);
                setRefSug(suggestions(v));
              }}
              onFocus={() => setRefSug(suggestions(refName))}
              onBlur={() => setTimeout(() => setRefSug([]), 120)}
              placeholder="Referral name"
              className="pl-10 pr-3 py-2 border rounded-lg w-full"
            />
            {refSug.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border rounded-lg shadow max-h-40 overflow-auto">
                {refSug.map((c) => (
                  <li
                    key={c._id}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      selectReferral(c);
                    }}
                    role="button"
                    tabIndex={-1}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {c.firstName} {c.lastName} — {getPhone(c)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative lg:col-start-3">
            <FiPhone className="absolute left-3 top-3 text-gray-400" />
            <input
              value={refPhone}
              onChange={(e) => setRefPhone(e.target.value)}
              placeholder="Referral phone"
              className="pl-10 pr-3 py-2 border rounded-lg w-full"
            />
          </div>
        </div>
      </section>

      {/* products … delivery … payment … summary (unchanged) */}
      {/* --- keep your existing sections below --- */}

      {/* Products */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Products</h3>
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product…"
            className="w-full pl-10 pr-3 py-2 border rounded-lg"
          />
          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              …
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <div className="grid grid-rows-3 gap-4 auto-cols-[100px] sm:auto-cols-[120px] md:auto-cols-[150px] grid-flow-col">
            {catalogue
              .filter((p) =>
                p.productName.toLowerCase().includes(query.toLowerCase())
              )
              .map((p) => (
                <label
                  key={p._id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="relative shrink-0">
                    <img
                      src={p.images?.[0] || "https://via.placeholder.com/64"}
                      alt={p.productName}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <input
                      type="checkbox"
                      className="w-4 h-4 absolute top-1 left-1 accent-orange-500"
                      checked={isSel(p._id)}
                      onChange={() => toggle(p)}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs truncate">{p.productName}</p>
                    <p className="text-[11px] font-semibold">
                      ₦{Number(p.sellingPrice ?? 0).toLocaleString()}
                    </p>
                  </div>
                </label>
              ))}
          </div>
        </div>

        <div className="space-y-3">
          {items.map((it) => (
            <SelectedItemCard
              key={it.id}
              product={it}
              expanded={it.expanded}
              onToggle={() => update(it.id, { expanded: !it.expanded })}
              onQtyChange={(id, qty) => update(id, { qty })}
              onSpecChange={(id, f, v) => update(id, { [f]: v })}
              onDelete={(id) =>
                setItems((prev) => prev.filter((l) => l.id !== id))
              }
            />
          ))}
        </div>
      </section>

      {/* Delivery (unchanged UI) */}
      {mode !== "invoice" && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Delivery</h3>
          <div className="flex gap-4 flex-wrap">
            {[
              ["order", "Walk In"],
              ["pickup", "Online Order"],
            ].map(([v, lbl]) => (
              <button
                key={v}
                onClick={() => setOrderType(v)}
                className={`px-4 py-1.5 rounded-lg border ${
                  orderType === v
                    ? "bg-orange-600 text-white border-orange-600"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          {orderType === "pickup" && (
            <>
              {(method === "logistics" || method === "park") && (
                <div className="grid gap-4 md:grid-cols-2">
                  <textarea
                    rows={2}
                    value={shipAddr}
                    onChange={(e) => setShip(e.target.value)}
                    placeholder="Shipping / Park address"
                    className="border rounded-lg px-3 py-2"
                  />
                  <textarea
                    rows={2}
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Receiver name"
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    placeholder="Receiver phone"
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    value={receiptName}
                    onChange={(e) => setReceiptName(e.target.value)}
                    placeholder="Name on receipt"
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    value={receiptAmount}
                    onChange={(e) => setReceiptAmount(e.target.value)}
                    placeholder="Amount on receipt"
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    placeholder="Delivery fee (₦)"
                    className="border rounded-lg px-3 py-2"
                  />
                  <textarea
                    rows={2}
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="Additional note"
                    className="border rounded-lg px-3 py-2 md:col-span-2"
                  />
                  <div className="flex items-center gap-6 col-span-full">
                    <span className="text-sm">Delivery paid?</span>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        checked={deliveryPaid}
                        onChange={() => setDeliveryPaid(true)}
                      />{" "}
                      Paid
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        checked={!deliveryPaid}
                        onChange={() => setDeliveryPaid(false)}
                      />{" "}
                      Not paid
                    </label>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Payment (unchanged UI) */}
      {mode !== "invoice" && (orderType === "order" || paid) && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Payment</h3>
          <div className="flex gap-4 flex-wrap">
            {["cash", "bank", "card"].map((m) => (
              <button
                key={m}
                onClick={() => setPayMethod(m)}
                className={`px-4 py-1.5 rounded-lg border ${
                  payMethod === m
                    ? "bg-orange-600 text-white border-orange-600"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {payMethod === "bank" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="text-sm">Bank account</span>
                <select
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                >
                  <option>Moniepoint - Alogoman 2</option>
                  <option>GTB - 00112233</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm">Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
              </label>
              <label className="block">
                <span className="text-sm">Name on account</span>
                <input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
              </label>
              <label className="block">
                <span className="text-sm">Amount transferred</span>
                <input
                  type="number"
                  value={amountTransferred}
                  onChange={(e) => setAmountTransferred(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
              </label>
            </div>
          )}

          <label className="flex items-center gap-2">
            <span className="text-sm">Tax %</span>
            <input
              type="number"
              value={taxPct}
              onChange={(e) => setTax(+e.target.value)}
              className="w-24 border rounded-lg px-2 py-1"
            />
          </label>
        </section>
      )}

      {/* summary */}
      <section className="space-y-2 max-w-sm ml-auto">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>₦{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>₦{taxTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Delivery {deliveryPaid ? "" : "(unpaid)"}</span>
          <span>₦{Number(deliveryFee || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>₦{grand.toLocaleString()}</span>
        </div>

        <button
          onClick={saveSale}
          disabled={isSaving}
          aria-busy={isSaving}
          className={`w-full mt-4 text-white py-2 rounded-lg ${
            isSaving
              ? "bg-orange-400 cursor-not-allowed opacity-60"
              : "bg-orange-600 hover:bg-orange-700"
          }`}
        >
          {isSaving ? "Completing…" : "Complete sale"}
        </button>
      </section>
    </div>
  );
}
