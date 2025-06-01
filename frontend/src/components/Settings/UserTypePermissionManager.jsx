import React, { useEffect, useState } from "react";
import api from "../../api";
import { ALL_PERMISSIONS } from "../../constants/permissions";

export default function UserTypePermissionManager({ userType, onBack }) {
  const [policy, setPolicy] = useState(null); // { userType, permissions[] }
  const [dirty, setDirty] = useState(new Set());
  const [saving, setSaving] = useState(false);

  /* pull current ticks */
  useEffect(() => {
    api
      .get(`/api/access/${userType}`, { withCredentials: true })
      .then((res) => {
        setPolicy(res.data);
        setDirty(new Set(res.data.permissions));
      });
  }, [userType]);

  const toggle = (p) =>
    setDirty((s) => {
      const nxt = new Set(s);
      nxt.has(p) ? nxt.delete(p) : nxt.add(p);
      return nxt;
    });

  const save = async () => {
    setSaving(true);
    await api.put(
      `/api/access/${userType}`,
      { permissions: [...dirty] },
      { withCredentials: true }
    );
    setSaving(false);
    alert("Saved!");
    onBack();
  };

  if (!policy) return <p className="p-4">Loading…</p>;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Permissions – {userType}</h2>
        <button onClick={onBack} className="text-sm text-orange-600">
          ← Back
        </button>
      </div>

      <ul className="space-y-2">
        {ALL_PERMISSIONS.map((p) => (
          <li key={p.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 text-orange-600"
              checked={dirty.has(p.id)}
              onChange={() => toggle(p.id)}
            />
            <span>{p.label}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={save}
        disabled={saving}
        className="px-6 py-2 rounded bg-orange-600 text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </section>
  );
}
