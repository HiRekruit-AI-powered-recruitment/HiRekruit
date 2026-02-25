import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertTriangle,
    Clock,
    Bell,
    ChevronDown,
    ChevronUp,
    ArrowRight,
    CalendarPlus,
    X,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const DeadlineNotifications = ({ companyId }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [summary, setSummary] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const [dismissed, setDismissed] = useState([]);
    const [extendingDriveId, setExtendingDriveId] = useState(null);
    const [newEndDate, setNewEndDate] = useState("");
    const [extending, setExtending] = useState(false);

    useEffect(() => {
        if (!companyId) return;
        fetchNotifications();
    }, [companyId]);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(
                `${BASE_URL}/api/notifications/drive-deadlines?company_id=${companyId}`
            );
            if (!response.ok) return;
            const data = await response.json();
            setNotifications(data.notifications || []);
            setSummary(data.summary || null);
        } catch (err) {
            console.error("Error fetching deadline notifications:", err);
        }
    };

    const handleExtendDeadline = async (driveId) => {
        if (!newEndDate) return alert("Please select a new end date");
        setExtending(true);
        try {
            const response = await fetch(
                `${BASE_URL}/api/drive/${driveId}/extend-deadline`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ new_end_date: newEndDate }),
                }
            );
            if (!response.ok) {
                const err = await response.json();
                alert(err.error || "Failed to extend deadline");
                return;
            }
            setExtendingDriveId(null);
            setNewEndDate("");
            fetchNotifications();
        } catch (err) {
            console.error("Error extending deadline:", err);
        } finally {
            setExtending(false);
        }
    };

    const handleDismiss = (driveId) => {
        setDismissed((prev) => [...prev, driveId]);
    };

    const visibleNotifications = notifications.filter(
        (n) => !dismissed.includes(n.drive_id)
    );

    if (visibleNotifications.length === 0) return null;

    const getUrgencyStyles = (urgency) => {
        switch (urgency) {
            case "overdue":
                return {
                    bg: "bg-red-50",
                    border: "border-red-200",
                    icon: "text-red-500",
                    text: "text-red-800",
                    subtext: "text-red-600",
                    badge: "bg-red-100 text-red-700",
                    button: "bg-red-600 hover:bg-red-700 text-white",
                };
            case "critical":
                return {
                    bg: "bg-red-50",
                    border: "border-red-200",
                    icon: "text-red-500",
                    text: "text-red-800",
                    subtext: "text-red-600",
                    badge: "bg-red-100 text-red-700",
                    button: "bg-red-600 hover:bg-red-700 text-white",
                };
            case "warning":
                return {
                    bg: "bg-amber-50",
                    border: "border-amber-200",
                    icon: "text-amber-500",
                    text: "text-amber-800",
                    subtext: "text-amber-600",
                    badge: "bg-amber-100 text-amber-700",
                    button: "bg-amber-600 hover:bg-amber-700 text-white",
                };
            default:
                return {
                    bg: "bg-blue-50",
                    border: "border-blue-200",
                    icon: "text-blue-500",
                    text: "text-blue-800",
                    subtext: "text-blue-600",
                    badge: "bg-blue-100 text-blue-700",
                    button: "bg-blue-600 hover:bg-blue-700 text-white",
                };
        }
    };

    const getHeaderStyle = () => {
        if (summary?.overdue > 0 || summary?.critical > 0)
            return {
                bg: "bg-red-50",
                border: "border-red-200",
                text: "text-red-800",
                icon: "text-red-500",
            };
        if (summary?.warning > 0)
            return {
                bg: "bg-amber-50",
                border: "border-amber-200",
                text: "text-amber-800",
                icon: "text-amber-500",
            };
        return {
            bg: "bg-blue-50",
            border: "border-blue-200",
            text: "text-blue-800",
            icon: "text-blue-500",
        };
    };

    const headerStyle = getHeaderStyle();

    return (
        <div className="mb-6">
            {/* Header Bar */}
            <div
                className={`${headerStyle.bg} border ${headerStyle.border} rounded-lg px-4 py-3 cursor-pointer transition-all`}
                onClick={() => setCollapsed(!collapsed)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Bell size={18} className={headerStyle.icon} />
                        <span className={`font-medium text-sm ${headerStyle.text}`}>
                            {summary?.overdue > 0 && (
                                <span className="mr-2">
                                    🔴 {summary.overdue} overdue
                                </span>
                            )}
                            {summary?.critical > 0 && (
                                <span className="mr-2">
                                    ⚠️ {summary.critical} due today
                                </span>
                            )}
                            {summary?.warning > 0 && (
                                <span className="mr-2">
                                    ⏰ {summary.warning} due soon
                                </span>
                            )}
                            {summary?.info > 0 && (
                                <span>📋 {summary.info} approaching</span>
                            )}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs ${headerStyle.text} opacity-60`}>
                            {visibleNotifications.length} reminder
                            {visibleNotifications.length !== 1 ? "s" : ""}
                        </span>
                        {collapsed ? (
                            <ChevronDown size={16} className={headerStyle.text} />
                        ) : (
                            <ChevronUp size={16} className={headerStyle.text} />
                        )}
                    </div>
                </div>
            </div>

            {/* Notification Cards */}
            {!collapsed && (
                <div className="mt-3 space-y-2">
                    {visibleNotifications.map((notif) => {
                        const styles = getUrgencyStyles(notif.urgency);
                        const isExtending = extendingDriveId === notif.drive_id;

                        return (
                            <div
                                key={notif.drive_id}
                                className={`${styles.bg} border ${styles.border} rounded-lg p-4 transition-all`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        {notif.urgency === "overdue" || notif.urgency === "critical" ? (
                                            <AlertTriangle size={18} className={`${styles.icon} mt-0.5 flex-shrink-0`} />
                                        ) : (
                                            <Clock size={18} className={`${styles.icon} mt-0.5 flex-shrink-0`} />
                                        )}
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${styles.text}`}>
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles.badge}`}
                                                >
                                                    {notif.urgency === "overdue"
                                                        ? `${notif.overdue_days} day${notif.overdue_days !== 1 ? "s" : ""} overdue`
                                                        : notif.days_remaining === 0
                                                            ? "Due today"
                                                            : `${notif.days_remaining} day${notif.days_remaining !== 1 ? "s" : ""} left`}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/dashboard/process/${notif.drive_id}`);
                                                    }}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                                >
                                                    View Drive <ArrowRight size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {(notif.urgency === "overdue" || notif.urgency === "critical") && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExtendingDriveId(
                                                        isExtending ? null : notif.drive_id
                                                    );
                                                    setNewEndDate("");
                                                }}
                                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium ${styles.button} transition-colors`}
                                            >
                                                <CalendarPlus size={14} />
                                                Extend
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDismiss(notif.drive_id);
                                            }}
                                            className="p-1 hover:bg-black/5 rounded transition-colors"
                                            title="Dismiss"
                                        >
                                            <X size={14} className="text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Extend Deadline Inline Form */}
                                {isExtending && (
                                    <div className="mt-3 pt-3 border-t border-black/10 flex items-center gap-3 flex-wrap">
                                        <span className="text-xs text-gray-600">
                                            New end date:
                                        </span>
                                        <input
                                            type="date"
                                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                                            value={newEndDate}
                                            onChange={(e) => setNewEndDate(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            min={new Date().toISOString().split("T")[0]}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleExtendDeadline(notif.drive_id);
                                            }}
                                            disabled={extending || !newEndDate}
                                            className="px-4 py-1.5 bg-gray-900 text-white rounded-md text-xs font-medium hover:bg-black transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            {extending ? "Extending..." : "Confirm Extension"}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExtendingDriveId(null);
                                            }}
                                            className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DeadlineNotifications;
