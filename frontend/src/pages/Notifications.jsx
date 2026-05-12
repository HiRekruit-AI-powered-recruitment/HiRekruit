import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext.jsx";
import { useNotificationContext } from "../Context/NotificationContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Bell,
  Check,
  X,
  Briefcase,
  Calendar as CalendarIcon,
  Clock,
  User,
  Filter,
  Trash2,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import Loader from "../components/Loader";

const Notifications = () => {
  const { user } = useAuth();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotificationContext();
  const loading = false;
  
  const [filterType, setFilterType] = useState("all");
  const [showRead, setShowRead] = useState(true);

  // Filter notifications based on type and read status
  const filteredNotifications = notifications.filter((notification) => {
    const matchesType =
      filterType === "all" || notification.type === filterType;
    const matchesRead = showRead || !notification.read;
    return matchesType && matchesRead;
  });

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "drive_created":
        return <Briefcase className="w-5 h-5 text-blue-600" />;
      case "drive_updated":
        return <Settings className="w-5 h-5 text-green-600" />;
      case "candidate_applied":
        return <User className="w-5 h-5 text-purple-600" />;
      case "drive_reminder":
        return <CalendarIcon className="w-5 h-5 text-yellow-600" />;
      case "drive_completed":
        return <Check className="w-5 h-5 text-green-600" />;
      case "system_update":
        return <Bell className="w-5 h-5 text-gray-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const dateObj = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const diff = now - dateObj;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${Math.max(0, minutes)} minute${minutes !== 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  };

  if (loading) return <Loader />;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                Notifications
              </h1>
              <p className="text-sm text-gray-600">
                Stay updated with your recruitment activities
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {unreadCount} unread
                </span>
              )}
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
              >
                <Check className="w-4 h-4" />
                Mark All Read
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm transition-colors"
            >
              <option value="all">All Types</option>
              <option value="drive_created">Drive Created</option>
              <option value="drive_updated">Drive Updated</option>
              <option value="candidate_applied">Candidate Applied</option>
              <option value="drive_reminder">Drive Reminder</option>
              <option value="drive_completed">Drive Completed</option>
              <option value="system_update">System Update</option>
            </select>
          </div>

          {/* Show/Hide Read */}
          <button
            onClick={() => setShowRead(!showRead)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
              showRead
                ? "bg-gray-100 border-gray-300 text-gray-700"
                : "bg-blue-100 border-blue-300 text-blue-700"
            }`}
          >
            {showRead ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {showRead ? "Hide Read" : "Show Read"}
          </button>

          {/* Clear All */}
          <button
            onClick={clearAllNotifications}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-sm text-gray-600">
              {filterType !== "all" || !showRead
                ? "Try adjusting your filters to see more notifications"
                : "You're all caught up! No new notifications."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border transition-all hover:shadow-md ${
                  !notification.read
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        !notification.read ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`text-base font-medium ${
                                !notification.read
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}
                            >
                              {notification.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(notification.timestamp)}
                            </div>
                            {notification.driveId && (
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {notification.driveId}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete notification"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
