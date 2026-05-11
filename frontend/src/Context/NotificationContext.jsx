import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const NotificationContext = createContext(null);

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Load existing notifications from localStorage
    const savedNotifications = localStorage.getItem("hr_notifications");
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (e) {
        console.error("Failed to parse notifications from localStorage");
      }
    }

    // Initialize Socket
    const newSocket = io(VITE_BASE_URL, {
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to Notification Socket:", newSocket.id);
    });

    newSocket.on("pipeline_update", (data) => {
      console.log("Received pipeline update:", data);
      
      const newNotification = {
        ...data,
        id: data.id || Date.now().toString(),
        read: false,
        timestamp: new Date(data.timestamp || Date.now())
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        localStorage.setItem("hr_notifications", JSON.stringify(updated));
        return updated;
      });

      // Show toast notification
      toast.info(`Update: ${data.title}`, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Update localStorage whenever notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem("hr_notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => {
      const updated = prev.filter((notif) => notif.id !== id);
      localStorage.setItem("hr_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem("hr_notifications");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
};
