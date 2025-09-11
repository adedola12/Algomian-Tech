// src/components/admin/AdminUACSummary.jsx
import { useEffect, useState } from "react";
import api from "../../api";
import useMe from "../../hooks/useMe";

export default function AdminUACSummary() {
  const me = useMe();
  const isAdmin = (me?.userType || "").toLowerCase() === "admin";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return setLoading(false);
    (async () => {
      try {
        const { data } = await api.get("/api/reports/agent-kpis", {
          withCredentials: true,
        });
        setRows(data.rows || []);
      } catch (err) {
        console.error(err);
        setRows([]); // keep the table empty
        // optionally show a toast/error text
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

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
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
