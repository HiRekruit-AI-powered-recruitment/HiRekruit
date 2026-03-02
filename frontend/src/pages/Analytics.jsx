import { useState, useEffect } from "react";
import {
  Users,
  CheckCircle,
  Send,
  Search,
  TrendingUp,
  TrendingDown,
  Clock,
  Award,
  Calendar,
  Filter,
  Download,
  Mail,
  Phone,
  Building,
  MapPin,
  Briefcase,
  DollarSign,
  Target,
  Activity,
  BarChart3,
  PieChart,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
} from "chart.js";
import { Doughnut, Bar, Line, Pie } from "react-chartjs-2";
import Loader from "../components/Loader";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
);

export default function Analytics() {
  const [jobId, setJobId] = useState("");
  const [driveId, setDriveId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOffers, setShowOffers] = useState(false);
  const [timeRange, setTimeRange] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("overview");

  // Enhanced stats with more metrics
  const [stats, setStats] = useState({
    total: 0,
    shortlisted: 0,
    selected: 0,
    rejected: 0,
    pending: 0,
    interviewCompleted: 0,
    interviewScheduled: 0,
    avgResponseTime: 0,
    conversionRate: 0,
    dropOffRate: 0,
    offerAcceptanceRate: 0,
    timeToHire: 0,
    costPerHire: 0,
    sourceEffectiveness: {},
    departmentStats: {},
    experienceStats: {},
    skillStats: {},
    timelineData: [],
    dailyApplications: [],
    weeklyProgress: [],
  });

  const [candidates, setCandidates] = useState([]);
  const [showCandidateDetails, setShowCandidateDetails] = useState(false);

  const fetchAnalytics = async () => {
    if (!jobId.trim()) {
      setError("Please enter a valid Job ID");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Fetch drive information
      const driveRes = await fetch(`${BASE_URL}/api/drive/job?job_id=${jobId}`);
      if (!driveRes.ok) throw new Error("Failed to fetch drive ID");

      const driveData = await driveRes.json();
      const driveIdValue =
        driveData.drive_id ||
        driveData.drive?.id ||
        (Array.isArray(driveData.drive_ids) ? driveData.drive_ids[0] : null);

      if (!driveIdValue) throw new Error("No drive ID found for this Job ID");
      setDriveId(driveIdValue);

      // Fetch detailed candidate data
      const candidatesRes = await fetch(
        `${BASE_URL}/api/drive/${driveIdValue}/candidates`,
      );
      if (!candidatesRes.ok) throw new Error("Failed to fetch candidates");

      const candidatesData = await candidatesRes.json();
      const allCandidates = Array.isArray(candidatesData)
        ? candidatesData
        : candidatesData.candidates || candidatesData.data || [];

      setCandidates(allCandidates);

      // Calculate comprehensive metrics
      const total = allCandidates.length;
      const shortlisted = allCandidates.filter(
        (c) => c.resume_shortlisted === "yes" || c.shortlisted === true,
      ).length;
      const selected = allCandidates.filter((c) => c.selected === "yes").length;
      const rejected = allCandidates.filter(
        (c) =>
          c.selected === "no" &&
          (c.resume_shortlisted === "yes" || c.shortlisted === true),
      ).length;
      const pending = allCandidates.filter(
        (c) => c.selected !== "yes" && c.selected !== "no",
      ).length;

      // Interview completion stats
      const interviewCompleted = allCandidates.filter((c) =>
        c.rounds_status?.some((r) => r.completed === "yes"),
      ).length;

      const interviewScheduled = allCandidates.filter((c) =>
        c.rounds_status?.some(
          (r) => r.scheduled === "yes" && r.completed === "no",
        ),
      ).length;

      // Calculate rates
      const conversionRate =
        total > 0 ? ((selected / total) * 100).toFixed(1) : 0;
      const shortlistRate =
        total > 0 ? ((shortlisted / total) * 100).toFixed(1) : 0;
      const dropOffRate =
        shortlisted > 0
          ? (((shortlisted - selected) / shortlisted) * 100).toFixed(1)
          : 0;

      // Time-based analytics (mock data for demonstration)
      const timelineData = generateTimelineData(allCandidates);
      const dailyApplications = generateDailyData(allCandidates);
      const weeklyProgress = generateWeeklyData(allCandidates);

      // Department and experience breakdown
      const departmentStats = calculateDepartmentStats(allCandidates);
      const experienceStats = calculateExperienceStats(allCandidates);

      setStats({
        total,
        shortlisted,
        selected,
        rejected,
        pending,
        interviewCompleted,
        interviewScheduled,
        avgResponseTime: 24, // hours (mock data)
        conversionRate,
        dropOffRate,
        offerAcceptanceRate:
          selected > 0
            ? ((selected / (selected + rejected)) * 100).toFixed(1)
            : 0,
        timeToHire: 15, // days (mock data)
        costPerHire: 2500, // (mock data)
        sourceEffectiveness: calculateSourceStats(allCandidates),
        departmentStats,
        experienceStats,
        skillStats: {}, // Would need skill data from backend
        timelineData,
        dailyApplications,
        weeklyProgress,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for data generation
  const generateTimelineData = (candidates) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split("T")[0],
        applications: Math.floor(Math.random() * 20) + 5,
        shortlisted: Math.floor(Math.random() * 10) + 2,
        selected: Math.floor(Math.random() * 5) + 1,
      };
    });
    return last30Days;
  };

  const generateDailyData = (candidates) => {
    return Array.from({ length: 7 }, (_, i) => ({
      day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
      applications: Math.floor(Math.random() * 30) + 10,
      interviews: Math.floor(Math.random() * 15) + 5,
      offers: Math.floor(Math.random() * 8) + 2,
    }));
  };

  const generateWeeklyData = (candidates) => {
    return Array.from({ length: 4 }, (_, i) => ({
      week: `Week ${i + 1}`,
      total: Math.floor(Math.random() * 100) + 50,
      completed: Math.floor(Math.random() * 50) + 20,
      pending: Math.floor(Math.random() * 30) + 10,
    }));
  };

  const calculateDepartmentStats = (candidates) => {
    // Mock department distribution
    return {
      Engineering: 45,
      Sales: 25,
      Marketing: 15,
      HR: 10,
      Finance: 5,
    };
  };

  const calculateExperienceStats = (candidates) => {
    // Mock experience levels
    return {
      "0-2 years": 30,
      "2-5 years": 40,
      "5-10 years": 25,
      "10+ years": 5,
    };
  };

  const calculateSourceStats = (candidates) => {
    // Mock source effectiveness
    return {
      LinkedIn: 45,
      "Company Website": 25,
      Referral: 20,
      "Job Board": 10,
    };
  };

  if (loading) return <Loader />;

  // Chart configurations
  const doughnutData = {
    labels: showOffers
      ? ["Shortlisted", "Selected", "Rejected", "Pending"]
      : ["Shortlisted", "Not Shortlisted"],
    datasets: [
      {
        data: showOffers
          ? [stats.shortlisted, stats.selected, stats.rejected, stats.pending]
          : [stats.shortlisted, stats.total - stats.shortlisted],
        backgroundColor: showOffers
          ? ["#3b82f6", "#10b981", "#ef4444", "#f59e0b"]
          : ["#3b82f6", "#e5e7eb"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const lineData = {
    labels: stats.timelineData.map((d) => d.date.slice(5)),
    datasets: [
      {
        label: "Applications",
        data: stats.timelineData.map((d) => d.applications),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
      {
        label: "Shortlisted",
        data: stats.timelineData.map((d) => d.shortlisted),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
      },
      {
        label: "Selected",
        data: stats.timelineData.map((d) => d.selected),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const barData = {
    labels: ["Applied", "Shortlisted", "Interviewed", "Selected", "Rejected"],
    datasets: [
      {
        label: "Candidates",
        data: [
          stats.total,
          stats.shortlisted,
          stats.interviewCompleted,
          stats.selected,
          stats.rejected,
        ],
        backgroundColor: [
          "#3b82f6",
          "#10b981",
          "#f59e0b",
          "#10b981",
          "#ef4444",
        ],
        borderRadius: 8,
      },
    ],
  };

  const departmentPieData = {
    labels: Object.keys(stats.departmentStats),
    datasets: [
      {
        data: Object.values(stats.departmentStats),
        backgroundColor: [
          "#3b82f6",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
        ],
      },
    ],
  };

  const experienceBarData = {
    labels: Object.keys(stats.experienceStats),
    datasets: [
      {
        label: "Candidates",
        data: Object.values(stats.experienceStats),
        backgroundColor: "#3b82f6",
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { padding: 15, font: { size: 12 } },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-600">
            Comprehensive recruitment insights and metrics
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
        {/* Job ID Search Input */}
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Enter Job ID..."
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") fetchAnalytics();
            }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm transition-colors"
          />
        </div>

        {/* Search and Clear Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnalytics}
            className="px-6 py-3 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-black transition-colors"
          >
            Search
          </button>
          <button
            onClick={() => setJobId("")}
            className="px-6 py-3 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-black transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="flex-1 max-w-md">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm transition-colors"
          >
            <option value="all">All Time</option>
            <option value="30">Last 30 Days</option>
            <option value="7">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Drive ID Display */}
      {driveId && (
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Drive ID:</span> {driveId}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        </div>
      )}

      {stats.total > 0 && (
        <div className="max-w-6xl mx-auto px-6 pb-12">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="Total Applications"
              value={stats.total}
              change="+12%"
              trend="up"
              icon={Users}
              color="blue"
            />
            <KPICard
              title="Conversion Rate"
              value={`${stats.conversionRate}%`}
              change="+3.2%"
              trend="up"
              icon={Target}
              color="green"
            />
            <KPICard
              title="Time to Hire"
              value={`${stats.timeToHire} days`}
              change="-2 days"
              trend="down"
              icon={Clock}
              color="purple"
            />
            <KPICard
              title="Cost per Hire"
              value={`$${stats.costPerHire}`}
              change="-5%"
              trend="down"
              icon={DollarSign}
              color="orange"
            />
          </div>

          {/* Metric Tabs */}
          <div className="bg-white rounded-lg border border-gray-200 mb-8">
            <div className="border-b border-gray-200">
              <div className="flex space-x-8 px-6">
                {["overview", "funnel", "timeline", "demographics"].map(
                  (metric) => (
                    <button
                      key={metric}
                      onClick={() => setSelectedMetric(metric)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                        selectedMetric === metric
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {metric}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="p-6">
              {selectedMetric === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Application Funnel
                    </h3>
                    <div className="h-80">
                      <Bar data={barData} options={chartOptions} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Status Distribution
                    </h3>
                    <div className="h-80">
                      <Doughnut data={doughnutData} options={chartOptions} />
                    </div>
                  </div>
                </div>
              )}

              {selectedMetric === "timeline" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">30-Day Trend</h3>
                  <div className="h-96">
                    <Line data={lineData} options={chartOptions} />
                  </div>
                </div>
              )}

              {selectedMetric === "demographics" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Department Distribution
                    </h3>
                    <div className="h-80">
                      <Pie data={departmentPieData} options={chartOptions} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Experience Levels
                    </h3>
                    <div className="h-80">
                      <Bar data={experienceBarData} options={chartOptions} />
                    </div>
                  </div>
                </div>
              )}

              {selectedMetric === "funnel" && <FunnelAnalysis stats={stats} />}
            </div>
          </div>

          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <StatCard
              title="Shortlisted Candidates"
              value={stats.shortlisted}
              subtitle={`${((stats.shortlisted / stats.total) * 100).toFixed(
                1,
              )}% of total`}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Interviews Completed"
              value={stats.interviewCompleted}
              subtitle="Successfully conducted"
              icon={UserCheck}
              color="blue"
            />
            <StatCard
              title="Offers Extended"
              value={stats.selected}
              subtitle={`${stats.offerAcceptanceRate}% acceptance rate`}
              icon={Award}
              color="purple"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced KPI Card Component
function KPICard({ title, value, change, trend, icon: Icon, color }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div
          className={`flex items-center gap-1 text-sm ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend === "up" ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{change}</span>
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// Enhanced Stat Card Component
function StatCard({ title, value, subtitle, icon: Icon, color }) {
  const colorClasses = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

// Funnel Analysis Component
function FunnelAnalysis({ stats }) {
  const funnelStages = [
    { name: "Applied", count: stats.total, percentage: 100 },
    {
      name: "Shortlisted",
      count: stats.shortlisted,
      percentage: (stats.shortlisted / stats.total) * 100,
    },
    {
      name: "Interviewed",
      count: stats.interviewCompleted,
      percentage: (stats.interviewCompleted / stats.total) * 100,
    },
    {
      name: "Selected",
      count: stats.selected,
      percentage: (stats.selected / stats.total) * 100,
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Recruitment Funnel Analysis</h3>
      <div className="space-y-4">
        {funnelStages.map((stage, index) => (
          <div key={stage.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{stage.name}</span>
              <span className="text-sm text-gray-600">
                {stage.count} candidates ({stage.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-end pr-3"
                style={{ width: `${stage.percentage}%` }}
              >
                <span className="text-white text-xs font-medium">
                  {stage.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-1">Drop-off Rate</h4>
          <p className="text-2xl font-bold text-blue-900">
            {stats.dropOffRate}%
          </p>
          <p className="text-sm text-blue-700">
            Between shortlisted and selected
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-1">Offer Acceptance</h4>
          <p className="text-2xl font-bold text-green-900">
            {stats.offerAcceptanceRate}%
          </p>
          <p className="text-sm text-green-700">Of extended offers</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-1">
            Avg. Response Time
          </h4>
          <p className="text-2xl font-bold text-purple-900">
            {stats.avgResponseTime}h
          </p>
          <p className="text-sm text-purple-700">Time to first response</p>
        </div>
      </div>
    </div>
  );
}
