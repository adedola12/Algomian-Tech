// src/components/CustomerTable.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../api";

/* ───────────── helpers ───────────── */
const arrow = (active, dir) => (active ? (dir === "asc" ? " ▲" : " ▼") : "");

const cmp = (a, b, key, dir) => {
  const mult = dir === "asc" ? 1 : -1;

  switch (key) {
    case "name":
      return (
        mult *
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
          "en",
          { sensitivity: "base" }
        )
      );
    case "total":
      return mult * ((a.totalOrders || 0) - (b.totalOrders || 0));
    case "last":
      return (
        mult *
        (new Date(a.lastOrderDate || 0).getTime() -
          new Date(b.lastOrderDate || 0).getTime())
      );
    case "status":
      return (
        mult *
        String(a.status || "").localeCompare(String(b.status || ""), "en", {
          sensitivity: "base",
        })
      );
    default:
      return 0;
  }
};

/* ───────── generic anchored popover ───────── */
function useOutsideClose(open, onClose, ref) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e) =>
      ref.current && !ref.current.contains(e.target) && onClose();
    const onEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose, ref]);
}

function positionRect(anchorRect, menuWidth, menuHeight) {
  const margin = 6;
  const preferBelowY = anchorRect.bottom + margin;
  const preferLeftX = anchorRect.right - menuWidth;

  const x = Math.max(
    margin,
    Math.min(preferLeftX, window.innerWidth - menuWidth - margin)
  );

  const spaceBelow = window.innerHeight - preferBelowY;
  const y =
    spaceBelow >= menuHeight
      ? preferBelowY
      : Math.max(margin, anchorRect.top - margin - menuHeight);

  return { left: x, top: y };
}

/* ───────── Fixed-position action menu (view/delete) ───────── */
function ActionMenu({ open, anchorRect, onClose, onView, onDelete }) {
  const ref = useRef(null);
  useOutsideClose(open, onClose, ref);
  if (!open || !anchorRect) return null;

  const style = positionRect(anchorRect, 192, 92);
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={ref}
        className="fixed z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg ring-1 ring-black/5 flex flex-col overflow-hidden"
        style={style}
        role="menu"
      >
        <button
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
          onClick={onView}
        >
          View customer
        </button>
        <div className="h-px bg-gray-100" />
        <button
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          onClick={onDelete}
        >
          Delete customer
        </button>
      </div>
    </>
  );
}

/* ───────── Filter popover ───────── */
function FilterMenu({
  open,
  anchorRect,
  onClose,
  statusFilter,
  setStatusFilter,
  minOrders,
  setMinOrders,
}) {
  const ref = useRef(null);
  useOutsideClose(open, onClose, ref);
  if (!open || !anchorRect) return null;

  const style = positionRect(anchorRect, 240, 160);
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={ref}
        className="fixed z-50 w-60 bg-white border border-gray-200 rounded-lg shadow-lg ring-1 ring-black/5 p-3 space-y-3"
        style={style}
      >
        <div className="text-xs font-semibold text-gray-500 px-1">
          Filter customers
        </div>

        <label className="block text-sm">
          <span className="text-gray-600">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 block w-full border rounded-md px-2 py-1.5 text-sm"
          >
            <option value="any">Any</option>
            <option value="Pending">Pending</option>
            <option value="Delivered">Delivered</option>
            <option value="NoOrder">No Order</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-gray-600">Minimum orders</span>
          <select
            value={minOrders}
            onChange={(e) => setMinOrders(Number(e.target.value))}
            className="mt-1 block w-full border rounded-md px-2 py-1.5 text-sm"
          >
            <option value={0}>0+</option>
            <option value={1}>1+</option>
            <option value={5}>5+</option>
            <option value={10}>10+</option>
          </select>
        </label>

        <div className="flex justify-end space-x-2 pt-1">
          <button
            className="px-3 py-1.5 text-sm rounded-md border"
            onClick={() => {
              setStatusFilter("any");
              setMinOrders(0);
            }}
          >
            Reset
          </button>
          <button
            className="px-3 py-1.5 text-sm rounded-md bg-gray-900 text-white"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}

