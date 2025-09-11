import React, { useEffect, useState } from "react";
import api from "../../api";

export default function UserRoleManager({ role, onBack }) {
  const [users, setUsers] = useState([]);
  const [updatedRoles, setUpdatedRoles] = useState({});
  const roles = [
    "Admin",
    "Manager",
    "SalesRep",
    "Customer",
    "Logistics",
    "Procurement",
    "Inventory",
  ];

  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // 1) who am I?
    api
      .get("/api/users/profile", { withCredentials: true })
      .then(({ data }) => setCurrentUserId(data._id))
      .catch(() => setCurrentUserId(null));

    // 2) list all users, then filter by requested role for this view
    api
      .get("/api/users/all", { withCredentials: true })
      .then(({ data }) => setUsers(data.filter((u) => u.userType === role)))
      .catch((err) => console.error("Failed to fetch users", err));
  }, [role]);

  const handleChange = (userId, newRole) => {
    setUpdatedRoles((prev) => ({ ...prev, [userId]: newRole }));
  };

  const handleSave = async (userId) => {
    try {
      // fall back to current value if this row wasn’t touched
      const current = users.find((u) => u._id === userId)?.userType;
      const userType = updatedRoles[userId] ?? current;

      await api.put(
        `/api/users/${userId}/role`,
        { userType },
        { withCredentials: true }
      );

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, userType } : u))
      );

      // if I changed my own role, refresh JWT/permissions cookie
      if (currentUserId && userId === currentUserId) {
        const { data } = await api.post(
          "/api/users/refresh-permissions",
          {},
          { withCredentials: true }
        );
        // If you keep auth in context/localStorage, update it here using `data`
        // e.g. setAuth(data) or localStorage.setItem('userInfo', JSON.stringify(data))
      }

      alert("User role updated successfully!");
    } catch (err) {
      console.error("Failed to update role", err);
      alert(err?.response?.data?.message || "Failed to update role");
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
                  value={updatedRoles[user._id] ?? user.userType}
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
          {users.length === 0 && (
            <tr>
              <td className="px-4 py-8 text-center text-gray-500" colSpan={4}>
                No users with role “{role}”.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
