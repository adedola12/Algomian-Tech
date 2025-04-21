import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { FcGoogle } from 'react-icons/fc';
import 'react-toastify/dist/ReactToastify.css';

const LogAcct = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (formData.identifier && formData.password) {
      toast.success('Login successful!', { position: 'top-center' });
      // Proceed with login logic or API call
      setFormData({ identifier: '', password: '' });
    } else {
      toast.error('Please enter your login details.', { position: 'top-center' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4 py-10">
      <ToastContainer />
      <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-6 sm:p-10">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">Log In</h2>
        <p className="text-sm text-gray-500 mb-6">
          If you do not have an account with us, please create one at the Register Account Page.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Identifier */}
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number or email</label>
            <input
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2 text-sm"
              placeholder="Placeholder"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2 text-sm"
              placeholder="Placeholder"
            />
            <p className="text-xs text-[#5A4FCF] font-medium mt-1 cursor-pointer hover:underline">
              Forgot Password?
            </p>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="bg-[#5A4FCF] text-white text-sm font-medium py-2 rounded w-full hover:bg-[#483dc2] transition"
          >
            Log in
          </button>

          {/* Divider */}
          <div className="flex items-center justify-center text-xs text-gray-500">
            <span className="px-2">or</span>
          </div>

          {/* Google Login */}
          <button
            type="button"
            className="flex items-center justify-center gap-2 border border-gray-300 py-2 rounded w-full text-sm hover:bg-gray-50"
          >
            <FcGoogle className="text-lg" />
            Log in with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogAcct;
