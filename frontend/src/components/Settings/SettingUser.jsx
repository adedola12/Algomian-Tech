import React, { useState } from 'react'
import { FiTrash2, FiEdit2 } from 'react-icons/fi'

/* mock data – replace with an API call later */
const rows = Array.from({ length: 4 }).map((_, i) => ({
  id:         i + 1,
  name:       'Henry Smith',
  email:      'henrysmith@gmail.com',
  phone:      '09078654456',
  role:       'Admin',
  lastActive: '9 Minutes ago',
  avatar:     `https://i.pravatar.cc/40?img=${i + 15}`,
}))

export default function SettingUser() {
  const [highlight, setHighlight] = useState(null)   // outline selected row

  /* ───────────────────────────  DESKTOP  ────────────────────────── */
  return (
    <>
      {/* TABLE – shown from md and up */}
      <div className="hidden md:block overflow-x-auto rounded-md border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500">
            <tr>
              <th className="px-4 py-3">Full&nbsp;Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone&nbsp;Number</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Last&nbsp;Active</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rows.map((u) => (
              <tr
                key={u.id}
                onClick={() => setHighlight(u.id)}
                className={
                  highlight === u.id
                    ? 'bg-blue-50 ring-2 ring-blue-500/60'
                    : 'hover:bg-gray-50'
                }
              >
                {/* Name + avatar */}
                <td className="flex items-center gap-3 px-4 py-4 whitespace-nowrap">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="text-gray-800">{u.name}</span>
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-gray-700">{u.email}</td>
                <td className="px-4 py-4 whitespace-nowrap text-gray-700">{u.phone}</td>
                <td className="px-4 py-4 whitespace-nowrap text-gray-700">{u.role}</td>
                <td className="px-4 py-4 whitespace-nowrap text-gray-700">{u.lastActive}</td>

                {/* action icons */}
                <td className="px-4 py-4 whitespace-nowrap text-right flex items-center justify-end gap-4">
                  <button className="text-gray-400 hover:text-orange-600">
                    <FiTrash2 />
                  </button>
                  <button className="text-gray-400 hover:text-orange-600">
                    <FiEdit2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ───────────────────────────  MOBILE  ───────────────────────── */}
      <ul className="md:hidden space-y-4">
        {rows.map((u) => (
          <li
            key={u.id}
            onClick={() => setHighlight(u.id)}
            className={`rounded-lg border border-gray-200 p-4 shadow-sm
                        ${highlight === u.id ? 'ring-2 ring-blue-500/60' : 'bg-white'}`}
          >
            <header className="flex items-center gap-3">
              <img
                src={u.avatar}
                alt={u.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-800">{u.name}</h3>
                <p className="text-xs text-gray-500">{u.role}</p>
              </div>

              {/* icons */}
              <div className="flex items-center gap-3">
                <button className="text-gray-400 hover:text-orange-600">
                  <FiTrash2 />
                </button>
                <button className="text-gray-400 hover:text-orange-600">
                  <FiEdit2 />
                </button>
              </div>
            </header>

            {/* extra meta rows */}
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-700 break-all">{u.email}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd className="text-gray-700">{u.phone}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Last&nbsp;Active</dt>
                <dd className="text-gray-700">{u.lastActive}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  )
}
