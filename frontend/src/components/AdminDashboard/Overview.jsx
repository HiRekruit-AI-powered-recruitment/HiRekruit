import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from ".././Loader";
import { useUsers } from "../../Hooks/userHooks/useGetAllUsers";
import { useGetAllDrives } from "../../Hooks/drives hooks/useGetAllDrives";
import { useGetAllCandidates } from "../../Hooks/candidate hooks/useGetAllCandidates";

const Overview = () => {
  const [loading, setLoading] = useState(true);

  const { users, loading: isGettingAllUsers } = useUsers();
  const { drives, loading: isGettingDrives } = useGetAllDrives();
  const { candidates, loading: isGettingCandidates } = useGetAllCandidates();

  const [currentClients, setCurrentClients] = useState([]);
  const [requestedClients, setRequestedClients] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    totalCandidates: 0,
    shortlistedCandidates: 0,
    avgCandidatesPerDrive: 0,
    shortlistedRate: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  const activeDrives = drives.filter((drive) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(drive.start_date);
    const endDate = new Date(drive.end_date);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return startDate <= today && endDate >= today;
  });

  useEffect(() => {
    fetchDashboardData();
  }, [users, drives, candidates]);

  const fetchDashboardData = async () => {
    try {
      const acceptedUsers = (users || []).filter(
        (user) => user.is_approved === "accepted",
      );

      const pendingUsers = (users || []).filter(
        (user) => user.is_approved === "pending",
      );

      setCurrentClients(acceptedUsers);
      setRequestedClients(pendingUsers);

      setPlatformStats({
        totalCandidates: candidates.length || 0,
        shortlistedCandidates: 0,
        avgCandidatesPerDrive:
          drives.length > 0
            ? Math.round((candidates.length || 0) / drives.length)
            : 0,
        shortlistedRate: 0,
      });

      setRecentActivities([
        {
          id: 1,
          type: "users",
          message: `${users.length} total users registered`,
          time: "Live",
        },
        {
          id: 2,
          type: "drive",
          message: `${activeDrives.length} active drives available`,
          time: "Live",
        },
        {
          id: 3,
          type: "candidate",
          message: `${candidates.length} total candidates uploaded`,
          time: "Live",
        },
      ]);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      toast.error("Failed to load dashboard data");
      setLoading(false);
    }
  };

  if (loading || isGettingAllUsers || isGettingDrives || isGettingCandidates)
    return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total clients</p>
            <p className="text-2xl font-bold text-gray-900">
              {currentClients.length}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Active drives</p>
            <p className="text-2xl font-bold text-blue-600">
              {activeDrives.length}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Pending requests</p>
            <p className="text-2xl font-bold text-amber-500">
              {requestedClients.length}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total candidates</p>
            <p className="text-2xl font-bold text-purple-600">
              {platformStats.totalCandidates}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activities
            </h2>

            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
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
                    {activeDrives.length}
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

                <p className="text-xs text-gray-500">Live data</p>
              </div>
            </div>
          </div>
        </div>

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
