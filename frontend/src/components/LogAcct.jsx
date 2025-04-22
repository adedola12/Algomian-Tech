import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FcGoogle } from "react-icons/fc";
import api from "../api";
import "react-toastify/dist/ReactToastify.css";

export default function LogAcct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loading, setLoading]  = useState(false);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) {
      toast.error("Please enter your login details.", { position: "top-center" });
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/users/login", {
        email: formData.identifier,    // backend accepts either
        phone: formData.identifier,
        password: formData.password,
      });

      /* save token */
      localStorage.setItem("algomian:token", data.token);

      /* notify this tab (Navbar listener) */
      window.dispatchEvent(new Event("algomian-login"));

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
      <ToastContainer />
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-md sm:p-10">
        <h2 className="mb-1 text-xl font-semibold text-gray-800 sm:text-2xl">
          Log In
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          If you do not have an account with us, please create one at the
          Register Account page.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Phone Number or Email
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
            <p className="mt-1 text-xs font-medium text-[#5A4FCF] hover:underline">
              Forgot Password?
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[#5A4FCF] py-2 text-sm font-medium text-white transition hover:bg-[#483dc2] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Log in"}
          </button>

          <div className="flex items-center justify-center text-xs text-gray-500">
            <span className="px-2">or</span>
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded border border-gray-300 py-2 text-sm hover:bg-gray-50"
          >
            <FcGoogle className="text-lg" /> Log in with Google
          </button>
        </form>
      </div>
    </div>
  );
}
