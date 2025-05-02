// src/components/customers/CustomerSideBar.jsx
import React, { useState } from 'react'
import { FiCopy } from 'react-icons/fi'

export default function CustomerSideBar({ user, className = '' }) {
  const [blacklisted, setBlacklisted] = useState(false)


  const initials = (user.name || "NA").split(" ").map(w => w[0]).join("")

  const fmtDate  = iso =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  /* a tiny helper to reduce duplication when listing fields */
  /* helper inside CustomerSideBar.jsx  */
const Field = ({ label, value }) => (
    <div className="space-y-1">
      {/* label (grey) */}
      <span className="text-gray-500">{label}</span>
  
      {/* value row – text + copy button */}
      <span className="flex items-start justify-between gap-2 break-words">
        <span className="text-gray-800">{value}</span>
  
        <button
          title="Copy"
          onClick={() => navigator.clipboard.writeText(value)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <FiCopy />
        </button>
      </span>
    </div>
  )
  

  return (
    <aside
      className={`
        bg-white rounded-lg shadow
        flex flex-col h-full
        divide-y divide-gray-100   /* neat horizontal rules */
        ${className}
      `}
    >
      {/* ─── Header ──────────────────────────────── */}
      <header className="p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-lg font-semibold text-orange-600">
          {initials}
        </div>

        <div className="space-y-0.5">
          <h2 className="text-lg font-semibold text-gray-800 leading-none">{user.name}</h2>
          <p className="text-xs text-gray-500">Added on {fmtDate(user.added)}</p>
        </div>
      </header>

      {/* ─── Details list ────────────────────────── */}
      <section className="flex-1 p-6 space-y-5 text-sm">
        <Field label="Customer ID"       value={user.id} />
        <Field label="Email address"     value={user.email} />
        <Field label="Phone number"      value={user.phone} />
        <Field label="Shipping address"  value={user.address} />
        <Field label="Last visited"      value={fmtDate(user.lastVisited)} />

        {/* Status pill */}
        <div className="space-y-1 pt-1">
          <span className="text-gray-500">Status</span><br />
          <span className="inline-flex px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            {user.status}
          </span>
        </div>
      </section>

      {/* ─── Black-list toggle ───────────────────── */}
      <footer className="p-6 flex items-center justify-between">
        <span className="text-sm text-gray-700">Blacklist this customer</span>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={blacklisted}
            onChange={() => setBlacklisted(!blacklisted)}
          />
          <div
            className="
              w-11 h-6 rounded-full bg-gray-200
              peer-checked:bg-orange-600
              after:absolute after:top-0.5 after:left-0.5
              after:w-5 after:h-5 after:bg-white after:rounded-full after:transition
              peer-checked:after:translate-x-full
            "
          />
        </label>
      </footer>
    </aside>
  )
}
