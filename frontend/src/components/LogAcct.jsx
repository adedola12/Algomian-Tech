// ---------------------------------------------
//  frontend/src/pages/LogAcct.jsx
// ---------------------------------------------
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";
import api from "../api";
import { useAuth } from "../context/AuthContext";

import "react-toastify/dist/ReactToastify.css";

export default function LogAcct() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.identifier || !formData.password) {
      toast.error("Please enter your login details.", {
        position: "top-center",
      });
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/api/users/login", {
        identifier: formData.identifier,
        password: formData.password,
      });

      // login(data.token, data); // <-- context handles everything
      login(
        data.token, // JWT
        {
          // user object for context
          ...data.user, // id, name, email, …
          permissions: data.permissions ?? [], // ⬅️  IMPORTANT
        }
      );
      toast.success("Login successful!", { position: "top-center" });
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 py-10">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-md sm:p-10">
        <h2 className="mb-1 text-xl font-semibold text-gray-800 sm:text-2xl">
          Log In
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          If you do not have an account with us, please create one on the
          register page.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Phone Number or Email
            </label>
            <input
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              className="w-full rounded border px-4 py-2 text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded border px-4 py-2 text-sm"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[#5A4FCF] py-2 text-sm font-medium text-white transition hover:bg-[#483dc2] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Log in"}
          </button>

          <div className="flex items-center justify-center text-xs text-gray-500">
            <span className="px-2">or</span>
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded border border-gray-300 py-2 text-sm hover:bg-gray-50"
            disabled
          >
            <FcGoogle className="text-lg" /> Log in with Google
          </button>
        </form>
        
        <div className="forgot-password ">
          <Link to={"/forgot-password"} className="text-purple-800 text-sm font-bold">
            Forgot Password?
          </Link>
        </div>
        <div className="flex items-center justify-center text-xs text-gray-500 mt-3">
          <span className="px-2">
            Dont have an account?{" "}
            <Link to={"/signup"} className="text-purple-800 text-bold">
              Sign Up Now!!!
            </Link>
          </span>
        </div>
      
      </div>
    </div>
  );
}
