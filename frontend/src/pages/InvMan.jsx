import React from "react";
import InvManTop from "../components/InventoryManager/InvManTop";
import InvManTable from "../components/InventoryManager/InvManTable";

const InvMan = () => {
  return (
    <div>
      <InvManTop />
      <div className="mt-10">
        <InvManTable />
      </div>
    </div>
  );
};

export default InvMan;
