import React, { useState } from "react";
import logo from "../assets/HiRekruit.png";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Use auth context
  const { isAuthenticated, user, isLoading, logout } = useAuth();

  const navLinkClasses = ({ isActive }) =>
    `text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "text-black bg-gray-100"
        : "text-gray-600 hover:text-black hover:bg-gray-100"
    }`;

  const handleSignUp = async () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate("/signup");
      setIsNavigating(false);
    }, 150);
  };

  const handleSignIn = async () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate("/signin");
      setIsNavigating(false);
    }, 150);
  };

  const handleSignOut = async () => {
    await logout();
    setIsUserDropdownOpen(false);
    navigate("/");
  };

  const handleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const getFirstName = (fullName) => {
    if (!fullName) return "User";
    return fullName.split(" ")[0];
  };

  return (
    <nav className="w-full bg-white shadow-2xl sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="transition-transform duration-200 hover:scale-105"
            >
              <img
                src={logo}
                alt="HiRekruit Logo"
                className="w-24 h-15 object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/" className={navLinkClasses} end>
              Home
            </NavLink>
            <NavLink to="/about" className={navLinkClasses}>
              About
            </NavLink>
            <NavLink to="/services" className={navLinkClasses}>
              Services
            </NavLink>
            <NavLink to="/clients" className={navLinkClasses}>
              Clients
            </NavLink>
            <NavLink to="/contact" className={navLinkClasses}>
              Contact
            </NavLink>

            {/* Authentication Section */}
            {isLoading ? (
              <div className="ml-4 w-24 h-10 bg-gray-100 rounded-lg animate-pulse"></div>
            ) : isAuthenticated && user ? (
              <div className="relative ml-4">
                <button
                  onClick={handleUserDropdown}
                  className="flex items-center space-x-2 bg-gray-100 text-black py-2 px-4 rounded-lg hover:bg-gray-200 transition-all duration-200 border border-gray-300"
                >
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <span className="text-sm font-medium">
                    {getFirstName(user.name)}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isUserDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">
                        {user.role}
                      </p>
                    </div>

                    <Link
                      to="/drive-creation"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-colors duration-150 flex items-center space-x-2"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-4">
                <button
                  onClick={handleSignIn}
                  disabled={isNavigating}
                  className="text-black py-2 px-4 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={handleSignUp}
                  disabled={isNavigating}
                  className={`bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-md hover:shadow-lg ${
                    isNavigating ? "animate-pulse" : ""
                  }`}
                >
                  {isNavigating ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-gray-200/60 pt-4 pb-2">
            <div className="flex flex-col space-y-2">
              <NavLink
                to="/"
                className={navLinkClasses}
                end
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/about"
                className={navLinkClasses}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </NavLink>
              <NavLink
                to="/services"
                className={navLinkClasses}
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </NavLink>
              <NavLink
                to="/clients"
                className={navLinkClasses}
                onClick={() => setIsMenuOpen(false)}
              >
                Clients
              </NavLink>
              <NavLink
                to="/contact"
                className={navLinkClasses}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </NavLink>

              {/* Mobile Authentication */}
              <div className="pt-2 border-t border-gray-200/60 mt-2">
                {isLoading ? (
                  <div className="px-3 py-2">
                    <div className="w-full h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                  </div>
                ) : isAuthenticated && user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-gray-600">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="block text-sm font-medium py-2 px-3 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block text-sm font-medium py-2 px-3 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left text-sm font-medium py-2 px-3 rounded-lg text-gray-800 hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        handleSignIn();
                        setIsMenuOpen(false);
                      }}
                      disabled={isNavigating}
                      className="w-full text-black py-2 px-4 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm font-medium border border-gray-300"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        handleSignUp();
                        setIsMenuOpen(false);
                      }}
                      disabled={isNavigating}
                      className={`w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 ${
                        isNavigating ? "animate-pulse" : ""
                      }`}
                    >
                      {isNavigating ? "Loading..." : "Sign Up"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for dropdown */}
      {isUserDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
