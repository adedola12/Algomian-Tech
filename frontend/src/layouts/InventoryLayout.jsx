import React, { useState } from "react";
import InventNav from "../components/InventNav";
import InventSideBar from "../components/InventSideBar";

const InventoryLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <InventSideBar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <InventNav toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="p-4 sm:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default InventoryLayout;
