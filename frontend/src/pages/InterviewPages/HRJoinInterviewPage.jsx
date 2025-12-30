import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Users,
  User,
  FileText,
  Calendar,
  CheckCircle,
  Info,
  Briefcase,
  Clock,
  Mail,
  Phone,
  Video,
  Shield,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const HRJoinInterviewPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const driveCandidateId = params.driveCandidateId;
  const interviewType = params.interviewType;

  const [candidateData, setCandidateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hrName, setHrName] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Fetch candidate data
  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${BASE_URL}/api/interview/candidate/${driveCandidateId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch candidate data: ${response.status}`);
        }

        const data = await response.json();
        setCandidateData(data);
        console.log("✅ Fetched candidate data:", data);
      } catch (error) {
        console.error("❌ Error fetching candidate data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidateData();
  }, [driveCandidateId]);

  // Function to get LiveKit token from backend
  const getLiveKitToken = async (identity) => {
    console.log("🔑 Requesting LiveKit token for HR:", identity);

    const response = await fetch(
      `${BASE_URL}/api/livekit/token?driveCandidateId=${driveCandidateId}&type=${interviewType}&role=hr&identity=${identity}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch LiveKit token");
    }

    const data = await response.json();
    console.log("✅ Received LiveKit token:", {
      roomName: data.roomName,
      identity: data.identity,
    });

    return {
      token: data.token,
      roomName: data.roomName,
      livekitUrl: data.livekitUrl,
      identity: data.identity,
    };
  };

  // Handle join interview
  const handleJoinInterview = async () => {
    if (!hrName.trim()) {
      alert("Please enter your name before joining");
      return;
    }

    try {
      setIsJoining(true);

      // Create identity from HR name (clean it for use as identity)
      const identity = `hr_${hrName.replace(/\s+/g, "_").toLowerCase()}`;
      console.log("👤 HR joining as:", identity);

      // 1️⃣ Get LiveKit token
      const livekitData = await getLiveKitToken(identity);

      // 2️⃣ Navigate to interview room with all necessary state
      console.log("🚀 Navigating to interview room");
      navigate(`/mockinterview/${driveCandidateId}`, {
        state: {
          // Role identification
          isHR: true,
          hrName,

          // LiveKit connection data
          livekitToken: livekitData.token,
          roomName: livekitData.roomName,
          livekitUrl: livekitData.livekitUrl,
          identity: livekitData.identity,

          // Interview context
          interviewType,
          candidateData,
          userData: candidateData?.candidate_info,
        },
      });
    } catch (error) {
      console.error("❌ Error joining interview:", error);
      alert(
        `Unable to join interview: ${error.message}\n\nPlease try again or contact support.`
      );
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-2xl p-12 text-center border-3 border-gray-900 max-w-md"
        >
          <div className="w-20 h-20 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Loading Interview Session
          </h2>
          <p className="text-gray-600 font-medium">
            Preparing candidate information...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-2xl p-12 text-center border-3 border-red-500 max-w-md"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Unable to Load Interview
          </h2>
          <p className="text-red-600 mb-6 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Retry Loading
          </button>
        </motion.div>
      </div>
    );
  }

  if (!candidateData) {
    return null;
  }

  const candidate = candidateData.candidate_info;
  const roundsStatus = candidateData.rounds_status || [];
  const currentRound = roundsStatus.find(
    (round) => round.round_type?.toLowerCase() === interviewType?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-6 shadow-2xl border-4 border-white">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            HR Interview Panel
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Join as an interviewer to observe and participate in the AI-powered
            interview
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Candidate Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Details Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-xl p-8 border-3 border-gray-900"
            >
              <div className="flex items-start gap-6 mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {candidate.name || "Candidate"}
                      </h2>
                      <p className="text-gray-600 font-medium text-lg">
                        Candidate Interview Details
                      </p>
                    </div>
                    <div className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg">
                      {interviewType?.toUpperCase() || "GENERAL"} ROUND
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {candidate.email && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                            Email
                          </p>
                          <p className="text-sm text-gray-900 font-medium break-all">
                            {candidate.email}
                          </p>
                        </div>
                      </div>
                    )}

                    {candidate.phone && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                            Phone
                          </p>
                          <p className="text-sm text-gray-900 font-medium">
                            {candidate.phone}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                          Resume
                        </p>
                        <p className="text-sm text-gray-900 font-bold">
                          {candidate.resume_content
                            ? "✓ Available"
                            : "Not uploaded"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                          Applied On
                        </p>
                        <p className="text-sm text-gray-900 font-medium">
                          {candidate.created_at
                            ? new Date(
                                candidate.created_at
                              ).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interview Status */}
              {currentRound && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-bold text-blue-900">
                        Interview Status
                      </p>
                      <p className="text-xs text-blue-700 font-medium mt-1">
                        {currentRound.completed === "yes"
                          ? "✓ This round has been completed"
                          : "⏳ This round is pending or in progress"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* HR Instructions */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8 border-3 border-gray-900"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <Info className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    HR Panel Guidelines
                  </h3>
                  <p className="text-gray-600 font-medium">
                    Important information for interviewers
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Observe AI Interview
                    </h4>
                    <p className="text-sm text-gray-600 font-medium">
                      Watch how the AI conducts the interview. You can see the
                      candidate's responses and the questions being asked in
                      real-time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Raise Hand to Intervene
                    </h4>
                    <p className="text-sm text-gray-600 font-medium">
                      Click the "Raise Hand" button when you want to pause the
                      AI and ask your own questions directly to the candidate.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Full Transcript Available
                    </h4>
                    <p className="text-sm text-gray-600 font-medium">
                      All conversations (AI, Candidate, and HR) are transcribed
                      and will be included in the final evaluation report.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Professional Environment
                    </h4>
                    <p className="text-sm text-gray-600 font-medium">
                      Ensure you're in a quiet space with good lighting. Your
                      video and audio will be visible to the candidate.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Join Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-2xl p-8 border-4 border-white sticky top-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Join Interview Panel
                </h3>
                <p className="text-indigo-100 font-medium">
                  Enter your details to join as an interviewer
                </p>
              </div>

              <div className="space-y-6">
                {/* HR Name Input */}
                <div>
                  <label className="block text-white font-bold mb-3 text-sm uppercase tracking-wide">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={hrName}
                    onChange={(e) => setHrName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-5 py-4 bg-white border-3 border-indigo-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-white/50 text-gray-900 font-semibold placeholder-gray-400 text-lg"
                    required
                    disabled={isJoining}
                  />
                </div>

                {/* Interview Details */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Briefcase className="w-5 h-5 text-white" />
                    <span className="text-white font-bold text-sm">
                      Interview Details
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-indigo-100 font-medium">
                        Candidate:
                      </span>
                      <span className="text-white font-bold">
                        {candidate.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-indigo-100 font-medium">Type:</span>
                      <span className="text-white font-bold uppercase">
                        {interviewType || "General"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-indigo-100 font-medium">
                        Status:
                      </span>
                      <span className="text-green-300 font-bold">● Live</span>
                    </div>
                  </div>
                </div>

                {/* Join Button */}
                <button
                  onClick={handleJoinInterview}
                  disabled={!hrName.trim() || isJoining}
                  className={`w-full py-5 rounded-xl font-bold text-lg transition-all transform shadow-2xl flex items-center justify-center gap-3 ${
                    hrName.trim() && !isJoining
                      ? "bg-white text-indigo-700 hover:bg-indigo-50 hover:scale-105 border-3 border-indigo-800"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed border-3 border-gray-400"
                  }`}
                >
                  {isJoining ? (
                    <>
                      <div className="w-6 h-6 border-3 border-gray-400 border-t-indigo-600 rounded-full animate-spin"></div>
                      Joining...
                    </>
                  ) : (
                    <>
                      <Video className="w-6 h-6" />
                      Join Interview Now
                      <ArrowRight className="w-6 h-6" />
                    </>
                  )}
                </button>

                {!hrName.trim() && !isJoining && (
                  <p className="text-center text-indigo-100 text-sm font-medium">
                    Please enter your name to join
                  </p>
                )}
              </div>

              {/* Quick Info */}
              <div className="mt-6 pt-6 border-t-2 border-white/20">
                <div className="flex items-center gap-2 text-white/80 text-xs">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    You can join and leave the interview at any time
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 bg-white rounded-2xl shadow-lg p-6 border-3 border-gray-900"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">
                Hybrid AI-HR Interview System
              </h4>
              <p className="text-gray-600 font-medium text-sm">
                This system allows the AI to conduct the primary interview while
                giving HR the flexibility to observe, intervene, and ask
                additional questions as needed. All interactions are recorded
                and will be part of the candidate's comprehensive evaluation.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HRJoinInterviewPage;
