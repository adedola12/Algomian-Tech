// ---------------------------------------------
//  frontend/src/routes/PrivateRoute.jsx
// ---------------------------------------------
import { Navigate, Outlet } from "react-router-dom";
import { useAuth }          from "../context/AuthContext";

export default function PrivateRoute({ adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center mt-10">Loading…</p>;
  if (!user)    return <Navigate to="/login" replace />;
  if (adminOnly && user.userType !== "Admin")
      return <Navigate to="/" replace />;

  return <Outlet />;
}
