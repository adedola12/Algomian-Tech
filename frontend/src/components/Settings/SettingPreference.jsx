/*  src/components/Settings/SettingPreference.jsx  */
import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import { FiChevronDown } from "react-icons/fi";

/* ————————————————————————————————————————————————
   Simple round switch reused everywhere
——————————————————————————————————————————————— */
const Toggle = ({ enabled, onChange }) => (
  <label className="relative inline-flex cursor-pointer items-center">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={enabled}
      onChange={() => onChange(!enabled)}
    />
    <div
      className="h-5 w-10 rounded-full bg-gray-200
                 peer-focus:ring-2 peer-focus:ring-orange-500
                 peer-checked:bg-orange-500 transition-colors"
    />
    <div
      className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white
                 shadow transition-transform peer-checked:translate-x-5"
    />
  </label>
);

export default function SettingPreference() {
  /* ———————————————————————
     Local state (fetched from DB)
  ——————————————————————— */
  const [loaded,       setLoaded]       = useState(false);
  const [autoTZ,       setAutoTZ]       = useState(false);
  const [timeZone,     setTimeZone]     = useState("Africa/Lagos");
  const [lowStock,     setLowStock]     = useState(true);
  const [includeTax,   setIncludeTax]   = useState(true);
  const [emailNotif,   setEmailNotif]   = useState(false);
  const [idMode,       setIdMode]       = useState("auto");

  /* ———————————————————————
     Fetch once on mount
  ——————————————————————— */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/users/preferences", {
          withCredentials: true,
        });
        setAutoTZ      (data.autoTimeZone);
        setTimeZone    (data.timeZone);
        setLowStock    (data.lowStockAlert);
        setIncludeTax  (data.includeTax);
        setEmailNotif  (data.emailNotification);
        setIdMode      (data.productIdMode);
        setLoaded(true);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      }
    })();
  }, []);

  /* ———————————————————————
     Persist helper
  ——————————————————————— */
  const save = (payload) =>
    api
      .put("/api/users/preferences", payload, { withCredentials: true })
      .catch((err) =>
        toast.error(err.response?.data?.message || err.message)
      );

  /* ———————————————————————
     Loading stub
  ——————————————————————— */
  if (!loaded)
    return (
      <p className="text-sm text-gray-500">Loading preferences…</p>
    );

  /* ———————————————————————
     UI
  ——————————————————————— */
  return (
    <section className="space-y-10">
      {/* ───────── Header ───────── */}
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-gray-800">Preference</h2>
        <p className="text-sm text-gray-500">
          Edit general information about your business
        </p>
      </header>

      {/* ───────── Time-zone ───────── */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Time&nbsp;Zone
        </label>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* select */}
          <div className="relative flex-1">
            <select
              value={timeZone}
              onChange={(e) => {
                setTimeZone(e.target.value);
                save({ timeZone: e.target.value });
              }}
              className="w-full rounded-md border-gray-300 pr-10
                         focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="Africa/Lagos">
                (GMT&nbsp;+01:00) Africa/Lagos
              </option>
              <option value="America/New_York">
                (GMT&nbsp;-05:00) America/New&nbsp;York
              </option>
              <option value="Asia/Tokyo">
                (GMT&nbsp;+09:00) Asia/Tokyo
              </option>
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* auto toggle */}
          <div className="flex items-center gap-3">
            <Toggle
              enabled={autoTZ}
              onChange={(v) => {
                setAutoTZ(v);
                save({ autoTimeZone: v });
              }}
            />
            <span className="text-sm text-gray-700">Set&nbsp;Automatically</span>
          </div>
        </div>
      </div>

      {/* ───────── Inventory ───────── */}
      <header className="pt-2">
        <h3 className="text-sm font-semibold text-gray-800">
          Inventory&nbsp;Settings
        </h3>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product-ID mode */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Product&nbsp;ID
          </label>
          <p className="text-xs text-gray-500">
            Control how Product&nbsp;ID’s are generated
          </p>
          <div className="relative">
            <select
              value={idMode}
              onChange={(e) => {
                setIdMode(e.target.value);
                save({ productIdMode: e.target.value });
              }}
              className="mt-1 w-full rounded-md border-gray-300 pr-10
                         focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="auto">Autogenerated</option>
              <option value="manual">Manual</option>
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Current ID count (static demo) */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Current&nbsp;ID&nbsp;Count
          </label>
          <input
            type="number"
            className="mt-1 w-full rounded-md border-gray-300
                       focus:border-orange-500 focus:ring-orange-500"
            value={1002}
            readOnly
          />
        </div>
      </div>

      {/* Low-stock toggle */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h4 className="text-sm font-medium text-gray-800">
            Low&nbsp;Stock&nbsp;Alert
          </h4>
          <p className="text-xs text-gray-500">
            Alert when stock gets to a certain level
          </p>
        </div>
        <Toggle
          enabled={lowStock}
          onChange={(v) => {
            setLowStock(v);
            save({ lowStockAlert: v });
          }}
        />
      </div>

      {/* ───────── Sales settings ───────── */}
      <header>
        <h3 className="text-sm font-semibold text-gray-800">
          Sales&nbsp;Settings
        </h3>
      </header>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">
          Taxes&nbsp;(include&nbsp;taxes&nbsp;in&nbsp;invoice)
        </span>
        <Toggle
          enabled={includeTax}
          onChange={(v) => {
            setIncludeTax(v);
            save({ includeTax: v });
          }}
        />
      </div>

      {/* ───────── Email notification ───────── */}
      <header>
        <h3 className="text-sm font-semibold text-gray-800">
          Email&nbsp;Notification
        </h3>
      </header>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700 max-w-md">
          Learn about new products or features and receive updates on how your
          business is performing. Automatically sent to your account email.
        </p>
        <Toggle
          enabled={emailNotif}
          onChange={(v) => {
            setEmailNotif(v);
            save({ emailNotification: v });
          }}
        />
      </div>
    </section>
  );
}
