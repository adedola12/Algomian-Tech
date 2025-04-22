import { useState }      from "react";
import { Outlet }        from "react-router-dom";
import InventNav         from "../components/InventNav";
import InventSideBar     from "../components/InventSideBar";

export default function InventoryLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);   // mobile drawer

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* permanent sidebar (desktop) / drawer (mobile) */}
      <InventSideBar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* fixed top bar */}
      <InventNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* page content */}
      <main className="pt-16 px-4 sm:px-6 md:px-8 md:ml-[260px]">
        <Outlet />            {/* current admin page renders here */}
      </main>
    </div>
  );
}
