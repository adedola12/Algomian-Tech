import React, { useState } from 'react'
import api from '../../api'
import { toast } from 'react-toastify'
import { FiEye, FiEyeOff, FiInfo } from 'react-icons/fi'

export default function SettingSecurity() {
  /* local form state (replace with Formik / React-Hook-Form later) */
  const [form, setForm] = useState({
    current: '',
    next:    '',
    confirm: '',
  })

  /* which field is visible */
  const [show, setShow] = useState({
    current: false,
    next:    false,
    confirm: false,
  })

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const toggle = key => setShow(s => ({ ...s, [key]: !s[key] }))

  const submit = async (e) => {
      e.preventDefault();
    
      // basic front-end checks
      if (form.next !== form.confirm) {
        toast.error("New passwords don’t match");
        return;
      }
      if (!/^(?=.*\\d).{6,}$/.test(form.next)) {
        toast.error("Password must be ≥ 6 chars and contain a digit");
        return;
      }
    
      try {
        await api.put(
          "/api/users/change-password",
          {
            currentPassword: form.current,
            newPassword: form.next,
          },
          { withCredentials: true }
        );
        toast.success("Password changed ✔");
        setForm({ current: "", next: "", confirm: "" });
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      }
    };

  return (
    <section className="space-y-6">
      {/* ── Heading ───────────────────────────────────────────── */}
      <header className="space-y-1">
        <h2 className="flex items-center gap-1 text-lg font-semibold text-gray-800">
          Change&nbsp;Password <FiInfo className="text-gray-400" />
        </h2>
        <p className="text-xs text-gray-500">
          Last&nbsp;changed&nbsp;Sep&nbsp;19,&nbsp;2024
        </p>
      </header>

      {/* ── Form ─────────────────────────────────────────────── */}
      <form onSubmit={submit} className="grid md:grid-cols-3 gap-6">
        {/* Current password */}
        <div className="space-y-1">
          <label
            htmlFor="current"
            className="block text-sm font-medium text-gray-700"
          >
            Current&nbsp;Password
          </label>

          <div className="relative">
            <input
              id="current"
              name="current"
              type={show.current ? 'text' : 'password'}
              placeholder="Password"
              value={form.current}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300
                         px-3 py-2 pr-10 text-sm focus:border-orange-500
                         focus:ring-1 focus:ring-orange-500"
            />
            <button
              type="button"
              onClick={() => toggle('current')}
              className="absolute inset-y-0 right-2 flex items-center text-gray-400"
            >
              {show.current ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div className="space-y-1">
          <label
            htmlFor="next"
            className="block text-sm font-medium text-gray-700"
          >
            New&nbsp;Password
          </label>

          <div className="relative">
            <input
              id="next"
              name="next"
              type={show.next ? 'text' : 'password'}
              placeholder="Password"
              value={form.next}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300
                         px-3 py-2 pr-10 text-sm focus:border-orange-500
                         focus:ring-1 focus:ring-orange-500"
            />
            <button
              type="button"
              onClick={() => toggle('next')}
              className="absolute inset-y-0 right-2 flex items-center text-gray-400"
            >
              {show.next ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div className="space-y-1">
          <label
            htmlFor="confirm"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm&nbsp;Password
          </label>

          <div className="relative">
            <input
              id="confirm"
              name="confirm"
              type={show.confirm ? 'text' : 'password'}
              placeholder="Password"
              value={form.confirm}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300
                         px-3 py-2 pr-10 text-sm focus:border-orange-500
                         focus:ring-1 focus:ring-orange-500"
            />
            <button
              type="button"
              onClick={() => toggle('confirm')}
              className="absolute inset-y-0 right-2 flex items-center text-gray-400"
            >
              {show.confirm ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        {/* Submit button (aligned with third column) */}
        <div className="md:col-start-3 md:col-end-4 flex md:justify-end">
          <button
            type="submit"
            className="mt-8 md:mt-0 inline-flex items-center
                       rounded-md bg-orange-600 px-5 py-2.5 text-sm
                       font-medium text-white hover:bg-orange-700
                       focus:outline-none focus:ring-2 focus:ring-orange-500
                       focus:ring-offset-2"
          >
            Change&nbsp;Password
          </button>
        </div>
      </form>
    </section>
  )
}
