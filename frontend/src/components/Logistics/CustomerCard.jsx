// src/components/CustomerCard.jsx
import React from 'react'
import { FiChevronDown } from 'react-icons/fi'

export default function CustomerCard({
  title = 'Customers',
  name = 'Ire David',
  phone = '(+234) 809 205 4532',
  email = 'Olu4oye@gmail.com',
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-xs">
      {/* Header with dropdown icon */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-800">{title}</h3>
        <FiChevronDown className="text-gray-500" />
      </div>
      {/* Details list */}
      <dl className="space-y-2 text-sm text-gray-700">
        <div>
          <dt className="font-medium">Recipient name</dt>
          <dd>{name}</dd>
        </div>
        <div>
          <dt className="font-medium">Phone number</dt>
          <dd>{phone}</dd>
        </div>
        <div>
          <dt className="font-medium">Email</dt>
          <dd>{email}</dd>
        </div>
      </dl>
    </div>
  )
}
