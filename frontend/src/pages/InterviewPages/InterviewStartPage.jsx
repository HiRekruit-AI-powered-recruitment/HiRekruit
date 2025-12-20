import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  User,
  FileText,
  Calendar,
  CheckCircle,
  Info,
  Mic,
  Video,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { getMockInterviewPrompt } from "../../Prompts/MockInterviewPrompt";

const BASE_URL = import.meta.env.VITE_BASE_URL;
import { useParams } from "react-router-dom";

const InterviewStartPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract params robustly: route may provide different param names
  const params = useParams();
  const drive_candidate_id = params.driveCandidateId;
  const interviewType = params.typeOfInterview;

  // Fetch candidate data
  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${BASE_URL}/api/interview/candidate/${drive_candidate_id}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch candidate data: ${response.status}`);
        }

        const data = await response.json();
        setUserData(data.candidate_info);
        console.log("Fetched candidate data:", data);
      } catch (error) {
        console.error("Error fetching candidate data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidateData();
  }, [drive_candidate_id]);

  // Handle start interview and navigate
  const handleStartInterview = () => {
    if (userData && userData.resume_content) {
      // Choose prompt according to interview type (e.g., hr, technical, systemdesign, coding)
      const prompt = getMockInterviewPrompt(
        userData.resume_content,
        interviewType
      );

      // console.log("Prompt for the interview :", prompt);

      // Navigate to /mockinterview/:id and pass state, include interviewType
      navigate(`/mockinterview/${drive_candidate_id}`, {
        state: { userData: userData, prompt, interviewType },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            AI-Powered Hiring Interview
          </h1>
          <p className="text-lg text-gray-600">
            An AI-enabled interview session conducted via the HiRekruit
            recruitment platform.
          </p>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200"
          >
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Loading Your Interview Session
            </h2>
            <p className="text-gray-600">
              Please wait while we prepare everything for you...
            </p>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-red-300"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Unable to Load Interview Data
            </h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-md"
            >
              Retry Loading
            </button>
          </motion.div>
        )}

        {/* Candidate Info & Start */}
        {!isLoading && !error && userData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Candidate Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {userData.name || "Candidate"}
                  </h2>
                  <p className="text-gray-600 mb-4">{userData.email}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Resume
                        </p>
                        <p className="text-sm text-gray-900 font-semibold">
                          {userData.resume_content
                            ? "✓ Loaded"
                            : "Not available"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Created
                        </p>
                        <p className="text-sm text-gray-900 font-semibold">
                          {userData.created_at
                            ? new Date(userData.created_at).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-300">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-green-600 font-medium">
                          Status
                        </p>
                        <p className="text-sm text-green-700 font-bold">
                          Ready
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interview Type Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full border border-blue-300">
                <Info className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  Interview Type: {interviewType?.toUpperCase() || "GENERAL"}
                </span>
              </div>
            </div>

            {/* Instructions Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Before You Begin
                  </h3>
                  <p className="text-gray-600">
                    Please review the following instructions to ensure a smooth
                    interview experience
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Time Management
                    </h4>
                    <p className="text-sm text-gray-600">
                      Take your time to think before answering. Quality matters
                      more than speed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mic className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Clear Communication
                    </h4>
                    <p className="text-sm text-gray-600">
                      Speak clearly and ensure your microphone is working
                      properly before starting.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Video className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Quiet Environment
                    </h4>
                    <p className="text-sm text-gray-600">
                      Find a quiet space with good lighting to minimize
                      distractions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Be Yourself
                    </h4>
                    <p className="text-sm text-gray-600">
                      Answer honestly and showcase your genuine skills and
                      experiences.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900 flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Important:</strong> This is an official interview
                    conducted using AI as part of the hiring process. The
                    session includes video and voice interaction, and both
                    verbal responses and non-verbal cues such as body language,
                    facial expressions, and overall conduct may be assessed.
                    Please maintain a professional posture, minimize
                    distractions, and treat this interview with the same
                    seriousness as a live, in-person interview.
                  </span>
                </p>
              </div>
            </div>

            {/* Start Interview Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-10 text-center border-2 border-green-200"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Ready to Begin Your Interview?
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                When you are ready, click the button below to initiate your
                interview session. Please note that it may take a few moments to
                connect you to your assigned panel. Ensure you have carefully
                reviewed all instructions above before proceeding.
              </p>
              <motion.button
                onClick={handleStartInterview}
                disabled={!userData.resume_content}
                whileHover={{ scale: userData.resume_content ? 1.03 : 1 }}
                whileTap={{ scale: userData.resume_content ? 0.97 : 1 }}
                className={`px-10 py-4 rounded-lg font-bold text-lg flex items-center gap-3 mx-auto transition-all shadow-lg ${
                  userData.resume_content
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-green-200 hover:shadow-xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-gray-200"
                }`}
              >
                <Play className="w-6 h-6" fill="currentColor" />
                Start Interview Now
              </motion.button>
              {!userData.resume_content && (
                <p className="text-red-600 text-sm mt-4">
                  Resume data is required to start the interview
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InterviewStartPage;
