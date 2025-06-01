// ---------------------------------------------
//  frontend/src/context/AuthContext.jsx
// ---------------------------------------------
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("algomian:token") || null
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  /* fetch profile whenever token appears */
  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    (async () => {
      try {
        setUser((await api.get("/api/users/profile")).data);
      } catch {
        localStorage.removeItem("algomian:token");
        setToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  /* cross-tab sync */
  useEffect(() => {
    const sync = () => setToken(localStorage.getItem("algomian:token"));
    window.addEventListener("storage", sync);
    window.addEventListener("algomian-logout", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("algomian-logout", sync);
    };
  }, []);

  const login = (token, usr) => {
    localStorage.setItem("algomian:token", token);
    setToken(token);
    setUser(usr);
    window.dispatchEvent(new Event("algomian-login"));
  };

  const logout = async () => {
    await api.post("/api/users/logout").catch(() => {});
    localStorage.removeItem("algomian:token");
    setToken(null);
    setUser(null);
    window.dispatchEvent(new Event("algomian-logout"));
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
