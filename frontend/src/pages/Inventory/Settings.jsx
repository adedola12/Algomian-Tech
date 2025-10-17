// src/pages/settings/Settings.jsx
import { useEffect, useMemo, useState } from "react";
import useMe from "../../hooks/useMe";
import SettingProfile from "../../components/Settings/SettingProfile";
import SettingPreference from "../../components/Settings/SettingPreference";
import SettingUAC from "../../components/Settings/SettingUAC";
import SettingSecurity from "../../components/Settings/SettingSecurity";
import AdminUACSummary from "../../components/Settings/AdminUACSummary"; // ⬅️ add

const TABS = [
  { key: "profile", label: "Profile", component: SettingProfile },
  { key: "pref", label: "Preference", component: SettingPreference },
  

  // Visible to Admins or anyone with uac.view
  {
    key: "uac",
    label: "User Access Control",
    component: SettingUAC,
    needsUac: true,
  },

  // Strictly Admin-only audit/summary
  {
    key: "uacSummary",
    label: "UAC Summary",
    component: AdminUACSummary,
    onlyAdmin: true,
  },

  { key: "security", label: "Security", component: SettingSecurity },
];

export default function Settings() {
  const me = useMe();
  const isAdmin = (me?.userType || "").toLowerCase() === "admin";
  const canSeeUac =
    isAdmin ||
    (Array.isArray(me?.permissions) && me.permissions.includes("uac.view"));

  const visibleTabs = useMemo(
    () =>
      TABS.filter(
        (t) => (!t.onlyAdmin || isAdmin) && (!t.needsUac || canSeeUac)
      ),
    [isAdmin, canSeeUac]
  );

  const [active, setActive] = useState(visibleTabs[0]?.key || "profile");

  // if permissions load later and current tab becomes invalid, snap to first visible
  useEffect(() => {
    if (!visibleTabs.some((t) => t.key === active)) {
      setActive(visibleTabs[0]?.key || "profile");
    }
  }, [visibleTabs, active]);

  const currentTab =
    visibleTabs.find((t) => t.key === active) || visibleTabs[0] || TABS[0];
  const ActiveComp = currentTab.component;

  return (
    <main className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <nav className="border-b border-gray-200 mb-6 flex gap-8 text-sm font-medium">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={
                active === tab.key
                  ? "text-orange-600 pb-2 border-b-2 border-orange-600"
                  : "text-gray-600 hover:text-gray-800 pb-2"
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="bg-white rounded-lg shadow p-6">
          <ActiveComp />
        </section>
      </div>
    </main>
  );
}
