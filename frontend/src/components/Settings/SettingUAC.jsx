/*  src/components/Settings/SettingUAC.jsx  */
import React, { useState } from 'react'
import { FiPlus }           from 'react-icons/fi'
import SettingUser          from './SettingUser'
import AddNewRoleModal      from './AddNewRoleModal'
import AddNewUserModal      from './AddNewUserModal'

export default function SettingUAC() {
  /* which sub-page is visible */
  const [activeTab, setActiveTab] = useState('roles')   // 'roles' | 'users'

  /* modal controls */
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)

  /* demo payload – swap for API data later */
  const roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Sales Representative' },
    { id: 3, name: 'Accountant' },
  ]

  /* helpers */
  const headline =
    activeTab === 'roles'
      ? 'Define and manage different user roles'
      : 'Define and manage users'

  const ctaLabel = activeTab === 'roles' ? 'Create Role' : 'Add New User'

  /* placeholder save handlers */
  const handleSaveRole = (name) => {
    console.log('ROLE ADDED →', name)
    setShowRoleModal(false)
  }

  const handleAddUser = (payload) => {
    console.log('USER ADDED →', payload)
    setShowUserModal(false)
  }

  /* ───────────────────────────────────────── */
  return (
    <>
      {/* main card */}
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
            type="button"
            onClick={() =>
              activeTab === 'roles'
                ? setShowRoleModal(true)
                : setShowUserModal(true)
            }
            className="inline-flex items-center gap-2 rounded-md bg-orange-600
                       px-4 py-2 text-sm font-medium text-white
                       hover:bg-orange-700 focus:outline-none focus:ring-2
                       focus:ring-orange-500 focus:ring-offset-2"
          >
            <FiPlus className="text-base" />
            {ctaLabel}
          </button>
        </header>

        {/* mini-tabs */}
        <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
          {['roles', 'users'].map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={
                activeTab === key
                  ? 'bg-orange-500/20 text-orange-600 px-5 py-1.5 text-sm font-medium'
                  : 'px-5 py-1.5 text-sm text-gray-600 hover:bg-gray-50'
              }
            >
              {key === 'roles' ? 'User Roles' : 'Users'}
            </button>
          ))}
        </div>

        {/* body */}
        {activeTab === 'roles' ? (
          <ul className="divide-y divide-gray-100 pt-6">
            {roles.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between py-5 sm:py-6"
              >
                <span className="text-gray-800">{r.name}</span>
                <button
                  type="button"
                  className="text-sm font-medium text-orange-600 hover:underline"
                >
                  Edit&nbsp;User&nbsp;Role
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
        onSave={handleSaveRole}
      />

      <AddNewUserModal
        open={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSubmit={handleAddUser}
        roles={roles.map((r) => r.name)}
      />
    </>
  )
}
