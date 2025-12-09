import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Play, User, FileText, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { getMockInterviewPrompt } from "../Prompts/MockInterviewPrompt";

const BASE_URL = import.meta.env.VITE_BASE_URL;
import { useParams } from "react-router-dom";

const InterviewStartPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { driveId } = useParams();
  const drive_candidate_id = driveId;

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
      const prompt = getMockInterviewPrompt(userData.resume_content);

      // Navigate to /mockinterview/:id and pass state
      navigate(`/mockinterview/${drive_candidate_id}`, {
        state: { userData: userData, prompt },
      });
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border-2 border-black rounded-lg p-6 mb-6"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black mb-2">AI Interview</h1>
            <p className="text-gray-700">AI-powered interview simulation</p>
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white border-2 border-black rounded-lg p-8 text-center"
          >
            <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-medium text-black mb-2">
              Loading candidate data...
            </h2>
            <p className="text-gray-700">
              Please wait while we fetch your information
            </p>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white border-2 border-red-500 rounded-lg p-8 text-center"
          >
            <div className="w-12 h-12 bg-red-50 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-medium text-black mb-2">
              Failed to load candidate data
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors border-2 border-red-700"
            >
              Try Again
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
            <div className="bg-white border-2 border-black rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-black" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-black mb-1">
                    {userData.name || "Candidate"}
                  </h2>
                  <p className="text-gray-700 mb-3">{userData.email}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 p-2 border border-gray-300 rounded">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        Resume:{" "}
                        {userData.resume_content ? "Loaded" : "Not available"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-2 border border-gray-300 rounded">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        Created:{" "}
                        {userData.created_at
                          ? new Date(userData.created_at).toLocaleDateString()
                          : "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-2 border border-green-500 bg-green-50 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700 font-medium">
                        Ready for interview
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Start Interview Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white border-2 border-black rounded-lg p-8 text-center"
            >
              <h3 className="text-xl font-semibold text-black mb-4">
                Ready to Start Your Interview?
              </h3>
              <motion.button
                onClick={handleStartInterview}
                disabled={!userData.resume_content}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-8 py-4 rounded-lg font-semibold flex items-center gap-3 mx-auto transition-all border-2 ${
                  userData.resume_content
                    ? "bg-green-600 hover:bg-green-700 text-white border-green-700 shadow-lg hover:shadow-xl"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-400"
                }`}
              >
                <Play className="w-6 h-6" />
                Start Interview
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InterviewStartPage;
