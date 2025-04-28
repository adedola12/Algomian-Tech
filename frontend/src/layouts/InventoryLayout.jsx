import { useState } from "react";
import { Outlet }   from "react-router-dom";

import InventNav     from "../components/InventNav";
import InventSideBar from "../components/InventSideBar";

export default function InventoryLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <InventSideBar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

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

