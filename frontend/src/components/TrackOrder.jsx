import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import OrderTrackDet from '../components/OrderTrackDet';
import 'react-toastify/dist/ReactToastify.css';

const TrackOrder = () => {
  const [inputId, setInputId] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [trackingId, setTrackingId] = useState('');

  useEffect(() => {
    // Retrieve the latest order data from localStorage
    const latestId = localStorage.getItem('latestOrderId');
    const trackingCode = localStorage.getItem('trackingId') || 'IZ99AA780141760'; // fallback if not yet stored

    if (latestId && !localStorage.getItem('trackingId')) {
      localStorage.setItem('trackingId', trackingCode); // persist on first visit
    }

    setOrderId(latestId);
    setTrackingId(trackingCode);
  }, []);

  const handleTrack = () => {
    const storedOrderId = localStorage.getItem('latestOrderId');
    const storedTrackingId = localStorage.getItem('trackingId');
  
    if (!inputId.trim()) {
      toast.error('Please enter a valid Order ID', { position: 'top-center' });
    } else if (inputId === storedOrderId) {
      setOrderId(storedOrderId);
      setTrackingId(storedTrackingId);
      setShowDetails(true);
      toast.success('Order found! Showing tracking details.', { position: 'top-center' });
    } else {
      toast.error('Order ID not found. Please check again.', { position: 'top-center' });
    }
  };
  
  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-10">
      <ToastContainer />
      {!showDetails ? (
        <div className="w-full max-w-xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">Track your order</h2>
          <p className="text-sm text-gray-500 mb-6">
            If you do not have an account with us, please create one at the Register Account Page.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Order ID</label>
            <input
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="Placeholder"
              className="w-full border rounded px-4 py-2 text-sm"
            />
          </div>

          <button
            onClick={handleTrack}
            className="w-full bg-[#5A4FCF] text-white py-2 rounded hover:bg-[#483dc2] transition"
          >
            Track Order
          </button>
        </div>
      ) : (
        <OrderTrackDet orderId={orderId} trackingId={trackingId} />
      )}
    </div>
  );
};

export default TrackOrder;
