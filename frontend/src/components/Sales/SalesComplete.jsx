import React from 'react'
import { FiX, FiPrinter } from 'react-icons/fi'
import { GiPartyPopper } from 'react-icons/gi'

export default function SalesComplete({
  change,
  onClose,
  onPrint,
  onNewSale,
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: 'rgba(255,255,255,0.2)',
        WebkitBackdropFilter: 'blur(8px)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="relative rounded-2xl shadow-lg w-full max-w-sm p-6 text-center"
        style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <FiX size={20} />
        </button>
        <h3 className="text-sm text-gray-600">
          Give <span className="font-semibold">₦{change.toFixed(2)}</span> Change
        </h3>
        <div className="my-4 flex justify-center">
          <GiPartyPopper className="text-orange-400 text-6xl" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Payment Received
        </h2>
        <button
          onClick={onPrint}
          className="inline-flex items-center text-sm text-orange-600 hover:underline mb-6"
        >
          <FiPrinter className="mr-2" /> Print Receipt
        </button>
        <button
          onClick={onNewSale ?? onClose} 
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 rounded-lg"
        >
          Start A New Sale
        </button>
      </div>
    </div>
  )
}
