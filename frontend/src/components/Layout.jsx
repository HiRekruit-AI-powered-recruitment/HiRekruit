import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Link, Outlet } from "react-router-dom";
import logo from "../assets/HiRekruit.png";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-56" : "ml-16"
        }`}
      >
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            {!isSidebarOpen && (
              <Link to="/" className="flex items-center cursor-pointer">
                <img src={logo} alt="HiRekruit" className="h-[20px]" />
              </Link>
            )}
          </div>
        </header>

        {/* 🔑 Child routes render here */}
        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
