// src/components/Settings/SettingUser.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FiTrash2, FiEdit2, FiCheck, FiX, FiSearch } from "react-icons/fi";
import api from "../../api";
import { toast } from "react-toastify";

const ROLES = [
  "Admin",
  "Manager",
  "SalesRep",
  "Inventory",
  "Logistics",
  "Customer",
];

export default function SettingUser() {
  const [highlight, setHighlight] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // search
  const [query, setQuery] = useState("");

  // inline edit
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ userType: "", whatAppNumber: "" });
  const [savingId, setSavingId] = useState(null);

  /* ───────── load & search ───────── */
  const loadUsers = async (q = "") => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/users/all", {
        params: q ? { q } : undefined,
      });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      loadUsers(query.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [users, query]);

  /* ───────── actions ───────── */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting user");
    }
  };

  const startEdit = (user) => {
    setEditId(user._id);
    setForm({
      userType: user.userType || "Customer",
      whatAppNumber: user.whatAppNumber || "",
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ userType: "", whatAppNumber: "" });
  };

  const handleSave = async (id) => {
    setSavingId(id);
    try {
      // Save both role & phone in one go
      const payload = {
        userType: form.userType,
        whatAppNumber: String(form.whatAppNumber || "").trim(),
      };
      const { data } = await api.put(`/api/users/${id}`, payload);

      // Update row
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, ...data } : u))
      );

      toast.success("User updated");
      cancelEdit();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating user");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      {/* header / search */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Users</h2>
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded border px-9 py-2 text-sm"
          />
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block overflow-x-auto rounded-md border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500">
            <tr>
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone Number</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Last Active</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : filtered.length ? (
              filtered.map((u) => {
                const isEditing = editId === u._id;
                return (
                  <tr
                    key={u._id}
                    onClick={() => setHighlight(u._id)}
                    className={
                      highlight === u._id
                        ? "bg-blue-50 ring-2 ring-blue-500/60"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="flex items-center gap-3 px-4 py-4 whitespace-nowrap">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-medium text-orange-700">
                        {u.firstName?.[0] || ""}
                        {u.lastName?.[0] || ""}
                      </div>
                      <span className="text-gray-800">
                        {u.firstName} {u.lastName}
                      </span>
                    </td>

                    <td className="px-4 py-4">{u.email}</td>

                    <td className="px-4 py-4">
                      {isEditing ? (
                        <input
                          value={form.whatAppNumber}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              whatAppNumber: e.target.value,
                            }))
                          }
                          className="w-44 rounded border px-2 py-1"
                          placeholder="WhatsApp/Phone"
                        />
                      ) : (
                        u.whatAppNumber || "—"
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {isEditing ? (
                        <select
                          value={form.userType}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, userType: e.target.value }))
                          }
                          className="border rounded px-2 py-1 text-xs"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      ) : (
                        u.userType
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {u.updatedAt
                        ? new Date(u.updatedAt).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-4">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSave(u._id)}
                              disabled={savingId === u._id}
                              className="text-green-600 hover:text-green-800 disabled:opacity-50"
                              title="Save"
                            >
                              <FiCheck />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-gray-400 hover:text-gray-600"
                              title="Cancel"
                            >
                              <FiX />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startEdit(u)}
                            className="text-gray-400 hover:text-orange-600"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(u._id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No matching users
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW */}
      <ul className="md:hidden space-y-4">
        {loading ? (
          <li className="text-center text-gray-500">Loading…</li>
        ) : filtered.length ? (
          filtered.map((u) => {
            const isEditing = editId === u._id;
            return (
              <li
                key={u._id}
                onClick={() => setHighlight(u._id)}
                className={`rounded-lg border border-gray-200 p-4 shadow-sm ${
                  highlight === u._id ? "ring-2 ring-blue-500/60" : "bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-sm font-medium text-orange-700">
                    {u.firstName?.[0] || ""}
                    {u.lastName?.[0] || ""}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-800">
                      {u.firstName} {u.lastName}
                    </h3>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSave(u._id)}
                          disabled={savingId === u._id}
                          className="text-green-600 disabled:opacity-50"
                          title="Save"
                        >
                          <FiCheck />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-400"
                          title="Cancel"
                        >
                          <FiX />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(u)}
                        className="text-gray-400"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="text-red-500"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-600 space-y-2">
                  <div>
                    <p className="text-gray-500">Phone</p>
                    {isEditing ? (
                      <input
                        value={form.whatAppNumber}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            whatAppNumber: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded border px-2 py-1"
                        placeholder="WhatsApp/Phone"
                      />
                    ) : (
                      <p className="text-gray-800">{u.whatAppNumber || "—"}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-gray-500">Role</p>
                    {isEditing ? (
                      <select
                        value={form.userType}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, userType: e.target.value }))
                        }
                        className="mt-1 w-full rounded border px-2 py-1"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-800">{u.userType}</p>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-500">
                    Last Active:{" "}
                    {u.updatedAt
                      ? new Date(u.updatedAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </li>
            );
          })
        ) : (
          <li className="text-center text-gray-500">No matching users</li>
        )}
      </ul>
    </>
  );
}
