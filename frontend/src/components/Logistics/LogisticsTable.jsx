import React, { useState, useEffect } from 'react';
import { FiMoreVertical, FiStar }      from 'react-icons/fi';
import { fetchAllOrders }               from '../../api';

export default function LogisticsTable() {
  const [orders, setOrders] = useState([]);
  const [tab,    setTab]    = useState('ready');
  const [leading, setLeading] = useState(null);

  useEffect(() => {
    fetchAllOrders().then(setOrders).catch(console.error);
  }, []);

  const tabs = [
    { key: 'ready',   label: 'Ready for Shipping' , status: 'Pending'   },
    { key: 'shipped', label: 'Shipped'            , status: 'Shipped'   },
    { key: 'transit', label: 'Orders In Transit'  , status: 'In Transit'},
  ];

  const filtered = orders.filter(o => {
    const t = tabs.find(x => x.key === tab);
    return t ? o.status === t.status : true;
  });

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow space-y-4">
      {/* Track Shipment */}
      <div>
        <label htmlFor="tracking" className="block text-sm font-medium text-gray-700 mb-1">
          Track Shipment
        </label>
        <input
          id="tracking"
          type="text"
          placeholder="Enter Tracking ID"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Tabs */}
      <nav className="flex space-x-4 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-shrink-0 pb-2 text-sm font-medium ${
              tab === t.key
                ? 'border-b-2 border-orange-500 text-orange-600'
                : 'text-gray-600'
            }`}
          >
            {t.label}{' '}
            <span className="ml-1 inline-flex items-center bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {orders.filter(o => o.status === t.status).length}
            </span>
          </button>
        ))}
      </nav>

      {/* Table */}
      <div className="relative">
        <div className="absolute -top-3 left-0 bg-purple-600 text-white px-3 py-1 rounded-tr-lg rounded-br-lg flex items-center space-x-1 text-xs font-semibold">
          <FiStar className="w-4 h-4" /><span>Leading</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Order ID','Qty','Customer','Point of Sale','Address','Status','Action']
                  .map(col => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {col}
                    </th>
                  ))
                }
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map(o => {
                const isLeading = o.trackingId === leading;
                const qty       = o.orderItems.reduce((sum,i)=> sum+i.qty, 0);
                return (
                  <tr key={o._id}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className={`flex items-center space-x-2 ${isLeading ? 'bg-purple-50 p-1 rounded-lg':''}`}>
                        <input
                          type="checkbox"
                          checked={isLeading}
                          onChange={() => setLeading(o.trackingId)}
                          className="form-checkbox h-4 w-4 text-purple-600"
                        />
                        <span className={isLeading?'text-purple-800 font-medium':'text-gray-800 font-medium'}>
                          {o.trackingId}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{qty} Items</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {o.user.firstName} {o.user.lastName}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {o.pointOfSale}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {o.shippingAddress.address}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                        o.status === 'Pending'     ? 'bg-gray-100 text-gray-800'
                      : o.status === 'In Transit'  ? 'bg-blue-100 text-blue-800'
                      :                               'bg-green-100 text-green-800'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      <button className="text-gray-500 hover:text-gray-800">
                        <FiMoreVertical />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
