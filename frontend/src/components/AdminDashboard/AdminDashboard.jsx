import React, { useState, useEffect } from "react";
import {
  Building2,
  Briefcase,
  Users,
  UserCheck,
  TrendingUp,
  Activity,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from ".././Loader";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeDrives: 0,
    totalHRUsers: 0,
    totalCandidates: 0,
    shortlistedCandidates: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all stats - you'll need to implement these endpoints
      // For now, using mock data

      // TODO: Replace with actual API calls
      // const companiesRes = await fetch(`${BASE_URL}/api/admin/companies/count`);
      // const drivesRes = await fetch(`${BASE_URL}/api/admin/drives/active`);
      // const hrUsersRes = await fetch(`${BASE_URL}/api/admin/hr-users/count`);
      // const candidatesRes = await fetch(`${BASE_URL}/api/admin/candidates/count`);

      // Mock data for now
      setTimeout(() => {
        setStats({
          totalCompanies: 25,
          activeDrives: 48,
          totalHRUsers: 87,
          totalCandidates: 1234,
          shortlistedCandidates: 456,
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

  const statCards = [
    {
      title: "Total Companies",
      value: stats.totalCompanies,
      icon: Building2,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Active Drives",
      value: stats.activeDrives,
      icon: Briefcase,
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "HR Users",
      value: stats.totalHRUsers,
      icon: Users,
      color: "bg-green-500",
      lightColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Total Candidates",
      value: stats.totalCandidates,
      icon: UserCheck,
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            Overview of all platform activities and statistics
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.lightColor}`}>
                    <IconComponent className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
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
                    Shortlisted Rate
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    37%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: "37%" }}
                  ></div>
                </div>
              </div>

              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Active Drives</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.activeDrives}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Across all companies</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Avg. Candidates/Drive
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    26
                  </span>
                </div>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            System Health
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">API Status</p>
                <p className="text-xs text-gray-600">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs text-gray-600">Healthy</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Services</p>
                <p className="text-xs text-gray-600">All Running</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
