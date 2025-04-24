import { useState } from "react";
import { Outlet }   from "react-router-dom";

import InventNav     from "../components/InventNav";
import InventSideBar from "../components/InventSideBar";

export default function InventoryLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ­sidebar */}
      <InventSideBar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* ­right column */}
      <div className="flex flex-1 flex-col">
        <InventNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* page body */}
        <main
          className="flex flex-1 flex-col overflow-y-auto
                     px-4 pt-20 sm:px-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
