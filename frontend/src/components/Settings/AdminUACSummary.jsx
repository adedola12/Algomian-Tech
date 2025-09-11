import { useEffect, useState } from "react";
import api from "../../api";
import useMe from "../../hooks/useMe";
import { toast } from "react-toastify";

export default function AdminUACSummary() {
  const me = useMe();
  const isAdmin = (me?.userType || "").toLowerCase() === "admin";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openFor, setOpenFor] = useState(null); // userId whose actions are open
  const [actions, setActions] = useState([]);
  const [actionsLoading, setActionsLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return setLoading(false);
    (async () => {
      try {
        const { data } = await api.get("/api/reports/agent-kpis", {
          withCredentials: true,
        });
        setRows(data.rows || []);
      } finally {
        setLoading(false);
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
      // refresh actions so the row shows restored state
      if (openFor) loadActions(openFor);
      // optional: refresh summary table
    } catch (e) {
      toast.error(e.response?.data?.message || "Restore failed");
    }
  };

  if (!isAdmin)
    return (
      <p className="text-sm text-gray-500">
        You don’t have access to this page.
      </p>
    );
  if (loading) return <p>Loading…</p>;

  return (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-6 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">User Activity & Sales</h2>
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
              <td className="px-4 py-3">{r.name}</td>
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

      {/* Drawer / Modal */}
      {openFor && (
        <div
          className="fixed inset-0 bg-black/30 flex items-end sm:items-center sm:justify-center z-50"
          onClick={() => setOpenFor(null)}
        >
          <div
            className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Recent Actions</h3>
              <button
                onClick={() => setOpenFor(null)}
                className="text-gray-500"
              >
                ✕
              </button>
            </div>

            {actionsLoading ? (
              <p>Loading…</p>
            ) : actions.length ? (
              <ul className="divide-y">
                {actions.map((a) => (
                  <li
                    key={a.id}
                    className="py-3 flex items-center justify-between gap-3"
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
                    </div>

                    {/* Undo button only for deleted orders */}
                    {a.action === "order.delete" && (
                      <button
                        onClick={() => undoDelete(a.targetId)}
                        className="px-3 py-1.5 rounded border text-xs hover:bg-gray-50"
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
          </div>
        </div>
      )}
    </div>
  );
}
