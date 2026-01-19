import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Code, TrendingUp, Clock, Target, Home } from "lucide-react";
import { useEffect, useState } from "react";

export default function AssessmentSubmission() {
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // 1. Extract data from router state
  const { statistics, candidateId, driveId, timeTaken } = location.state || {};

  useEffect(() => {
    const fetchFinalStats = async () => {
      // If statistics were passed directly from the final-submit call, use them immediately
      if (statistics) {
        setStats(statistics);
        setLoading(false);
        return;
      }

      // Fallback: If page is refreshed, fetch stats from the backend using IDs
      try {
        if (candidateId && driveId) {
          const response = await fetch(
            `${BASE_URL}/api/coding-assessment/submission/statistics?candidate_id=${candidateId}&drive_id=${driveId}`
          );
          if (response.ok) {
            const data = await response.json();
            // Your backend returns { statistics: { ... } }
            setStats(data.statistics);
          }
        } else {
          // No data found at all, redirect to home
          navigate("/");
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinalStats();
  }, [candidateId, driveId, statistics, navigate, BASE_URL]);

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: darkMode ? "#0d0d0d" : "#ffffff" }}>
        <p style={{ color: darkMode ? "#fff" : "#000" }}>Calculating results...</p>
      </div>
    );
  }

  // 2. Map data based on your specific JSON response
  const totalProblems = stats?.total_questions || 0;
  const attemptedProblems = stats?.question_breakdown?.length || 0;
  const solvedProblems = stats?.questions_solved || 0;
  const totalTime = stats?.total_time_taken || timeTaken || 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const bgColor = darkMode ? "#0d0d0d" : "#ffffff";
  const textColor = darkMode ? "#e0e0e0" : "#000000";
  const cardBg = darkMode ? "#1a1a1a" : "#fafafa";
  const borderColor = darkMode ? "#2a2a2a" : "#e5e5e5";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ maxWidth: "900px", width: "100%" }}>
        {/* Success Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: "#f0fdf4",
              marginBottom: "32px",
            }}
          >
            <CheckCircle size={60} color="#16a34a" strokeWidth={2.5} />
          </div>
          <h1 style={{ margin: "0 0 16px 0", fontSize: "36px", fontWeight: "800" }}>
            Assessment Submitted!
          </h1>
          <p style={{ fontSize: "18px", color: "#666", lineHeight: "1.6" }}>
            Great job! Your coding assessment has been successfully recorded and is under review.
          </p>
        </div>

        {/* Statistics Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "24px",
            marginBottom: "48px",
          }}
        >
          <StatCard 
            icon={<Code size={32} />} 
            label="TOTAL PROBLEMS" 
            value={totalProblems} 
            bg={cardBg} 
            border={borderColor} 
          />

          <StatCard 
            icon={<TrendingUp size={32} color="#d97706" />} 
            label="ATTEMPTED" 
            value={attemptedProblems} 
            bg={cardBg} 
            border={borderColor} 
          />

          <StatCard 
            icon={<Target size={32} color="#16a34a" />} 
            label="FULLY SOLVED" 
            value={solvedProblems} 
            bg={cardBg} 
            border={borderColor} 
          />

          <StatCard 
            icon={<Clock size={32} color="#0284c7" />} 
            label="TIME TAKEN" 
            value={formatTime(totalTime)} 
            bg={cardBg} 
            border={borderColor} 
          />
        </div>

        {/* Message Card */}
        <div
          style={{
            padding: "32px",
            backgroundColor: cardBg,
            borderRadius: "16px",
            border: `1px solid ${borderColor}`,
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          <h2 style={{ marginBottom: "16px", fontSize: "22px", fontWeight: "700" }}>
            What happens next?
          </h2>
          <p style={{ color: "#666", lineHeight: "1.8", margin: 0 }}>
            Your solution is being evaluated against our internal benchmarks. You will receive 
            an automated feedback report and next-step instructions via email shortly.
          </p>
        </div>

        {/* Home Button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "16px 40px",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <Home size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable StatCard Component
function StatCard({ icon, label, value, bg, border }) {
  return (
    <div
      style={{
        padding: "32px 24px",
        backgroundColor: bg,
        borderRadius: "16px",
        border: `1px solid ${border}`,
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
        {icon}
      </div>
      <div
        style={{
          fontSize: "12px",
          fontWeight: "700",
          color: "#888",
          letterSpacing: "1.5px",
          marginBottom: "8px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "40px", fontWeight: "800", lineHeight: "1" }}>
        {value}
      </div>
    </div>
  );
}