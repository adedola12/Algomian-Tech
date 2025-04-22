import Header from "../components/Header";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      {/* top strip + navigation that are always visible */}
      <Header />
      <Navbar />

      {/* current public page renders here */}
      <Outlet />
    </div>
  );
}
