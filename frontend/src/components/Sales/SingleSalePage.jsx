/*  src/components/Sales/SingleSalePage.jsx  */
import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiUser,
  FiPhone,
  FiMapPin,
  FiArrowLeft,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";

import SelectedItemCard from "./SelectedItemCard";
import { lineTotal } from "../../utils/money";
import { createOrder } from "../../api";

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
    price: p.sellingPrice,
    qty: 1,
    maxQty: p.quantity,
    variants: p.variants || [],
    variantSelections: [],
    variantCost: 0,
    expanded: false,
  };
};

/* ---------- component ---------- */
export default function SingleSalePage({
  onClose,
  onBack = () => {}, // optional back handler (sales history)
}) {
  /* --------------- catalogue ---------------- */
  const [catalogue, setCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ───── seed from <InventTable> … nav("/sales", {state:{product}}) ───── */
  const location = useLocation();
  const nav = useNavigate();

  const seedLine = location.state?.product
    ? buildLine(location.state.product)
    : null;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/products?limit=500");
        const list = Array.isArray(data) ? data : data.products ?? [];
        setCatalogue(list);
      } catch (err) {
        toast.error("Could not load catalogue");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* --------------- product picker ------------- */
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(seedLine ? [seedLine] : []);
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
  const [custId, setCustId] = useState(null);
  const [refName, setRefName] = useState("");
  const [refPhone, setRefPhone] = useState("");
  const [pos, setPOS] = useState("");
  const [refId, setRefId] = useState(null);

  useEffect(() => {
    if (location.state?.product) {
      nav(".", { replace: true, state: {} });
    }
  }, []); // eslint-disable-line

  /* ──────────  load customers once ( reused for referral ) ────────── */
  const [allPeople, setAllPeople] = useState([]);
  useEffect(() => {
    axios
      .get("/api/users/customers", { withCredentials: true })
      .then((r) => setAllPeople(r.data || []))
      .catch(() => toast.error("Could not fetch customers list"));
  }, []);

  /* helpers that return a filtered list of suggestions */
  const suggest = (needle) =>
    !needle.trim()
      ? []
      : allPeople.filter((p) =>
          `${p.firstName} ${p.lastName}`
            .toLowerCase()
            .includes(needle.toLowerCase())
        );

  const [custSug, setCustSug] = useState([]);
  const [refSug, setRefSug] = useState([]);

  /* focus flags so the dropdowns close nicely */
  const [showCustSug, setShowCustSug] = useState(false);
  const [showRefSug, setShowRefSug] = useState(false);

  /* --------------- delivery ------------------- */
  const [method, setMethod] = useState("self");
  const [shipAddr, setShip] = useState("");
  const [park, setPark] = useState("");

  /* --------------- payment -------------------- */
  const [taxPct, setTax] = useState(0);
  const [payMethod, setPayMethod] = useState("cash");

  /* extra payment-specific fields (only used when payMethod === 'bank') */
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
  const grand = subtotal + taxTotal;

  /* --------------- save ----------------------- */
  const saveSale = async () => {
    if (!items.length) return toast.error("Pick at least one product");
    try {
      await createOrder({
        orderItems: items.map((l) => ({
          product: l.id,
          qty: l.qty,
          price: l.price,
          baseRam: l.baseRam,
          baseCPU: l.baseCPU,
          baseStorage: l.baseStorage,
          variantSelections: l.variantSelections,
        })),
        shippingAddress: {
          address:
            method === "logistics" ? shipAddr : method === "park" ? park : pos,
          city: "N/A",
          postalCode: "N/A",
          country: "N/A",
        },
        paymentMethod: payMethod,
        taxPrice: taxTotal,
        itemsPrice: subtotal,
        customerName: custName,
        customerPhone: custPhone,
        selectedCustomerId: custId,
        referralName: refName,
        referralPhone: refPhone,
        referralId: refId,
      });
      toast.success("Sale completed 🎉");
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  /* --------------- UI ------------------------- */
  return (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-6 space-y-10 max-w-5xl mx-auto">
      {/* ───────── header / nav ───────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          <button onClick={onBack} className="mr-3 text-gray-500">
            <FiArrowLeft />
          </button>
          Sales Management
        </h2>
      </div>

      {/* ───────── customer ───────── */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Customer details</h3>

        {/* ───── row 1  (customer) ───── */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* name with suggestions */}
          <div className="relative">
            <FiUser className="absolute left-3 top-3 text-gray-400" />
            <input
              value={custName}
              onChange={(e) => {
                setCustName(e.target.value);
                setCustId(null);
                setCustSug(suggest(e.target.value));
              }}
              onFocus={() => setShowCustSug(true)}
              onBlur={() => setTimeout(() => setShowCustSug(false), 120)}
              placeholder="Customer name"
              className="pl-10 pr-3 py-2 border rounded-lg w-full"
            />
            {showCustSug && custSug.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border rounded-lg shadow max-h-40 overflow-auto">
                {custSug.map((c) => (
                  <li
                    key={c._id}
                    onClick={() => {
                      setCustId(c._id);
                      setCustName(`${c.firstName} ${c.lastName}`);
                      setCustPhone(c.whatAppNumber || "");
                      setCustSug([]);
                    }}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {c.firstName} {c.lastName} — {c.whatAppNumber}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* phone – becomes read-only when we picked an existing user */}
          <div className="relative">
            <FiPhone className="absolute left-3 top-3 text-gray-400" />
            <input
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              placeholder="Customer phone"
              className="pl-10 pr-3 py-2 border rounded-lg w-full"
              readOnly={!!custId}
            />
          </div>

          {/* POS */}
          <div className="relative">
            <FiMapPin className="absolute left-3 top-3 text-gray-400" />
            <input
              value={pos}
              onChange={(e) => setPOS(e.target.value)}
              placeholder="Point of sale"
              className="pl-10 pr-3 py-2 border rounded-lg w-full"
            />
          </div>
        </div>

        {/* ───── row 2  (referral) ───── */}
        <div className="grid lg:grid-cols-3 gap-4 lg:justify-items-center">
          {/* referral name – suggestions share the same list */}
          <div className="relative lg:col-start-2">
            <FiUser className="absolute left-3 top-3 text-gray-400" />
            <input
              value={refName}
              onChange={(e) => {
                setRefName(e.target.value);
                setRefId(null);
                setRefSug(suggest(e.target.value));
              }}
              onFocus={() => setShowRefSug(true)}
              onBlur={() => setTimeout(() => setShowRefSug(false), 120)}
              placeholder="Referral name"
              className="pl-10 pr-3 py-2 border rounded-lg w-full"
            />
            {showRefSug && refSug.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border rounded-lg shadow max-h-40 overflow-auto">
                {refSug.map((c) => (
                  <li
                    key={c._id}
                    onClick={() => {
                      setRefId(c._id);
                      setRefName(`${c.firstName} ${c.lastName}`);
                      setRefPhone(c.whatAppNumber || "");
                      setRefSug([]);
                    }}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {c.firstName} {c.lastName} — {c.whatAppNumber}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* referral phone */}
          <div className="relative lg:col-start-3">
            <FiPhone className="absolute left-3 top-3 text-gray-400" />
            <input
              value={refPhone}
              onChange={(e) => setRefPhone(e.target.value)}
              placeholder="Referral phone"
              className="pl-10 pr-3 py-2 border rounded-lg w-full"
              readOnly={!!refId}
            />
          </div>
        </div>
      </section>

      {/* ───────── product picker ───────── */}
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
                      ₦{p.sellingPrice.toLocaleString()}
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

      {/* ───────── delivery ───────── */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Delivery</h3>
        <div className="flex gap-4 flex-wrap">
          {[
            ["self", "Self Pick-Up"],
            ["logistics", "Logistics"],
            ["park", "Park Pick-Up"],
          ].map(([k, lbl]) => (
            <button
              key={k}
              onClick={() => setMethod(k)}
              className={`px-4 py-1.5 rounded-lg border ${
                method === k
                  ? "bg-orange-600 text-white border-orange-600"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>

        {method === "logistics" && (
          <textarea
            rows={2}
            value={shipAddr}
            onChange={(e) => setShip(e.target.value)}
            placeholder="Shipping address"
            className="w-full border rounded-lg px-3 py-2"
          />
        )}
        {method === "park" && (
          <input
            value={park}
            onChange={(e) => setPark(e.target.value)}
            placeholder="Nearest bus park"
            className="w-full border rounded-lg px-3 py-2"
          />
        )}
      </section>

      {/* ───────── payment ───────── */}
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

      {/* ───────── summary / save ───────── */}
      <section className="space-y-2 max-w-sm ml-auto">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>₦{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>₦{taxTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>₦{grand.toLocaleString()}</span>
        </div>

        <button
          onClick={saveSale}
          className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg"
        >
          Complete sale
        </button>
      </section>
    </div>
  );
}
