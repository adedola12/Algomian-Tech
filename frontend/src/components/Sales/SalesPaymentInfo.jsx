import React, { useState } from 'react'
import {
  FiChevronRight,
  FiTrash2,
  FiPlus,
  FiUser,
  FiPhone,
  FiMapPin,
} from 'react-icons/fi'
import SalesComplete from './SalesComplete'
import SalesPrintPreview from './SalesPrintPreview'

export default function SalesPaymentInfo({
  items = [],
  recipient = { name: 'Ire David', phone: '+234 809 205 4532' },
  pointOfSale = 'Walk-In',
  deliveryInfo = 'Logistics - 124, Oyediran Estate, Lagos, Nigeria, 5432',
  onBack,
  onDone,
}) {
  // payment and modal state
  const [method, setMethod] = useState('bank')
  const [bankAccount, setBankAccount] = useState('Moniepoint - Alogoman 2')
  const [date, setDate] = useState('2025-02-13')
  const [accountName, setAccountName] = useState('Olumide Oyeleye')
  const [amountTransferred, setAmountTransferred] = useState('3200000')

  // totals
  const subtotal = items.reduce((sum) => sum + 3150000, 0) // stub per item
  const tax = 0
  const total = subtotal + tax
  const change = parseFloat(amountTransferred) - total

  // modals
  const [showComplete, setShowComplete] = useState(false)
  const [showPrint, setShowPrint] = useState(false)

  // handlers
  const handleDone = () => setShowComplete(true)
  const handleCloseComplete = () => {
    setShowComplete(false)
    onDone()
  }
  const handlePrint = () => {
    setShowComplete(false)
    setShowPrint(true)
  }
  const handleClosePrint = () => setShowPrint(false)
  const handleNewSale = () => {
    setShowPrint(false)
    onDone()
  }

  return (
    <div className="relative">
      {/* Main form (blur when modals open) */}
      <div
        className={`bg-white rounded-2xl shadow p-4 sm:p-6 space-y-6 transition-filter duration-200 ${
          showComplete || showPrint ? 'filter blur-sm' : ''
        }`}
      >
        {/* ── Header & Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Sales Management
            </h2>
            <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">
              Sales
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
              Sales History
            </button>
          </div>
          <button className="flex items-center text-orange-600 hover:text-orange-700">
            <FiPlus className="mr-1" /> Add another order
          </button>
        </div>

        {/* ── Order Summary */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {items.map((it, i) => (
            <div
              key={it.id ?? i}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center space-x-4">
                <FiChevronRight className="text-gray-400" />
                <img
                  src={it.image}
                  alt={it.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-gray-800 font-medium">{it.name}</h3>
                  <p className="text-gray-500 text-sm">{it.specs}</p>
                  <p className="text-gray-600 text-sm">QTY: 1</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-800 font-semibold">
                  ₦{subtotal.toLocaleString()}
                </span>
                <FiTrash2 className="text-gray-400 hover:text-gray-600" />
              </div>
            </div>
          ))}
        </div>

        {/* ── Details Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="text-sm">
            <span className="font-medium text-gray-700">Recipient name</span>
            <p className="text-gray-800">{recipient.name}</p>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Phone number</span>
            <p className="text-gray-800">{recipient.phone}</p>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Point of Sales</span>
            <p className="text-gray-800">{pointOfSale}</p>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Delivery Method</span>
            <p className="text-gray-800">{deliveryInfo}</p>
          </div>
        </div>

        {/* ── Payment Box */}
        <div className="border-2 border-purple-500 rounded-lg overflow-hidden">
          <div className="bg-purple-50 px-4 py-2">
            <span className="text-purple-700 font-semibold">
              Payment method
            </span>
          </div>
          <div className="border-t border-purple-500 px-4 py-4 grid grid-cols-1 sm:grid-cols-2">
            <span className="text-gray-700 font-medium">Amount To Pay</span>
            <div className="flex justify-end">
              <span className="bg-gray-100 px-3 py-1 rounded-lg font-semibold">
                ₦{total.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="px-4 pt-4 pb-6 space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Select method of payment
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['cash', 'bank', 'card'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`w-full py-2 rounded-lg border ${
                    method === m
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {m === 'cash'
                    ? 'Cash'
                    : m === 'bank'
                    ? 'Bank Transfer'
                    : 'Card'}
                </button>
              ))}
            </div>
            {method === 'bank' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Payment was made to?
                  </label>
                  <select
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  >
                    <option>Moniepoint - Alogoman 2</option>
                    <option>Another Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name on account
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount transferred
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      ₦
                    </span>
                    <input
                      type="number"
                      value={amountTransferred}
                      onChange={(e) => setAmountTransferred(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg"
          >
            Go back
          </button>
          <button
            onClick={handleDone}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
          >
            Done
          </button>
        </div>
      </div>

      {/* Completion Modal */}
      {showComplete && (
        <SalesComplete
          change={change}
          onClose={handleCloseComplete}
          onPrint={handlePrint}
          onNewSale={handleCloseComplete}
        />
      )}

      {/* Print Preview Modal */}
      {showPrint && (
        <SalesPrintPreview
          onClose={handleClosePrint}
          onPrintPDF={handleNewSale}
          company={{
            name: 'Algorional Technologies',
            email: 'algorionaltechnologies@gmail.com',
          }}
          billedTo={recipient.name}
          date={'24th February, 2025'}
          items={[
            { sn: 1, name: 'iPhone AirPods', qty: 2, price: 5600 },
            { sn: 2, name: 'PAX - PAC Charging cable', qty: 1, price: 1200 },
          ]}
          tax={0}
        />
      )}
    </div>
  )
}
