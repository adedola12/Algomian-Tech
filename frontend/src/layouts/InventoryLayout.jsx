import { useState }  from "react";
import { Outlet }    from "react-router-dom";

import InventNav     from "../components/InventNav";
import InventSideBar from "../components/InventSideBar";

export default function InventoryLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ───────────── Sidebar (fixed width) ───────────── */}
      <InventSideBar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* ───────────── Right column = nav + page ───────────── */}
      <div className="flex flex-1 flex-col">
        {/* top bar */}
        <InventNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* current page */}
        <main className="flex-1 overflow-y-auto px-4 pt-20 sm:px-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
