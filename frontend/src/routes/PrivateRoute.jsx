import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * @param {string[]} [roles] – optional array of allowed userType strings
 */
export default function PrivateRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  /* still fetching session -> you can return null or a spinner */
  if (loading) return null;

  /* not logged in -> kick to login */
  if (!user)
    return <Navigate to="/login" state={{ from: location }} replace />;

  /* role provided but user not included -> kick home */
  if (roles && !roles.includes(user.userType))
    return <Navigate to="/" replace />;

  /* allowed */
  return children ? children : <Outlet />;
}
