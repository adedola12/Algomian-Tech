// src/components/SalesTable.jsx
import React, { useState, useEffect, Fragment } from "react"
import api from "../../api"
import {
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi"
import SalesInfoInput    from "./SalesInfoInput"
import SalesDelivery     from "./SalesDelivery"
import SalesPaymentInfo  from "./SalesPaymentInfo"

export default function SalesTable() {
  const [step, setStep] = useState(0)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [invoiceFilter, setInvoiceFilter] = useState("")
  // which field to filter by
  const [filterBy, setFilterBy] = useState("Date")
  const [filterValue, setFilterValue] = useState("")

  // for capturing SalesDelivery data
  const [deliveryData, setDeliveryData] = useState({
    customerName: "",
    customerPhone: "",
    pointOfSale: "",
    deliveryMethod: "",
    shippingAddress: "",
    parkLocation: "",
    summary: { subtotal: 0, tax: 0, total: 0 },
  })

  // which row's action menu is open
  const [actionsOpenFor, setActionsOpenFor] = useState(null)

  // compute total price
  const computeTotal = (o) => {
    const itemsSum = o.orderItems.reduce(
      (sum, i) => sum + i.qty * i.price,
      0
    )
    return itemsSum + (o.shippingPrice||0) + (o.taxPrice||0) - (o.discount||0)
  }

  // fetch on mount and when we return to step=0
  useEffect(() => {
    if (step === 0) fetchOrders()
  }, [step])

  async function fetchOrders() {
    setLoading(true)
    try {
      const res = await api.get("/api/orders/myorders", {
        withCredentials: true,
      })
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.orders)
        ? res.data.orders
        : []
      setOrders(list)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  // filter the rows based on search box + dropdown filter
  const filtered = orders
    .filter(o => 
      o._id.toLowerCase().includes(invoiceFilter.trim().toLowerCase())
    )
    .filter(o => {
      if (!filterValue) return true
      switch(filterBy) {
        case "Date":
          return new Date(o.createdAt)
            .toLocaleDateString()
            .includes(filterValue)
        case "Invoice No":
          return o._id.slice(-6).toUpperCase()
            .includes(filterValue.toUpperCase())
        case "Status":
          return o.status.toLowerCase()
            .includes(filterValue.toLowerCase())
        default:
          return true
      }
    })
    .map(o => ({
      id:       o._id,
      time:     new Date(o.createdAt).toLocaleString(),
      orderNo:  o._id.slice(-6).toUpperCase(),
      customer: o.user
        ? `${o.user.firstName} ${o.user.lastName}`
        : "Unknown User",
      price:    `NGN ${computeTotal(o).toLocaleString()}`,
      status:   o.status,
      raw:      o,  // keep original for actions
    }))

  // handle delete
  const deleteOrder = async id => {
    if (!window.confirm("Really delete this order?")) return
    await api.delete(`/api/orders/${id}`)
    fetchOrders()
  }
  // handle status change
  const updateStatus = async (id, status) => {
    await api.put(`/api/orders/${id}/status`, { status })
    fetchOrders()
  }

  // wizard state
  const [items, setItems] = useState([])
  if (step === 1) {
    return (
      <SalesInfoInput
        items={items}
        setItems={setItems}
        onBack={()=>setStep(0)}
        onNext={()=>setStep(2)}
      />
    )
  }
  if (step === 2) {
    return (
      <SalesDelivery
        items={items}
        onBack={()=>setStep(1)}
        onNext={data=>{
          setDeliveryData(data)
          setStep(3)
        }}
      />
    )
  }
  if (step === 3) {
    return (
      <SalesPaymentInfo
        items={items}
        {...deliveryData}
        onBack={()=>setStep(2)}
        onDone={()=>{
          setStep(0)
          setDeliveryData({
            customerName: "",
            customerPhone: "",
            pointOfSale: "",
            deliveryMethod: "",
            shippingAddress: "",
            parkLocation: "",
            summary: { subtotal: 0, tax: 0, total: 0 },
          })
        }}
      />
    )
  }

  // main table
  return (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Sales Management
        </h2>
        <button
          onClick={()=>setStep(1)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg"
        >
          + Enter Sales
        </button>
      </div>

      {/* search & filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-4">
        <div className="relative w-full md:w-1/3 mb-2 md:mb-0">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={invoiceFilter}
            onChange={e=>setInvoiceFilter(e.target.value)}
            placeholder="Search by Invoice No"
            className="w-full pl-12 pr-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex items-center space-x-2">
          <FiFilter className="text-gray-500" />
          <span className="text-gray-600">Filter by</span>
          <select
            value={filterBy}
            onChange={e=>{setFilterBy(e.target.value); setFilterValue("")}}
            className="border rounded-lg px-3 py-2"
          >
            {["Date","Invoice No","Status"].map(o=>(
              <option key={o}>{o}</option>
            ))}
          </select>
          <input
            value={filterValue}
            onChange={e=>setFilterValue(e.target.value)}
            placeholder={
              filterBy==="Date"? "e.g. 4/26/2025"
              : filterBy==="Invoice No"? "e.g. DDFD4C"
              : "e.g. Pending"
            }
            className="border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* table */}
      {loading ? (
        <p>Loading…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full whitespace-nowrap">
            <thead>
              <tr className="border-b bg-gray-50">
                {["Time","Order No","Customer","Price","Status","Action"]
                  .map(col=>(
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase"
                  >{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r=>(
                <Fragment key={r.id}>
                  <tr className="border-b">
                    <td className="px-4 py-4 text-sm text-gray-700">{r.time}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{r.orderNo}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{r.customer}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{r.price}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        r.status==="Pending"    ? "bg-yellow-100 text-yellow-800"
                      : r.status==="Processing" ? "bg-blue-100 text-blue-800"
                      : r.status==="Shipped"    ? "bg-green-100 text-green-800"
                      : r.status==="Delivered"  ? "bg-gray-100 text-gray-800"
                      :                           "bg-gray-100 text-gray-800"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 relative">
                      <button
                        onClick={()=>setActionsOpenFor(
                          actionsOpenFor===r.id? null : r.id
                        )}
                        className="text-gray-500 hover:text-gray-800"
                      >
                        <FiMoreVertical />
                      </button>
                      {actionsOpenFor===r.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
                          <button
                            onClick={()=>{ deleteOrder(r.id); setActionsOpenFor(null) }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Delete Sale
                          </button>
                          <button
                            onClick={()=>{ updateStatus(r.id,"Processing"); setActionsOpenFor(null) }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Mark as Processing
                          </button>
                          <button
                            onClick={()=>{ updateStatus(r.id,"Shipped"); setActionsOpenFor(null) }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Mark as Shipped
                          </button>
                          <button
                            onClick={()=>{ updateStatus(r.id,"Delivered"); setActionsOpenFor(null) }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Mark as Delivered
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* pagination stub */}
      <div className="flex items-center justify-between mt-6">
        <button className="flex items-center px-4 py-2 border rounded-lg">
          <FiChevronLeft className="mr-2" /> Previous
        </button>
        <span className="text-sm text-gray-500">Page 1 of 10</span>
        <button className="flex items-center px-4 py-2 border rounded-lg">
          Next <FiChevronRight className="ml-2" />
        </button>
      </div>
    </div>
  )
}
