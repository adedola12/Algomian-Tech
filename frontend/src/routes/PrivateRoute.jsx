// routes/PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** @param {string[]|true} [roles]
 *  - pass TRUE to mean “anyone that is NOT Customer”                             */
export default function PrivateRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;                        // still fetching session
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />;

  /* ─ role check ────────────────────────────────────────────────── */
  if (roles === true && user.userType === "Customer")
    return <Navigate to="/" replace />;

  if (Array.isArray(roles) && !roles.includes(user.userType))
    return <Navigate to="/" replace/>;

  return children ?? <Outlet />;
}
