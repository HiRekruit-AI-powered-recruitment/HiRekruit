import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext.jsx";
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
  Search,
  Filter,
  Download,
  Eye,
  Users,
  TrendingUp,
} from "lucide-react";
import Loader from "./Loader";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Calendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [companyId, setCompanyId] = useState(null);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [drivesOnSelectedDate, setDrivesOnSelectedDate] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("month"); // month, week, day
  const [showStats, setShowStats] = useState(true);
  const drivesPerPage = 3;

  // Fetch HR info and company ID
  useEffect(() => {
    const fetchHRInfo = async () => {
      try {
        const email = user?.email;
        if (!email) return;

        const response = await fetch(
          `${BASE_URL}/api/drive/hr-info?email=${encodeURIComponent(email)}`,
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
          `${BASE_URL}/api/drive/company/${companyId}`,
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

  // Filter drives based on search and status
  const filteredDrives = drives.filter((drive) => {
    const matchesSearch =
      searchTerm === "" ||
      drive.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.job_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (drive.location &&
        drive.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === "all" || drive.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Get drives for a specific date
  const getDrivesForDate = (date) => {
    const dateStr = formatDateToYYYYMMDD(date);
    return filteredDrives.filter((drive) => {
      const startDate = new Date(drive.start_date);
      const endDate = new Date(drive.end_date);
      const checkDate = new Date(dateStr);

      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  // Get drive statistics
  const getDriveStats = () => {
    const active = drives.filter((d) => d.status === "active").length;
    const upcoming = drives.filter((d) => d.status === "upcoming").length;
    const completed = drives.filter((d) => d.status === "completed").length;
    const total = drives.length;

    return { total, active, upcoming, completed };
  };

  // Export calendar data
  const exportCalendarData = () => {
    const csvContent = [
      [
        "Job ID",
        "Role",
        "Start Date",
        "End Date",
        "Location",
        "Status",
        "Job Type",
      ],
      ...drives.map((drive) => [
        drive.job_id,
        drive.role,
        new Date(drive.start_date).toLocaleDateString(),
        new Date(drive.end_date).toLocaleDateString(),
        drive.location || "N/A",
        drive.status || "N/A",
        drive.job_type || "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calendar-drives-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Calendar data exported successfully!");
  };

  // Get unique statuses for filter
  const uniqueStatuses = [
    "all",
    ...new Set(drives.map((drive) => drive.status).filter(Boolean)),
  ];

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
    indexOfLastDrive,
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
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get calendar days for month view
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

  // Get calendar days for week view
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({
        date,
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
      });
    }

    return days;
  };

  // Get calendar days for day view
  const getDayHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push({
        hour: i,
        time: `${i.toString().padStart(2, "0")}:00`,
        drives: getDrivesForHour(currentDate, i),
      });
    }
    return hours;
  };

  // Get drives for specific hour (for day view)
  const getDrivesForHour = (date, hour) => {
    return filteredDrives.filter((drive) => {
      const driveDate = new Date(drive.start_date);
      return (
        driveDate.getDate() === date.getDate() &&
        driveDate.getMonth() === date.getMonth() &&
        driveDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Navigate to previous week/day
  const goToPrevious = () => {
    if (viewMode === "week") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else if (viewMode === "day") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    } else {
      goToPreviousMonth();
    }
  };

  // Navigate to next week/day
  const goToNext = () => {
    if (viewMode === "week") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else if (viewMode === "day") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    } else {
      goToNextMonth();
    }
  };

  // Get view title
  const getViewTitle = () => {
    if (viewMode === "week") {
      const weekDays = getWeekDays();
      const start = weekDays[0].date;
      const end = weekDays[6].date;
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    } else if (viewMode === "day") {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
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

  const stats = getDriveStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                Drive Calendar
              </h1>
              <p className="text-sm text-gray-600">
                View all scheduled drives in calendar view
              </p>
            </div>
            <button
              onClick={exportCalendarData}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search drives by role, job ID, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm transition-colors"
            >
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all"
                    ? "All Statuses"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterStatus("all");
            }}
            className="px-4 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {showStats && (
        <div className="max-w-6xl mx-auto px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Drives</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {stats.active}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {stats.upcoming}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Filtered</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {filteredDrives.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Container */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {getViewTitle()}
              </h2>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("month")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewMode === "month"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewMode === "week"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode("day")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewMode === "day"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Day
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Today
              </button>
              <button
                onClick={goToPrevious}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToNext}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid - Different views */}
          {viewMode === "month" ? (
            <>
              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-semibold text-gray-600 py-2"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map((day, index) => {
                  const drivesOnDate = getDrivesForDate(day.date);
                  const hasDrives = drivesOnDate.length > 0;

                  return (
                    <div
                      key={index}
                      onClick={() => hasDrives && handleDateClick(day.date)}
                      className={`min-h-20 p-1.5 border rounded-md transition-all ${
                        !day.isCurrentMonth
                          ? "bg-gray-50 text-gray-400"
                          : "bg-white"
                      } ${isToday(day.date) ? "border-blue-500 border-2" : ""} ${
                        hasDrives
                          ? "cursor-pointer hover:shadow-md hover:border-blue-300 hover:bg-blue-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="text-xs font-medium">
                          {day.date.getDate()}
                        </div>
                        {hasDrives && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      {hasDrives && (
                        <div className="space-y-0.5 mt-1">
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
            </>
          ) : viewMode === "week" ? (
            <>
              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day, index) => {
                    const weekDay = getWeekDays()[index];
                    return (
                      <div key={day} className="text-center">
                        <div className="text-xs font-semibold text-gray-600 py-1">
                          {day}
                        </div>
                        <div
                          className={`text-xs font-medium py-1 ${
                            isToday(weekDay.date)
                              ? "text-blue-600 font-bold"
                              : "text-gray-900"
                          }`}
                        >
                          {weekDay.date.getDate()}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>

              {/* Week Grid */}
              <div className="grid grid-cols-7 gap-1">
                {getWeekDays().map((day, index) => {
                  const drivesOnDate = getDrivesForDate(day.date);
                  const hasDrives = drivesOnDate.length > 0;

                  return (
                    <div
                      key={index}
                      onClick={() => hasDrives && handleDateClick(day.date)}
                      className={`min-h-32 p-2 border rounded-md transition-all ${
                        !day.isCurrentMonth
                          ? "bg-gray-50 text-gray-400"
                          : "bg-white"
                      } ${isToday(day.date) ? "border-blue-500 border-2" : ""} ${
                        hasDrives
                          ? "cursor-pointer hover:shadow-md hover:border-blue-300 hover:bg-blue-50"
                          : ""
                      }`}
                    >
                      {hasDrives && (
                        <div className="space-y-1">
                          {drivesOnDate.slice(0, 3).map((drive, idx) => (
                            <div
                              key={idx}
                              className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1 truncate font-medium"
                            >
                              {drive.role}
                            </div>
                          ))}
                          {drivesOnDate.length > 3 && (
                            <div className="text-xs text-gray-500 px-2">
                              +{drivesOnDate.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Day View */
            <>
              <div className="space-y-1">
                {getDayHours().map((hour) => (
                  <div key={hour.hour} className="flex gap-2">
                    <div className="w-16 text-xs text-gray-500 font-medium py-2 text-right">
                      {hour.time}
                    </div>
                    <div className="flex-1 min-h-12 border border-gray-200 rounded-md p-2 bg-white">
                      {hour.drives.length > 0 ? (
                        <div className="space-y-1">
                          {hour.drives.map((drive, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleDateClick(currentDate)}
                              className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1 truncate font-medium cursor-pointer hover:bg-blue-200"
                            >
                              {drive.role}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">
                          No drives scheduled
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Enhanced Legend */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 border-2 border-blue-500 bg-blue-50 rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-100 rounded"></div>
                <span>Has Drives</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Drive Indicator</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {filteredDrives.length} of {drives.length} drives shown
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
                            { month: "short", day: "numeric" },
                          )}{" "}
                          -{" "}
                          {new Date(drive.end_date).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
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
