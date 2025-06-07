// frontend/src/pages/ForgotPassword.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import api from "../api";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier) return toast.error("Enter e-mail or phone");

    try {
      setLoading(true);
      await api.post("/api/users/forgot-password", { identifier });
      toast.success("If the account exists, a reset link was sent.");
      setIdentifier("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 shadow"
      >
        <h2 className="text-xl font-semibold">Forgot Password</h2>
        <p className="text-sm text-gray-500">
          Enter your account e-mail or phone number and we’ll send you a reset
          link.
        </p>

        <input
          className="w-full rounded border px-4 py-2 text-sm"
          placeholder="you@example.com"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        <button
          disabled={loading}
          className="w-full rounded bg-[#5A4FCF] py-2 text-sm font-medium text-white hover:bg-[#483dc2] disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
