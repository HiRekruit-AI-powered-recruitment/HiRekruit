// LayoutWithNavbar.js
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer/Footer";

const LayoutWithNavbar = () => {
  return (
    <>
      {/* Full-width white background just for navbar */}
      <div className="bg-white shadow-sm">
        <Navbar />
      </div>

      {/* Page content */}
      <Outlet />

      <div className="bg-white shadow-sm">
        <Footer />
      </div>
    </>
  );
};

export default LayoutWithNavbar;
