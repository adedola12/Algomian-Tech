import React, { useEffect, useState } from "react";
import { FiTrash2, FiEdit2, FiCheck } from "react-icons/fi";
import api from "../../api";

export default function SettingUser() {
  const [highlight, setHighlight] = useState(null);
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [newRole, setNewRole] = useState("");
  const roles = ["Admin", "Manager", "SalesRep", "Customer"];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/api/users/customerlist");
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Error deleting user");
    }
  };

  const handleEdit = (id, currentRole) => {
    setEditId(id);
    setNewRole(currentRole);
  };

  const handleSave = async (id) => {
    try {
      await api.put(`/api/users/${id}/role`, { userType: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, userType: newRole } : u))
      );
      setEditId(null);
      alert("Role updated");
    } catch (err) {
      console.error(err);
      alert("Error updating role");
    }
  };

  return (
    <>
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
            {users.map((u) => (
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
                <td className="px-4 py-4">{u.whatAppNumber}</td>
                <td className="px-4 py-4">
                  {editId === u._id ? (
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="border rounded px-2 py-1 text-xs"
                    >
                      {roles.map((r) => (
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
                  {new Date(u.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 text-right flex justify-end gap-4">
                  {editId === u._id ? (
                    <button
                      onClick={() => handleSave(u._id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <FiCheck />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(u._id, u.userType)}
                      className="text-gray-400 hover:text-orange-600"
                    >
                      <FiEdit2 />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW */}
      <ul className="md:hidden space-y-4">
        {users.map((u) => (
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
                {editId === u._id ? (
                  <button
                    onClick={() => handleSave(u._id)}
                    className="text-green-600"
                  >
                    <FiCheck />
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(u._id, u.userType)}
                    className="text-gray-400"
                  >
                    <FiEdit2 />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(u._id)}
                  className="text-red-500"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              <p>Phone: {u.whatAppNumber}</p>
              <p>
                Role:{" "}
                {editId === u._id ? (
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="mt-1 w-full rounded border px-2 py-1 text-xs"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  u.userType
                )}
              </p>
              <p>Last Active: {new Date(u.updatedAt).toLocaleDateString()}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
