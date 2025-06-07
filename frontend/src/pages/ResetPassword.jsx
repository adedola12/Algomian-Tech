// frontend/src/pages/ResetPassword.jsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";

export default function ResetPassword() {
  const { token } = useParams();
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pw1 !== pw2) return toast.error("Passwords do not match");

    try {
      setLoading(true);
      await api.put(`/api/users/reset-password/${token}`, {
        newPassword: pw1,
      });
      toast.success("Password updated – you can now log in.");
      setPw1("");
      setPw2("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Token invalid / expired");
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
        <h2 className="text-xl font-semibold">Choose a new password</h2>

        <input
          type="password"
          placeholder="New password"
          value={pw1}
          onChange={(e) => setPw1(e.target.value)}
          className="w-full rounded border px-4 py-2 text-sm"
        />
        <input
          type="password"
          placeholder="Repeat new password"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          className="w-full rounded border px-4 py-2 text-sm"
        />

        <button
          disabled={loading}
          className="w-full rounded bg-[#5A4FCF] py-2 text-sm font-medium text-white hover:bg-[#483dc2] disabled:opacity-60"
        >
          {loading ? "Updating…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}
