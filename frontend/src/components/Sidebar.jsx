import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Star,
  BarChart3,
  Briefcase,
  CalendarDays,
  Trophy,
  PlusCircle,
  Users,
  Bell,
  Settings,
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import logo from "../assets/HiRekruit.png";

const items = [
  {
    label: "Create New Drive",
    icon: PlusCircle,
    path: "/dashboard/drive-creation",
  },
  { label: "Drives", icon: Briefcase, path: "/dashboard/drives" },
  { label: "All Applicants", icon: FileText, path: "/dashboard/resumes" },
  { label: "Shortlisted", icon: Users, path: "/dashboard/shortlisted" },
  {
    label: "Selected Candidates",
    icon: Trophy,
    path: "/dashboard/selected-candidates",
  },
  { label: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
  { label: "Calendar", icon: CalendarDays, path: "/dashboard/calendar" },
  { label: "Notifications", icon: Bell, path: "/dashboard/notifications" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings" },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(3); // Mock unread count

  // Mock notification count update (in real app, this would come from context/API)
  useEffect(() => {
    // Simulate notification updates
    const interval = setInterval(() => {
      setUnreadCount((prev) => {
        // Randomly increase or decrease for demo
        const change = Math.random() > 0.7 ? 1 : Math.random() > 0.9 ? -1 : 0;
        return Math.max(0, Math.min(9, prev + change));
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen border-r border-gray-200 bg-white/80 backdrop-blur-sm transform transition-all duration-300 ease-in-out z-40
      ${isOpen ? "w-56" : "w-16"}`}
    >
      {/* Desktop header */}
      <div className="flex justify-between items-center px-4 py-4 h-16 border-b border-gray-200">
        {isOpen && (
          /* Team Note: Sidebar logo now redirects to homepage for better navigation UX */
          <Link to="/" className="flex items-center">
            <img src={logo} alt="HiRekruit" className="h-[20px]" />
          </Link>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-2 overflow-y-auto h-[calc(100vh-4rem)]">
        {items.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          const showBadge = item.label === "Notifications" && unreadCount > 0;

          return (
            <button
              onClick={() => {
                navigate(item.path);
                // Clear unread count when clicking notifications
                if (item.label === "Notifications") {
                  setUnreadCount(0);
                }
              }}
              key={item.label}
              className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-all duration-200 relative
                ${
                  isActive
                    ? "text-gray-900 font-medium bg-gray-100 border-r-4 border-black"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              title={!isOpen ? item.label : ""}
            >
              <IconComponent size={20} className="flex-shrink-0" />
              <span
                className={`transition-all duration-200 overflow-hidden ${
                  isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                }`}
              >
                {item.label}
              </span>

              {/* Notification Badge */}
              {showBadge && (
                <span
                  className={`absolute top-3 right-3 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center transition-all duration-200 ${
                    isOpen ? "scale-100" : "scale-90"
                  }`}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
