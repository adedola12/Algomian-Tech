/*  src/components/Settings/SettingUAC.jsx  */
import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import SettingUser from "./SettingUser";
import AddNewRoleModal from "./AddNewRoleModal";
import AddNewUserModal from "./AddNewUserModal";
import UserTypePermissionManager from "./UserTypePermissionManager";
import api from "../../api";

export default function SettingUAC() {
  /* ---------------- local state ---------------- */
  const [activeTab, setActiveTab] = useState("roles"); // roles | users
  const [editingType, setEditingType] = useState(null); // ← click target
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  /* These are the only “roles” in the system */
  const userTypes = [
    "Admin",
    "Manager",
    "SalesRep",
    "Customer",
    "Logistics",
    "Procurement",
    "Inventory",
  ];

  /* ---------------- handlers ------------------- */
  const handleAddUser = async (payload) => {
    const newUser = {
      firstName: "Sales",
      lastName: "User",
      whatAppNumber: "0000000000",
      email: payload.email,
      password: "adminpass065",
      userType: payload.role,
    };
    try {
      await api.post("/api/users/admin-create", newUser);
      alert("User created!");
      setShowUserModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create user");
    }
  };

  /* ---------------- render --------------------- */
  const headline =
    activeTab === "roles"
      ? "Define and manage permissions for every user type"
      : "Define and manage users";

  const ctaLabel = activeTab === "roles" ? "Create Role" : "Add New User";

  return (
    <>
      <section className="space-y-8">
        {/* header */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              User Management
            </h2>
            <p className="text-sm text-gray-500">{headline}</p>
          </div>

          <button
            onClick={() =>
              activeTab === "roles"
                ? setShowRoleModal(true)
                : setShowUserModal(true)
            }
            className="inline-flex items-center gap-2 rounded-md bg-orange-600 px-4 py-2
                       text-sm font-medium text-white hover:bg-orange-700"
          >
            <FiPlus className="text-base" />
            {ctaLabel}
          </button>
        </header>

        {/* mini-tabs */}
        <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
          {["roles", "users"].map((k) => (
            <button
              key={k}
              onClick={() => setActiveTab(k)}
              className={
                activeTab === k
                  ? "bg-orange-500/20 text-orange-600 px-5 py-1.5 text-sm font-medium"
                  : "px-5 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              }
            >
              {k === "roles" ? "User Roles" : "Users"}
            </button>
          ))}
        </div>

        {/* body */}
        {editingType ? (
          /* ────────────────────────────────
             permission matrix for one userType
             ──────────────────────────────── */
          <UserTypePermissionManager
            userType={editingType}
            onBack={() => setEditingType(null)}
          />
        ) : activeTab === "roles" ? (
          /* ───────── list of userTypes ───── */
          <ul className="divide-y divide-gray-100 pt-6">
            {userTypes.map((t) => (
              <li
                key={t}
                className="flex items-center justify-between py-5 sm:py-6"
              >
                <span className="text-gray-800">{t}</span>
                <button
                  onClick={() => setEditingType(t)}
                  className="text-sm font-medium text-orange-600 hover:underline"
                >
                  Edit&nbsp;User&nbsp;Access
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <SettingUser />
        )}
      </section>

      {/* modals */}
      <AddNewRoleModal
        open={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSave={() => setShowRoleModal(false)}
      />

      <AddNewUserModal
        open={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSubmit={handleAddUser}
        roles={userTypes}
      />
    </>
  );
}
