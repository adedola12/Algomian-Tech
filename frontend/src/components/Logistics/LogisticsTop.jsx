import React, { useState, useEffect } from 'react';
import { FiPackage, FiTruck, FiClock, FiDownload, FiArrowUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { fetchAllOrders } from '../../api';

export default function LogisticsTop() {
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchAllOrders().then(setOrders).catch(console.error);
  }, []);

  const total     = orders.length;
  const pending   = orders.filter(o => o.status === 'Pending').length;
  const inTransit = orders.filter(o => o.status === 'In Transit').length;

  const handleExport = () => {
    if (!orders.length) return;
    const header = [
      'Tracking ID','Customer','Qty','PointOfSale',
      'Address','Status','Created At'
    ];
    const rows = orders.map(o => [
      o.trackingId,
      `${o.user.firstName} ${o.user.lastName}`,
      o.orderItems.reduce((sum,i) => sum + i.qty, 0),
      o.pointOfSale,
      o.shippingAddress.address,
      o.status,
      new Date(o.createdAt).toLocaleString(),
    ]);
    const csv = [header, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'shipments.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Shipping Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and view customer information</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <FiDownload className="mr-2 text-gray-500" />
            Export CSV
          </button>
          <button
            onClick={() => nav('create-shipment')}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700"
          >
            Create Shipment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[{
          label: 'Total Shipments',
          value: total,
          icon: <FiPackage className="text-4xl text-gray-300"/>,
        },{
          label: 'In Transit',
          value: inTransit,
          icon: <FiTruck   className="text-4xl text-gray-300"/>,
        },{
          label: 'Pending',
          value: pending,
          icon: <FiClock   className="text-4xl text-gray-300"/>,
        }].map(({label,value,icon}, i) => (
          <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>
              <div className="inline-flex items-center text-sm text-green-600 mt-2">
                <FiArrowUp className="mr-1" /><span>5% high today</span>
              </div>
            </div>
            {icon}
          </div>
        ))}
      </div>
    </div>
  );
}
