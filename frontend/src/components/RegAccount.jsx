import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

const RegAccount = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* ---------------------------------------------------------------- */
  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = "First name is required";
    if (!formData.lastName.trim()) e.lastName = "Last name is required";
    if (!formData.phone.trim()) e.phone = "Phone number is required";
    if (!formData.email.trim()) e.email = "Email address is required";
    if (!formData.password.trim()) e.password = "Password is required";
    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  /* ---------------------------------------------------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please correct the errors above.", {
        position: "top-center",
      });
      return;
    }

    setLoading(true);
    try {
      /* map field names → backend keys */
      await api.post("/api/users/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        whatAppNumber: formData.phone,
        email: formData.email,
        password: formData.password,
      });

      toast.success("Registration complete!", { position: "top-center" });
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setErrors({});

      /* Give toast time to show then redirect to login */
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Registration failed";
      toast.error(msg, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------- JSX (unchanged) ------------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4 py-10">
      <ToastContainer />
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6 sm:p-10">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">
          Register Account
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          If you already have an account with us, please login at the login
          page.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First + Last Name */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                First Name*
              </label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border rounded px-4 py-2 text-sm"
                placeholder="Placeholder"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border rounded px-4 py-2 text-sm"
                placeholder="Placeholder"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1">
              WhatsApp Number (preferably)*
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2 text-sm"
              placeholder="Placeholder"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address*
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2 text-sm"
              placeholder="Placeholder"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Create Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2 text-sm"
              placeholder="Placeholder"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2 text-sm"
              placeholder="Placeholder"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit */}
          
          <button
            type="submit"
            disabled={loading}
            className="bg-[#5A4FCF] text-white font-medium py-2 rounded w-full hover:bg-[#483dc2] transition disabled:opacity-60"
          >
            {loading ? "Processing…" : "Register"}
          </button>

          <div className="flex items-center justify-center text-xs text-gray-500">
            <span className="px-2">or</span>
          </div>

          {/* Google Auth */}
          <button
            type="button"
            className="flex items-center justify-center gap-2 border border-gray-300 py-2 rounded w-full text-sm hover:bg-gray-50"
          >
            <FcGoogle className="text-xl" />
            <span>Sign Up with Google</span>
          </button>
        </form>

        {/* Already have an account */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#524D9B] font-medium hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegAccount;
