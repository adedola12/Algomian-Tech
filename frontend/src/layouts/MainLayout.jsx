// layouts/MainLayout.jsx
import React from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";

const MainLayout = ({ children }) => {
  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <Header />
      <Navbar />
      {children}
    </div>
  );
};

export default MainLayout;
