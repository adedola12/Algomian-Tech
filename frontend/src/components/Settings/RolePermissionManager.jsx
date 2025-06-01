import React, { useEffect, useState } from "react";
import api from "../../api";
import { ALL_PERMISSIONS } from "../../constants/permissions";

export default function RolePermissionManager({ roleId, onBack }) {
  const [role, setRole] = useState(null);
  const [dirtyPerms, setDirty] = useState(new Set());
  const [saving, setSaving] = useState(false);

  /* fetch once */
  useEffect(() => {
    api.get(`/api/roles/${roleId}`, { withCredentials: true }).then((res) => {
      setRole(res.data);
      setDirty(new Set(res.data.permissions));
    });
  }, [roleId]);

  const toggle = (perm) => {
    setDirty((p) => {
      const next = new Set(p);
      next.has(perm) ? next.delete(perm) : next.add(perm);
      return next;
    });
  };

  const onSave = async () => {
    setSaving(true);
    await api.put(
      `/api/roles/${roleId}`,
      { permissions: [...dirtyPerms] },
      { withCredentials: true }
    );
    setSaving(false);
    alert("Permissions saved");
    onBack();
  };

  if (!role) return <p className="p-4">Loading…</p>;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{role.name} – permissions</h2>
        <button onClick={onBack} className="text-sm text-orange-600">
          ← Back
        </button>
      </div>

      <ul className="space-y-2">
        {ALL_PERMISSIONS.map((p) => (
          <li key={p.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={dirtyPerms.has(p.id)}
              onChange={() => toggle(p.id)}
              className="h-4 w-4 text-orange-600"
            />
            <span>{p.label}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSave}
        disabled={saving}
        className="px-5 py-2 rounded-md bg-orange-600 text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </section>
  );
}
