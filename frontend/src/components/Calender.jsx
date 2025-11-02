import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Briefcase,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import Loader from "./Loader";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Calendar = () => {
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [companyId, setCompanyId] = useState(null);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [drivesOnSelectedDate, setDrivesOnSelectedDate] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const drivesPerPage = 3;

  // Fetch HR info and company ID
  useEffect(() => {
    const fetchHRInfo = async () => {
      try {
        const email = user?.emailAddresses[0]?.emailAddress;
        if (!email) return;

        const response = await fetch(
          `${BASE_URL}/api/drive/hr-info?email=${encodeURIComponent(email)}`
        );

        if (!response.ok) throw new Error("Failed to fetch HR info");

        const hrData = await response.json();
        if (hrData.company_id) {
          setCompanyId(hrData.company_id);
        }
      } catch (err) {
        console.error("Error fetching HR info:", err.message);
        toast.error("Could not load HR information.");
      }
    };

    if (user) {
      fetchHRInfo();
    }
  }, [user]);

  // Fetch all drives for the company
  useEffect(() => {
    const fetchDrives = async () => {
      try {
        if (!companyId) return;

        const response = await fetch(
          `${BASE_URL}/api/drive/company/${companyId}`
        );

        if (!response.ok) throw new Error("Failed to fetch drives");

        const data = await response.json();
        setDrives(data.drives || []);
      } catch (err) {
        console.error("Error fetching drives:", err.message);
        toast.error("Could not load drives.");
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchDrives();
    }
  }, [companyId]);

  // Get drives for a specific date
  const getDrivesForDate = (date) => {
    const dateStr = formatDateToYYYYMMDD(date);
    return drives.filter((drive) => {
      const startDate = new Date(drive.start_date);
      const endDate = new Date(drive.end_date);
      const checkDate = new Date(dateStr);

      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  // Format date to YYYY-MM-DD
  const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Handle date click
  const handleDateClick = (date) => {
    const drivesOnDate = getDrivesForDate(date);
    if (drivesOnDate.length > 0) {
      setSelectedDate(date);
      setDrivesOnSelectedDate(drivesOnDate);
      setCurrentPage(1);
      setShowPopup(true);
    }
  };

  // Close popup
  const closePopup = () => {
    setShowPopup(false);
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(drivesOnSelectedDate.length / drivesPerPage);
  const indexOfLastDrive = currentPage * drivesPerPage;
  const indexOfFirstDrive = indexOfLastDrive - drivesPerPage;
  const currentDrives = drivesOnSelectedDate.slice(
    indexOfFirstDrive,
    indexOfLastDrive
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get calendar days
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month's days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Drive Calendar
          </h1>
          <p className="text-sm text-gray-600">
            View all scheduled drives in calendar view
          </p>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Today
              </button>
              <button
                onClick={goToPreviousMonth}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {getCalendarDays().map((day, index) => {
              const drivesOnDate = getDrivesForDate(day.date);
              const hasDrives = drivesOnDate.length > 0;

              return (
                <div
                  key={index}
                  onClick={() => hasDrives && handleDateClick(day.date)}
                  className={`
                    min-h-20 p-1.5 border rounded-md transition-all
                    ${
                      !day.isCurrentMonth
                        ? "bg-gray-50 text-gray-400"
                        : "bg-white"
                    }
                    ${
                      isToday(day.date)
                        ? "border-blue-500 border-2 bg-blue-50"
                        : "border-gray-200"
                    }
                    ${
                      hasDrives
                        ? "cursor-pointer hover:shadow-md hover:border-blue-300 hover:bg-blue-50"
                        : ""
                    }
                  `}
                >
                  <div className="text-xs font-medium mb-1">
                    {day.date.getDate()}
                  </div>
                  {hasDrives && (
                    <div className="space-y-0.5">
                      {drivesOnDate.slice(0, 2).map((drive, idx) => (
                        <div
                          key={idx}
                          className="text-[10px] bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 truncate font-medium"
                        >
                          {drive.role}
                        </div>
                      ))}
                      {drivesOnDate.length > 2 && (
                        <div className="text-[9px] text-gray-500 px-1">
                          +{drivesOnDate.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 border-2 border-blue-500 bg-blue-50 rounded"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-blue-100 rounded"></div>
              <span>Has Drives</span>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Modal with Pagination */}
      {showPopup && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          onClick={closePopup}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-lg w-full border border-gray-300 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50 flex-shrink-0">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {selectedDate?.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {drivesOnSelectedDate.length}{" "}
                  {drivesOnSelectedDate.length === 1 ? "drive" : "drives"}{" "}
                  scheduled
                </p>
              </div>
              <button
                onClick={closePopup}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Popup Content - Scrollable */}
            <div className="p-4 overflow-y-auto flex-grow">
              <div className="space-y-3">
                {currentDrives.map((drive) => (
                  <div
                    key={drive._id}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <h4 className="text-sm font-semibold text-gray-900">
                          {drive.role}
                        </h4>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          drive.job_type === "full-time"
                            ? "bg-green-100 text-green-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {drive.job_type === "full-time"
                          ? "Full-Time"
                          : "Internship"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarIcon className="w-3 h-3 flex-shrink-0" />
                        <span className="font-medium">Job ID:</span>
                        <span>{drive.job_id}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className="font-medium">Duration:</span>
                        <span>
                          {new Date(drive.start_date).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}{" "}
                          -{" "}
                          {new Date(drive.end_date).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </span>
                      </div>

                      {drive.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="font-medium">Location:</span>
                          <span>{drive.location}</span>
                        </div>
                      )}

                      {drive.status && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="font-medium">Status:</span>
                          <span className="capitalize">{drive.status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t bg-gray-50 flex-shrink-0">
                <div className="text-xs text-gray-600">
                  Showing {indexOfFirstDrive + 1}-
                  {Math.min(indexOfLastDrive, drivesOnSelectedDate.length)} of{" "}
                  {drivesOnSelectedDate.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`p-1.5 rounded-md transition-colors ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-700 font-medium px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-1.5 rounded-md transition-colors ${
                      currentPage === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
