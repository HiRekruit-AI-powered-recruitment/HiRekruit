import { useState } from "react";
import { Users, CheckCircle, Send, Search } from "lucide-react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import Loader from "../components/Loader";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function Analytics() {
  const [jobId, setJobId] = useState("");
  const [driveId, setDriveId] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    shortlisted: 0,
    selected: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOffers, setShowOffers] = useState(false);

  const fetchAnalytics = async () => {
    if (!jobId.trim()) {
      setError("Please enter a valid Job ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const driveRes = await fetch(`${BASE_URL}/api/drive/job?job_id=${jobId}`);
      if (!driveRes.ok) throw new Error("Failed to fetch drive ID");

      const driveData = await driveRes.json();
      const driveIdValue =
        driveData.drive_id ||
        driveData.drive?.id ||
        (Array.isArray(driveData.drive_ids) ? driveData.drive_ids[0] : null);

      if (!driveIdValue) throw new Error("No drive ID found for this Job ID");
      setDriveId(driveIdValue);

      const totalRes = await fetch(
        `${BASE_URL}/api/drive/${driveIdValue}/candidates`
      );
      if (!totalRes.ok) throw new Error("Failed to fetch total candidates");
      const totalData = await totalRes.json();
      const totalCandidates = Array.isArray(totalData)
        ? totalData.length
        : totalData.candidates?.length || totalData.data?.length || 0;

      const shortlistedRes = await fetch(
        `${BASE_URL}/api/drive/job/shortlisted?job_id=${jobId}`
      );
      if (!shortlistedRes.ok)
        throw new Error("Failed to fetch shortlisted candidates");
      const shortlistedData = await shortlistedRes.json();
      const shortlistedCount = Array.isArray(shortlistedData)
        ? shortlistedData.length
        : shortlistedData.candidates?.length ||
          shortlistedData.shortlisted?.length ||
          0;

      const selectedRes = await fetch(
        `${BASE_URL}/api/drive/${driveIdValue}/candidates`
      );
      if (!selectedRes.ok)
        throw new Error("Failed to fetch selected candidates");
      const selectedData = await selectedRes.json();
      const selectedCount = Array.isArray(selectedData)
        ? selectedData.filter((c) => c.selected === "yes").length
        : selectedData.candidates?.filter((c) => c.selected === "yes").length ||
          selectedData.data?.filter((c) => c.selected === "yes").length ||
          0;

      setStats({
        total: totalCandidates,
        shortlisted: shortlistedCount,
        selected: selectedCount,
      });
    } catch (err) {
      setError(err.message);
      setStats({ total: 0, shortlisted: 0, selected: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Doughnut chart for distribution
  const doughnutData = {
    labels: showOffers
      ? ["Shortlisted", "Selected", "Not Shortlisted"]
      : ["Shortlisted", "Not Shortlisted"],
    datasets: [
      {
        label: "Candidates",
        data: showOffers
          ? [
              stats.shortlisted,
              stats.selected,
              stats.total - stats.shortlisted - stats.selected,
            ]
          : [stats.shortlisted, stats.total - stats.shortlisted],
        backgroundColor: showOffers
          ? ["#0369a1", "#a78bfa", "#4b5563"]
          : ["#0369a1", "#4b5563"],
        borderWidth: 3,
        borderColor: "#fff",
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "65%",
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#374151", font: { size: 11 }, padding: 8 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Bar chart for percentages
  const shortlistedPercentage =
    stats.total > 0 ? ((stats.shortlisted / stats.total) * 100).toFixed(1) : 0;
  const selectedPercentage =
    stats.total > 0 ? ((stats.selected / stats.total) * 100).toFixed(1) : 0;

  const barData = {
    labels: ["Shortlisted %", "Selected %"],
    datasets: [
      {
        label: "Percentage",
        data: [shortlistedPercentage, selectedPercentage],
        backgroundColor: ["#0369a1", "#a78bfa"],
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 1200,
      easing: "easeInOutQuart",
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value) {
            return value + "%";
          },
          font: { size: 11 },
          color: "#4b5563",
        },
        grid: {
          color: "#e5e7eb",
        },
      },
      x: {
        ticks: {
          font: { size: 11 },
          color: "#4b5563",
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.parsed.y}%`;
          },
        },
      },
    },
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Drive Analytics
          </h1>
          <p className="text-sm text-gray-600">
            View complete drive analytics by Job ID
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8 max-w-xl py-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Enter Job ID..."
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchAnalytics()}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm transition-colors"
          />
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Show Drive ID */}
      {driveId && (
        <div className="mb-6 text-sm text-gray-600">
          <span className="font-medium text-gray-800">Drive ID:</span> {driveId}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Candidates"
          value={stats.total}
          change="+12% from last month"
          icon={Users}
        />
        <StatCard
          title="Shortlisted"
          value={stats.shortlisted}
          change="+8% from last month"
          icon={CheckCircle}
        />
        <StatCard
          title="Selected"
          value={stats.selected}
          change="+15% from last month"
          icon={Send}
        />
      </div>

      {/* Two Charts Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doughnut Chart - Distribution */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Candidate Distribution
          </h2>
          <div className="w-full max-w-[280px] mx-auto">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
          {stats.selected > 0 && (
            <button
              onClick={() => setShowOffers(!showOffers)}
              className="mt-4 w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black text-sm"
            >
              {showOffers ? "Hide Selected" : "Show Selected"}
            </button>
          )}
        </div>

        {/* Bar Chart - Percentages */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Selection Percentages
          </h2>
          <div className="w-full max-w-[320px] mx-auto">
            <Bar data={barData} options={barOptions} />
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              Shortlisted:{" "}
              <span className="font-semibold">{shortlistedPercentage}%</span>
            </p>
            <p>
              Selected:{" "}
              <span className="font-semibold">{selectedPercentage}%</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon }) {
  return (
    <div className="bg-white rounded-lg border p-4 flex items-center gap-4 shadow-sm">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
        <Icon className="w-6 h-6 text-gray-700" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{change}</p>
      </div>
    </div>
  );
}
