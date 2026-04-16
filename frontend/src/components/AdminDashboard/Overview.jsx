import React, { useState, useEffect } from "react";
import {
  Building2,
  Briefcase,
  Users,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from ".././Loader";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ─── Avatar ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  { bg: "#E6F1FB", txt: "#185FA5" },
  { bg: "#E1F5EE", txt: "#0F6E56" },
  { bg: "#EEEDFE", txt: "#534AB7" },
  { bg: "#FAEEDA", txt: "#854F0B" },
  { bg: "#FAECE7", txt: "#993C1D" },
];

const getInitials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const Avatar = ({ name, index }) => {
  const c = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
      style={{ background: c.bg, color: c.txt }}
    >
      {getInitials(name)}
    </div>
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────────

const Badge = ({ label, variant = "gray" }) => {
  const styles = {
    gray: "bg-gray-100 text-gray-600",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    teal: "bg-teal-100 text-teal-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}
    >
      {label}
    </span>
  );
};

const PLAN_VARIANT = { Enterprise: "blue", Growth: "teal", Starter: "gray" };
const STATUS_VARIANT = { active: "green", trial: "amber" };

// ─── Seed data ────────────────────────────────────────────────────────────────

const INITIAL_CURRENT = [
  {
    _id: "1",
    name: "Tech Corp",
    email: "hr@techcorp.com",
    industry: "Technology",
    plan: "Enterprise",
    activeDrives: 8,
    hrUsers: 12,
    joined: "Jan 2025",
    status: "active",
  },
  {
    _id: "2",
    name: "StartupXYZ",
    email: "contact@startupxyz.com",
    industry: "FinTech",
    plan: "Growth",
    activeDrives: 3,
    hrUsers: 4,
    joined: "Feb 2025",
    status: "active",
  },
  {
    _id: "3",
    name: "Global Solutions",
    email: "hr@globalsolutions.com",
    industry: "Consulting",
    plan: "Enterprise",
    activeDrives: 7,
    hrUsers: 9,
    joined: "Nov 2023",
    status: "active",
  },
  {
    _id: "4",
    name: "EduLearn",
    email: "people@edulearn.org",
    industry: "EdTech",
    plan: "Starter",
    activeDrives: 2,
    hrUsers: 3,
    joined: "Mar 2025",
    status: "trial",
  },
];

const INITIAL_REQUESTED = [
  {
    _id: "r1",
    name: "GreenRoot Energy",
    email: "hr@greenroot.io",
    industry: "Clean Energy",
    size: "50–100",
    requestedAt: "Apr 5, 2026",
    contact: "Priya Nair",
  },
  {
    _id: "r2",
    name: "CyberShield Inc.",
    email: "hr@cybershield.io",
    industry: "Cybersecurity",
    size: "50–100",
    requestedAt: "Apr 3, 2026",
    contact: "Anya Petrov",
  },
  {
    _id: "r3",
    name: "FreshCart Grocery",
    email: "people@freshcart.co",
    industry: "E-Commerce",
    size: "200–500",
    requestedAt: "Apr 1, 2026",
    contact: "David Kim",
  },
];

// ─── Overview (merged) ────────────────────────────────────────────────────────

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("current");
  const [currentClients, setCurrentClients] = useState(INITIAL_CURRENT);
  const [requestedClients, setRequestedClients] = useState(INITIAL_REQUESTED);
  const [platformStats, setPlatformStats] = useState({
    totalCandidates: 0,
    shortlistedCandidates: 0,
    avgCandidatesPerDrive: 0,
    shortlistedRate: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  // Derived stats from client state
  const totalDrives = currentClients.reduce((s, c) => s + c.activeDrives, 0);
  const totalHR = currentClients.reduce((s, c) => s + c.hrUsers, 0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // TODO: Replace mock data with real API calls, e.g.:
      // const res = await fetch(`${BASE_URL}/api/admin/stats`);
      // const data = await res.json();

      setTimeout(() => {
        setPlatformStats({
          totalCandidates: 1234,
          shortlistedCandidates: 456,
          avgCandidatesPerDrive: 26,
          shortlistedRate: 37,
        });

        setRecentActivities([
          {
            id: 1,
            type: "company",
            message: "New company registered: Tech Corp",
            time: "2 hours ago",
          },
          {
            id: 2,
            type: "drive",
            message: "New drive created: Software Engineer at StartupXYZ",
            time: "3 hours ago",
          },
          {
            id: 3,
            type: "candidate",
            message: "50 new candidates applied today",
            time: "5 hours ago",
          },
        ]);

        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      toast.error("Failed to load dashboard data");
      setLoading(false);
    }
  };

  const handleApprove = (client) => {
    setCurrentClients((prev) => [
      ...prev,
      {
        _id: client._id,
        name: client.name,
        email: client.email,
        industry: client.industry,
        plan: "Starter",
        activeDrives: 0,
        hrUsers: 1,
        joined: "Apr 2026",
        status: "trial",
      },
    ]);
    setRequestedClients((prev) => prev.filter((r) => r._id !== client._id));
    toast.success(`${client.name} approved and added as a client`);
  };

  const handleReject = (client) => {
    setRequestedClients((prev) => prev.filter((r) => r._id !== client._id));
    toast.error(`${client.name}'s request has been rejected`);
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
          </div>
          <p className="text-sm text-gray-500">
            Monitor clients, platform statistics, and manage incoming requests
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total clients</p>
            <p className="text-2xl font-bold text-gray-900">
              {currentClients.length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Active drives</p>
            <p className="text-2xl font-bold text-blue-600">{totalDrives}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Pending requests</p>
            <p className="text-2xl font-bold text-amber-500">
              {requestedClients.length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total HR users</p>
            <p className="text-2xl font-bold text-green-600">{totalHR}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total candidates</p>
            <p className="text-2xl font-bold text-purple-600">
              {platformStats.totalCandidates.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ── Activity + Quick Stats ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activities
            </h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Stats
            </h2>
            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Shortlisted rate
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {platformStats.shortlistedRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${platformStats.shortlistedRate}%` }}
                  />
                </div>
              </div>

              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Active drives</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {totalDrives}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Across all companies</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Avg. candidates/drive
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {platformStats.avgCandidatesPerDrive}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── System Health ── */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            System Health
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "API Status", sub: "Operational" },
              { label: "Database", sub: "Healthy" },
              { label: "Services", sub: "All Running" },
            ].map(({ label, sub }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-4 bg-green-50 rounded-lg"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-600">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
