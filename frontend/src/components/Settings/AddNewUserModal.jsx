/* src/components/Settings/AddNewUserModal.jsx */
import React, { useState } from 'react'
import { FiX } from 'react-icons/fi'

export default function AddNewUserModal({
  open,
  onClose,
  onSubmit,
  roles = ['Admin', 'Sales Representative', 'Accountant'],
}) {
  const [form, setForm] = useState({ email: '', role: '' })
  if (!open) return null

  const change = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    onSubmit?.(form)
    setForm({ email: '', role: '' })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-white/30 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-lg shadow-xl
                   pt-8 pb-10 px-6 sm:px-10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-center text-xl font-medium text-gray-800 mb-8">
          Add New User
        </h2>

        <form onSubmit={submit} className="space-y-8">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={change('email')}
              placeholder="Enter User Email"
              className="w-full rounded-md border border-gray-300 px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={form.role}
              onChange={change('role')}
              className="w-full rounded-md border border-gray-300 px-4 py-3
                         appearance-none focus:outline-none focus:ring-2
                         focus:ring-orange-500"
              required
            >
              <option value="" disabled>
                Select Role
              </option>
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-orange-600 py-3 text-white
                       font-medium hover:bg-orange-700 focus:outline-none
                       focus:ring-2 focus:ring-orange-500"
          >
            Add User
          </button>
        </form>
      </div>
    </div>
  )
}
