import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Link, Outlet } from "react-router-dom";
import logo from "../../assets/HiRekruit.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LogOut } from "lucide-react";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;

      await axios.post(
        `${baseUrl}/api/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      navigate("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />


      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-56" : "ml-16"
          }`}
      >
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">

            {!isSidebarOpen && (
              <Link to="/" className="flex items-center cursor-pointer">
                <img src={logo} alt="HiRekruit" className="h-[20px]" />
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>

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
