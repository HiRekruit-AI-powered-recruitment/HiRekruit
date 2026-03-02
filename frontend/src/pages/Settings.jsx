import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Home,
  LogOut,
  Download,
  Trash2,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  HelpCircle,
  FileText,
  Database,
  Key,
  Check,
  X,
  Settings as SettingsIcon,
  Zap,
  MessageSquare,
} from "lucide-react";
import Loader from "../components/Loader";

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    // General Settings
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    company: "",
    timezone: "UTC",
    language: "english",

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    driveReminders: true,
    candidateUpdates: true,
    systemUpdates: false,

    // Appearance Settings
    theme: "light",
    compactMode: false,
    showAnimations: true,

    // Privacy Settings
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    twoFactorAuth: false,
  });

  // Mock data for demonstration
  const mockSessions = [
    {
      id: 1,
      device: "Chrome on Windows",
      location: "Mumbai, India",
      ip: "192.168.1.1",
      lastActive: new Date(Date.now() - 1000 * 60 * 5),
      current: true,
    },
    {
      id: 2,
      device: "Safari on iPhone",
      location: "Delhi, India",
      ip: "192.168.1.2",
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
      current: false,
    },
  ];

  const mockApiKeys = [
    {
      id: 1,
      name: "Production API Key",
      key: "sk_live_...1234",
      created: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2),
      permissions: ["read", "write"],
    },
  ];

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "account", label: "Account", icon: SettingsIcon },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const handleGoToHomepage = () => {
    navigate("/dashboard");
  };

  const handleExportData = () => {
    // Simulate data export
    const data = {
      user: formData,
      settings: formData,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Data exported successfully!");
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      toast.error("Account deletion not implemented in demo");
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading && !formData.fullName) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                Settings
              </h1>
              <p className="text-sm text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGoToHomepage}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Home className="w-4 h-4" />
                Homepage
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200">
              {/* General Settings */}
              {activeTab === "general" && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      General Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) =>
                            handleInputChange("fullName", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) =>
                            handleInputChange("company", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timezone
                        </label>
                        <select
                          value={formData.timezone}
                          onChange={(e) =>
                            handleInputChange("timezone", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="UTC">UTC</option>
                          <option value="EST">Eastern Time</option>
                          <option value="PST">Pacific Time</option>
                          <option value="IST">India Standard Time</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select
                          value={formData.language}
                          onChange={(e) =>
                            handleInputChange("language", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="english">English</option>
                          <option value="spanish">Spanish</option>
                          <option value="french">French</option>
                          <option value="german">German</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === "notifications" && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Notification Preferences
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">
                              Email Notifications
                            </p>
                            <p className="text-sm text-gray-600">
                              Receive notifications via email
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleInputChange(
                              "emailNotifications",
                              !formData.emailNotifications,
                            )
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.emailNotifications
                              ? "bg-blue-600"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.emailNotifications
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">
                              Push Notifications
                            </p>
                            <p className="text-sm text-gray-600">
                              Receive push notifications in browser
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleInputChange(
                              "pushNotifications",
                              !formData.pushNotifications,
                            )
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.pushNotifications
                              ? "bg-blue-600"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.pushNotifications
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">
                              SMS Notifications
                            </p>
                            <p className="text-sm text-gray-600">
                              Receive notifications via SMS
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleInputChange(
                              "smsNotifications",
                              !formData.smsNotifications,
                            )
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.smsNotifications
                              ? "bg-blue-600"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.smsNotifications
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3">
                      Notification Types
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: "driveReminders",
                          label: "Drive Reminders",
                          desc: "Get reminded about upcoming drives",
                        },
                        {
                          key: "candidateUpdates",
                          label: "Candidate Updates",
                          desc: "Updates on new candidate applications",
                        },
                        {
                          key: "systemUpdates",
                          label: "System Updates",
                          desc: "Important system announcements",
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.label}
                            </p>
                            <p className="text-sm text-gray-600">{item.desc}</p>
                          </div>
                          <button
                            onClick={() =>
                              handleInputChange(item.key, !formData[item.key])
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              formData[item.key] ? "bg-blue-600" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                formData[item.key]
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === "appearance" && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Appearance
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Theme
                        </label>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleInputChange("theme", "light")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                              formData.theme === "light"
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <Sun className="w-4 h-4" />
                            Light
                          </button>
                          <button
                            onClick={() => handleInputChange("theme", "dark")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                              formData.theme === "dark"
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <Moon className="w-4 h-4" />
                            Dark
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Compact Mode
                          </p>
                          <p className="text-sm text-gray-600">
                            Use more compact layout
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleInputChange(
                              "compactMode",
                              !formData.compactMode,
                            )
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.compactMode ? "bg-blue-600" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.compactMode
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Animations
                          </p>
                          <p className="text-sm text-gray-600">
                            Enable interface animations
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleInputChange(
                              "showAnimations",
                              !formData.showAnimations,
                            )
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.showAnimations
                              ? "bg-blue-600"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.showAnimations
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy & Security */}
              {activeTab === "privacy" && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Privacy Settings
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile Visibility
                        </label>
                        <select
                          value={formData.profileVisibility}
                          onChange={(e) =>
                            handleInputChange(
                              "profileVisibility",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                          <option value="company">Company Only</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Show Email
                          </p>
                          <p className="text-sm text-gray-600">
                            Display email in your profile
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleInputChange("showEmail", !formData.showEmail)
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.showEmail ? "bg-blue-600" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.showEmail
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Show Phone
                          </p>
                          <p className="text-sm text-gray-600">
                            Display phone number in your profile
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleInputChange("showPhone", !formData.showPhone)
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.showPhone ? "bg-blue-600" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.showPhone
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Two-Factor Authentication
                          </p>
                          <p className="text-sm text-gray-600">
                            Add an extra layer of security
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleInputChange(
                              "twoFactorAuth",
                              !formData.twoFactorAuth,
                            )
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.twoFactorAuth
                              ? "bg-blue-600"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.twoFactorAuth
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3">
                      Active Sessions
                    </h3>
                    <div className="space-y-3">
                      {mockSessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Monitor className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {session.device}
                              </p>
                              <p className="text-sm text-gray-600">
                                {session.location} •{" "}
                                {formatTimestamp(session.lastActive)}
                              </p>
                            </div>
                          </div>
                          {session.current && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Account Settings */}
              {activeTab === "account" && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Account Management
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Download className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">
                              Export Your Data
                            </p>
                            <p className="text-sm text-gray-600">
                              Download all your data in JSON format
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleExportData}
                          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Export
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">
                              Change Password
                            </p>
                            <p className="text-sm text-gray-600">
                              Update your account password
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                          Change
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Key className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">
                              API Keys
                            </p>
                            <p className="text-sm text-gray-600">
                              Manage your API access keys
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3">
                      Danger Zone
                    </h3>
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Trash2 className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="font-medium text-red-900">
                              Delete Account
                            </p>
                            <p className="text-sm text-red-700">
                              Permanently delete your account and all data
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleDeleteAccount}
                          className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="px-6 py-4 border-t bg-gray-50">
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
