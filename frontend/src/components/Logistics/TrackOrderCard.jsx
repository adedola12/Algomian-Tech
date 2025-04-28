// src/components/TrackOrderCard.jsx
import React from 'react'

export default function TrackOrderCard({
  steps = [
    { label: 'Order has been received', time: '03:00 pm', status: 'complete' },
    { label: 'Order processing',       time: '03:20 pm', status: 'complete' },
    { label: 'Rider is on his way',     time: 'From 05:20 pm', status: 'current'  },
    { label: 'Order in transit',        time: 'From 06:00 pm', status: 'upcoming' },
    { label: 'Order delivered successfully', time: 'From 06:20 pm', status: 'upcoming' },
  ],
}) {
  const colorMap = {
    complete: 'bg-green-500 border-green-500',
    current:  'bg-green-500 border-green-500',
    upcoming: 'bg-gray-300 border-gray-300',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md w-full">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Order Tracking</h3>
      <ul className="relative border-l border-gray-200">
        {steps.map((step, idx) => (
          <li key={idx} className="mb-8 ml-6 last:mb-0">
            {/* dot */}
            <span
              className={`
                absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full border-2
                ${colorMap[step.status]}
              `}
            ></span>
            {/* content */}
            <div className="flex flex-col">
              <span
                className={`font-semibold ${
                  step.status === 'upcoming'
                    ? 'text-gray-500'
                    : 'text-gray-800'
                }`}
              >
                {step.label}
              </span>
              <time className="text-sm text-gray-500 mt-1">{step.time}</time>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
