import React from "react";
import { Link } from "react-router-dom";

const InterviewNavbar = () => {
  return (
    <nav className="w-full bg-gradient-to-r from-black to-gray-800 text-white px-8 py-4 flex items-center justify-between">
      {/* Brand */}
      <Link to="/" className="text-2xl font-semibold tracking-wide">
        HiRekruit
      </Link>

      {/* Right Text */}
      <div className="text-sm text-gray-300">AI Interview Platform</div>
    </nav>
  );
};

export default InterviewNavbar;