/* ───────── Sort popover ───────── */
function SortMenu({
  open,
  anchorRect,
  onClose,
  sortBy,
  sortDir,
  setSortBy,
  setSortDir,
}) {
  const ref = useRef(null);
  useOutsideClose(open, onClose, ref);
  if (!open || !anchorRect) return null;

  const style = positionRect(anchorRect, 240, 210);
  const Item = ({ id, label }) => (
    <button
      className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 ${
        sortBy === id ? "font-semibold" : ""
      }`}
      onClick={() => setSortBy(id)}
    >
      {label}
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={ref}
        className="fixed z-50 w-60 bg-white border border-gray-200 rounded-lg shadow-lg ring-1 ring-black/5 p-3"
        style={style}
      >
        <div className="text-xs font-semibold text-gray-500 px-1 mb-2">
          Sort by
        </div>
        <div className="space-y-1">
          <Item id="name" label="Customer name" />
          <Item id="total" label="Total orders" />
          <Item id="last" label="Last order date" />
          <Item id="status" label="Current order status" />
        </div>
        <div className="h-px my-2 bg-gray-100" />
        <div className="text-xs font-semibold text-gray-500 px-1 mb-2">
          Direction
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`px-3 py-1.5 text-sm rounded-md border ${
              sortDir === "asc" ? "bg-gray-100" : ""
            }`}
            onClick={() => setSortDir("asc")}
          >
            Asc
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded-md border ${
              sortDir === "desc" ? "bg-gray-100" : ""
            }`}
            onClick={() => setSortDir("desc")}
          >
            Desc
          </button>
        </div>
        <div className="flex justify-end pt-3">
          <button
            className="px-3 py-1.5 text-sm rounded-md bg-gray-900 text-white"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}

