// src/components/Settings/SettingProfile.jsx
import React from 'react'

export default function SettingProfile() {
  return (
    <section className="space-y-10">
      {/* ─────────────────────────────────────────────────── */}
      {/* BUSINESS INFORMATION                               */}
      {/* ─────────────────────────────────────────────────── */}
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-gray-800">
          Business Information
        </h2>
        <p className="text-sm text-gray-500">
          Edit general information about your business
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Name */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Business Name
          </label>
          <input
            type="text"
            defaultValue="Algomian Technologies"
            className="w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Business Industry */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Business Industry
          </label>
          <select className="w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500">
            <option>Laptops &amp; Electronics</option>
            <option>Fashion</option>
            <option>Groceries</option>
          </select>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            defaultValue="algomiantechnologies@gmail.com"
            className="w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            defaultValue="+2348123435668"
            className="w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────── */}
      {/* PERSONAL INFORMATION                               */}
      {/* ─────────────────────────────────────────────────── */}
      <header className="space-y-1 pt-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Personal Information
        </h2>
        <p className="text-sm text-gray-500">
          Edit administrative information about your business
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            defaultValue="Boluwatife Ajibade"
            className="w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            defaultValue="boluatalgomiantechnologies@gmail.com"
            className="w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Job Description */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Job description
          </label>
          <select className="w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500">
            <option>Manager</option>
            <option>Sales Lead</option>
            <option>Accountant</option>
          </select>
        </div>

        {/* Team Role */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Team Role
          </label>
          <select className="w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500">
            <option>Owner</option>
            <option>Administrator</option>
            <option>Editor</option>
          </select>
        </div>
      </div>
    </section>
  )
}
