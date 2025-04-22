// src/routes/PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

export default function PrivateRoute({ adminOnly = false }) {
  const [status, setStatus] = useState("loading"); // loading | ok | fail

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/users/profile");
        if (adminOnly && data.userType !== "Admin") setStatus("fail");
        else setStatus("ok");
      } catch {
        setStatus("fail");
      }
    })();
  }, []);

  if (status === "loading") return <p className="text-center mt-10">Loading…</p>;
  if (status === "fail")    return <Navigate to="/login" replace />;

  return <Outlet />;
}
