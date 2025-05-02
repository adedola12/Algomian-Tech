import { useEffect, useState } from "react";
import { Outlet, useNavigate }   from "react-router-dom";
import api from "../api";

import InventNav     from "../components/InventNav";
import InventSideBar from "../components/InventSideBar";

export default function InventoryLayout() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/users/profile"); // replace with actual user endpoint
        setUser(res.data);
      } catch (err) {
        console.error("User fetch failed", err);
        navigate("/login");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("algomian:token");
    window.dispatchEvent(new Event("algomian-logout"));
    navigate("/login");
  };


  return (
    <div className="flex min-h-screen bg-gray-50">
      <InventSideBar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} user={user} onLogout={handleLogout} />

      {/* shift this whole column over by 260px on md+ so it sits next to the fixed sidebar */}
      <div className="flex flex-1 flex-col md:ml-[260px]">
        <InventNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex flex-1 flex-col overflow-y-auto px-4 pt-20 sm:px-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

