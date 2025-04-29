// src/pages/settings/Settings.jsx
import { useState } from 'react'
import SettingProfile     from '../../components/Settings/SettingProfile'
import SettingPreference  from '../../components/Settings/SettingPreference'
import SettingUAC         from '../../components/Settings/SettingUAC'
import SettingSecurity from '../../components/Settings/SettingSecurity'


const TABS = [
  { key: 'profile',     label: 'Profile',            component: SettingProfile },
  { key: 'pref',        label: 'Preference',         component: SettingPreference },
  { key: 'uac',         label: 'User Access Control',component: SettingUAC },
  { key: 'security',    label: 'Security',           component: SettingSecurity },
]

export default function Settings() {
  const [active, setActive] = useState('profile')
  const ActiveComp          = TABS.find(t => t.key === active).component

  return (
    <main className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* ─── Tab bar ───────────────────────────────────────────── */}
        <nav className="border-b border-gray-200 mb-6 flex gap-8 text-sm font-medium">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={
                active === tab.key
                  ? 'text-orange-600 pb-2 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-800 pb-2'
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ─── Active panel ─────────────────────────────────────── */}
        <section className="bg-white rounded-lg shadow p-6">
          <ActiveComp />
        </section>
      </div>
    </main>
  )
}
