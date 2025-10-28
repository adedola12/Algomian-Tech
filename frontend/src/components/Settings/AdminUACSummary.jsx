// src/pages/admin/AdminUACSummary.jsx (or your original path)
import { useEffect, useState } from "react";
import api from "../../api";
import useMe from "../../hooks/useMe";
import { toast } from "react-toastify";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function AdminUACSummary() {
  const me = useMe();
  const isAdmin = (me?.userType || "").toLowerCase() === "admin";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openFor, setOpenFor] = useState(null); // userId whose actions are open
  const [actions, setActions] = useState([]);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [transferLogs, setTransferLogs] = useState([]);
  const [transferLoading, setTransferLoading] = useState(false);

  // mobile "more details" toggles per userId
  const [expandedRows, setExpandedRows] = useState(() => new Set());

  const firstName = (full = "") => {
    const parts = String(full).trim().split(/\s+/);
    return parts[0] || "";
  };
  const roleInitial = (role = "") =>
    String(role).trim().charAt(0).toUpperCase() || "-";

  useEffect(() => {
    if (!isAdmin) return setLoading(false);
    (async () => {
      try {
        const { data } = await api.get("/api/reports/agent-kpis", {
          withCredentials: true,
        });
        setRows(Array.isArray(data.rows) ? data.rows : []);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  // load recent transfer logs (admin only)
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setTransferLoading(true);
      try {
        const { data } = await api.get("/api/reports/transfer-logs", {
          params: { limit: 200 },
          withCredentials: true,
        });
        setTransferLogs(data.items || []);
      } catch (e) {
        toast.error(
          e?.response?.data?.message || "Failed to load transfer logs"
        );
      } finally {
        setTransferLoading(false);
      }
    })();
  }, [isAdmin]);

  const loadActions = async (userId) => {
    setOpenFor(userId);
    setActionsLoading(true);
    try {
      const { data } = await api.get("/api/reports/agent-activity", {
        params: { userId, limit: 50 },
      });
      setActions(data.items || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load activity");
      setActions([]);
    } finally {
      setActionsLoading(false);
    }
  };

  const undoDelete = async (orderId) => {
    try {
      await api.patch(`/api/orders/${orderId}/restore`);
      toast.success("Order restored");
      if (openFor) loadActions(openFor);
    } catch (e) {
      toast.error(e.response?.data?.message || "Restore failed");
    }
  };

  const toggleExpanded = (userId) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  if (!isAdmin)
    return (
      <p className="text-sm text-gray-500">
        You don’t have access to this page.
      </p>
    );
  if (loading) return <p>Loading…</p>;

  return (
    <div className="bg-white rounded-none md:rounded-2xl shadow p-3 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">
        User Activity & Sales
      </h2>

      {/* Desktop / Tablet table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full whitespace-nowrap">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-500 text-xs uppercase">
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Sales</th>
              <th className="px-4 py-3 text-left">Sales Total</th>
              <th className="px-4 py-3 text-left">Returns</th>
              <th className="px-4 py-3 text-left">Returned ₦</th>
              <th className="px-4 py-3 text-left">Products Added</th>
              <th className="px-4 py-3 text-left">Orders Deleted</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.userId} className="border-b">
                <td className="px-4 py-3">{firstName(r.name)}</td>
                <td className="px-4 py-3 text-gray-600">{r.role}</td>
                <td className="px-4 py-3">{r.salesCount}</td>
                <td className="px-4 py-3">
                  ₦{Number(r.salesTotal || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3">{r.returns}</td>
                <td className="px-4 py-3">
                  ₦{Number(r.returnedValue || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3">{r.productsAdded}</td>
                <td className="px-4 py-3">{r.ordersDeleted}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => loadActions(r.userId)}
                    className="px-3 py-1.5 rounded bg-orange-600 text-white text-xs"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={9}>
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile list (cards) */}
      <div className="md:hidden divide-y rounded-lg border">
        {/* Header row for mobile */}
        <div className="grid grid-cols-5 items-center bg-gray-50 text-xs uppercase text-gray-600 px-3 py-2">
          <div className="col-span-2">User</div>
          <div className="text-center">R</div>
          <div className="text-center">Sales</div>
          <div className="text-center">Returns</div>
        </div>

        {rows.map((r) => {
          const isOpen = expandedRows.has(r.userId);
          return (
            <div key={r.userId} className="px-3 py-2">
              {/* Top compact row */}
              <div className="grid grid-cols-5 items-center">
                <div className="col-span-2 font-medium truncate">
                  {firstName(r.name)}
                </div>
                <div className="text-center text-gray-700">
                  {roleInitial(r.role)}
                </div>
                <div className="text-center">{r.salesCount}</div>
                <div className="text-center">{r.returns}</div>
              </div>

              {/* Actions row (View + More) */}
              <div className="mt-2 flex items-center justify-between">
                <button
                  onClick={() => loadActions(r.userId)}
                  className="px-3 py-1.5 rounded bg-orange-600 text-white text-xs"
                >
                  View
                </button>

                <button
                  onClick={() => toggleExpanded(r.userId)}
                  className="text-xs px-3 py-1.5 rounded border hover:bg-gray-50 flex items-center gap-1"
                  aria-expanded={isOpen}
                  aria-controls={`hidden-${r.userId}`}
                >
                  {isOpen ? (
                    <>
                      <FiChevronUp /> Hide
                    </>
                  ) : (
                    <>
                      <FiChevronDown /> More
                    </>
                  )}
                </button>
              </div>

              {/* Hidden details (mobile only) */}
              {isOpen && (
                <div
                  id={`hidden-${r.userId}`}
                  className="mt-3 rounded-lg border bg-gray-50 p-3 text-sm space-y-2"
                >
                  <DetailRow
                    label="Sales Total"
                    value={`₦${Number(r.salesTotal || 0).toLocaleString()}`}
                  />
                  <DetailRow
                    label="Returned ₦"
                    value={`₦${Number(r.returnedValue || 0).toLocaleString()}`}
                  />
                  <DetailRow label="Products Added" value={r.productsAdded} />
                  <DetailRow label="Orders Deleted" value={r.ordersDeleted} />
                  <DetailRow label="Role" value={r.role || "-"} />
                </div>
              )}
            </div>
          );
        })}

        {!rows.length && (
          <div className="px-3 py-6 text-center text-gray-500">No data</div>
        )}
      </div>

      {/* Drawer / Modal – fully mobile responsive & scrollable */}
      {openFor && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center sm:justify-center"
          onClick={() => setOpenFor(null)}
        >
          <div
            className="bg-white w-full sm:max-w-3xl rounded-t-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* drag handle for mobile */}
            <div className="sm:hidden h-5 w-full flex items-center justify-center">
              <span className="h-1.5 w-12 bg-gray-300 rounded-full" />
            </div>

            <div className="px-4 sm:px-6 pb-4 pt-2 sm:pt-4 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-semibold">
                  Recent Actions
                </h3>
                <button
                  onClick={() => setOpenFor(null)}
                  className="text-gray-500 text-lg leading-none px-2"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Actions */}
              {actionsLoading ? (
                <p>Loading…</p>
              ) : actions.length ? (
                <ul className="divide-y rounded-lg border">
                  {actions.map((a) => (
                    <li
                      key={a.id}
                      className="py-3 px-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {a.action
                            .replace("order.", "Order ")
                            .replace("product.", "Product ")}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {a.title} —{" "}
                          <span className="text-gray-500">
                            ({a.targetType} • {String(a.targetId)})
                          </span>
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(
                            a.createdAt || a.time || Date.now()
                          ).toLocaleString()}
                        </p>
                      </div>

                      {a.action === "order.delete" && (
                        <button
                          onClick={() => undoDelete(a.targetId)}
                          className="px-3 py-1.5 rounded border text-xs hover:bg-gray-50 shrink-0"
                        >
                          Undo delete
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}

              {/* Transfer log */}
              <div className="mt-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Recent Product Transfers
                </h3>
                {transferLoading ? (
                  <p>Loading…</p>
                ) : transferLogs.length ? (
                  <ul className="divide-y rounded-lg border max-h-[40vh] overflow-y-auto">
                    {transferLogs.map((l) => (
                      <li key={l._id} className="py-2 px-3 text-sm">
                        <span className="font-medium">
                          {l.meta?.productName || "Product"}
                        </span>{" "}
                        — moved <b>{l.meta?.qty}</b> from <b>{l.meta?.from}</b>{" "}
                        to <b>{l.meta?.to}</b>{" "}
                        <span className="text-gray-500">
                          ({new Date(l.createdAt).toLocaleString()})
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No transfers yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- Small helper row for mobile hidden details --- */
function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{String(value ?? "-")}</span>
    </div>
  );
}
