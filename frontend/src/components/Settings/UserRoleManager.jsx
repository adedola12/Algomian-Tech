import React, { useEffect, useState } from "react";
import api from "../../api";

export default function UserRoleManager({ role, onBack }) {
  const [users, setUsers] = useState([]);
  const [updatedRoles, setUpdatedRoles] = useState({});
  const [roles, setRoles] = useState([
    "Admin",
    "Manager",
    "SalesRep",
    "Customer",
    "Logistics",
    "Procurement",
    "Inventory",
  ]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/api/users/customerlist");
        const filtered = data.filter((u) => u.userType === role);
        setUsers(filtered);
      } catch (err) {
        console.error("Failed to fetch users for role", err);
      }
    };
    fetchUsers();
  }, [role]);

  const handleChange = (userId, newRole) => {
    setUpdatedRoles((prev) => ({ ...prev, [userId]: newRole }));
  };

  const handleSave = async (userId) => {
    try {
      const userType = updatedRoles[userId];
      await api.put(`/api/users/${userId}/role`, { userType });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, userType } : u))
      );
      alert("User role updated successfully!");
    } catch (err) {
      console.error("Failed to update role", err);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{role} Users</h2>
        <button onClick={onBack} className="text-sm text-orange-600">
          ← Back
        </button>
      </div>
      <table className="w-full text-sm border border-gray-200 rounded-md">
        <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-t">
              <td className="px-4 py-2">
                {user.firstName} {user.lastName}
              </td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">
                <select
                  value={updatedRoles[user._id] || user.userType}
                  onChange={(e) => handleChange(user._id, e.target.value)}
                  className="border border-gray-300 px-2 py-1 rounded-md"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => handleSave(user._id)}
                  className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