/* ───────── main component ───────── */
export default function CustomerTable() {
  const [page, setPage] = useState(1);
  const perPage = 15;
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* sort state */
  const [sortBy, setSortBy] = useState("name"); // name | total | last | status
  const [sortDir, setSortDir] = useState("asc"); // asc | desc

  /* action menu state */
  const [menuFor, setMenuFor] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);

  /* top controls state */
  const [showSearch, setShowSearch] = useState(false);
  const [q, setQ] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [statusFilter, setStatusFilter] = useState("any"); // any | Pending | Delivered | NoOrder
  const [minOrders, setMinOrders] = useState(0);

  const [sortOpen, setSortOpen] = useState(false);
  const [sortAnchor, setSortAnchor] = useState(null);

  const searchInputRef = useRef(null);

  /* fetch customers */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/users/customers", {
          withCredentials: true,
        });
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* focus search input when shown */
  useEffect(() => {
    if (showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [showSearch]);

  /* go back to page 1 whenever filters/search change */
  useEffect(() => {
    setPage(1);
  }, [q, statusFilter, minOrders]);

  /* filter pipeline */
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return customers.filter((c) => {
      // search
      if (query) {
        const blob = `${c.firstName} ${c.lastName} ${c.email} ${
          c.whatAppNumber
        } ${c.status || ""}`
          .toLowerCase()
          .replace(/\s+/g, " ");
        if (!blob.includes(query)) return false;
      }

      // status filter
      if (statusFilter !== "any") {
        if (statusFilter === "NoOrder") {
          if (c.status) return false;
        } else if (c.status !== statusFilter) {
          return false;
        }
      }

      // min orders
      if ((c.totalOrders || 0) < minOrders) return false;

      return true;
    });
  }, [customers, q, statusFilter, minOrders]);

  /* sort after filtering */
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => cmp(a, b, sortBy, sortDir)),
    [filtered, sortBy, sortDir]
  );

  /* pagination */
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageData = sorted.slice((safePage - 1) * perPage, safePage * perPage);

  /* table header spec */
  const HEADERS = [
    { id: "name", label: "Customer Name", sortable: true },
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone Number" },
    { id: "total", label: "Total Orders", sortable: true },
    { id: "last", label: "Last Order Date", sortable: true },
    { id: "status", label: "Current Order Status", sortable: true },
    { id: "action", label: "Action" },
  ];

  /* delete handler */
  const handleDelete = useCallback(async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/api/users/${id}`, { withCredentials: true });
      setCustomers((prev) => prev.filter((u) => u._id !== id));
      toast.success("Customer deleted.");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 403
          ? "You don't have permission to delete users."
          : "Failed to delete customer.");
      toast.error(msg);
    } finally {
      setMenuFor(null);
      setAnchorRect(null);
    }
  }, []);

  /* open menus anchored to button */
  const openActionMenu = (evt, id) => {
    setAnchorRect(evt.currentTarget.getBoundingClientRect());
    setMenuFor((open) => (open === id ? null : id));
  };
  const openFilter = (evt) => {
    setFilterAnchor(evt.currentTarget.getBoundingClientRect());
    setFilterOpen(true);
  };
  const openSort = (evt) => {
    setSortAnchor(evt.currentTarget.getBoundingClientRect());
    setSortOpen(true);
  };

  /* UI */
  if (loading) return <p className="p-6">Loading…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      {/* Title + controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <h2 className="text-lg font-medium text-gray-800">Customers</h2>

        {/* Controls area */}
        {!showSearch ? (
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <button
              className="flex items-center space-x-1 hover:text-gray-800"
              onClick={() => setShowSearch(true)}
            >
              <FiSearch /> <span>Search</span>
            </button>
            <button
              className="flex items-center space-x-1 hover:text-gray-800"
              onClick={openFilter}
            >
              <FiFilter /> <span>Filter</span>
            </button>
            <button
              className="flex items-center space-x-1 hover:text-gray-800"
              onClick={openSort}
            >
              <FiChevronDown /> <span>Sort</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input
                ref={searchInputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search customers (name, email, phone, status)…"
                className="w-full border rounded-md pl-9 pr-8 py-2 text-sm"
              />
              {q && (
                <button
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-700"
                  onClick={() => setQ("")}
                  title="Clear"
                >
                  <FiX />
                </button>
              )}
            </div>
            <button
              className="text-sm text-gray-600 hover:text-gray-900"
              onClick={() => {
                setShowSearch(false);
                setQ("");
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Filter & Sort popovers */}
      <FilterMenu
        open={filterOpen}
        anchorRect={filterAnchor}
        onClose={() => setFilterOpen(false)}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        minOrders={minOrders}
        setMinOrders={setMinOrders}
      />
      <SortMenu
        open={sortOpen}
        anchorRect={sortAnchor}
        onClose={() => setSortOpen(false)}
        sortBy={sortBy}
        sortDir={sortDir}
        setSortBy={setSortBy}
        setSortDir={setSortDir}
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {HEADERS.map((h) => {
                const active = sortBy === h.id;
                return (
                  <th
                    key={h.id}
                    className={`px-4 py-3 text-left text-xs font-medium uppercase whitespace-nowrap ${
                      h.sortable ? "cursor-pointer select-none" : ""
                    }`}
                    onClick={() => {
                      if (!h.sortable) return;
                      if (active) {
                        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                      } else {
                        setSortBy(h.id);
                        setSortDir("asc");
                      }
                    }}
                  >
                    {h.label}
                    {h.sortable && arrow(active, sortDir)}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {pageData.map((c) => (
              <tr key={c._id} className="relative">
                {/* Name + checkbox */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-orange-600 form-checkbox"
                  />
                  <span className="ml-3 text-gray-800">{`${c.firstName} ${c.lastName}`}</span>
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                  {c.email}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                  {c.whatAppNumber}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                  {c.totalOrders > 0 ? c.totalOrders : "No Order Found"}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                  {c.lastOrderDate
                    ? new Date(c.lastOrderDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Yet to order"}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                      c.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : c.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {c.status || "No Order"}
                  </span>
                </td>

                {/* Action button */}
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={(e) => openActionMenu(e, c._id)}
                    className="text-gray-500 hover:text-gray-800"
                    aria-haspopup="menu"
                    aria-expanded={menuFor === c._id}
                  >
                    <FiMoreVertical />
                  </button>

                  {/* Popover menu (stacked) */}
                  <ActionMenu
                    open={menuFor === c._id}
                    anchorRect={anchorRect}
                    onClose={() => {
                      setMenuFor(null);
                      setAnchorRect(null);
                    }}
                    onView={() => {
                      setMenuFor(null);
                      setAnchorRect(null);
                      navigate(`/customers/${c._id}`);
                    }}
                    onDelete={() =>
                      handleDelete(c._id, `${c.firstName} ${c.lastName}`)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <span className="text-sm text-gray-500">
          Page {safePage} of {totalPages}
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={safePage === 1}
            className="p-2 border rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <FiChevronLeft />
          </button>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={safePage === totalPages}
            className="p-2 border rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <FiChevronRight />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-500">Go to page</label>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={safePage}
            onChange={(e) =>
              setPage(
                Math.min(Math.max(Number(e.target.value) || 1, 1), totalPages)
              )
            }
            className="w-16 border rounded-lg px-2 py-1 text-sm text-gray-700"
          />
        </div>
      </div>
    </section>
  );
}
