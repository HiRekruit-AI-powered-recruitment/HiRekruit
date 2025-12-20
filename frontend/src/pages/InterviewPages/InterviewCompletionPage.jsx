import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  Mail,
  Phone,
  ArrowLeft,
  Home,
  FileText,
  Calendar,
  Star,
  AlertCircle,
  MessageSquare,
  Send,
} from "lucide-react";

import Loader from "../../components/Loader";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const InterviewCompletionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    userData,
    driveCandidateId,
    resumeText,
    conversation,
    interviewType,
  } = location.state || {};

  // Log initial props once
  useEffect(() => {
    console.debug("InterviewCompletionPage initial data:", {
      userData,
      driveCandidateId,
      interviewType,
    });
  }, []);

  // Use ref for completion time to avoid re-renders
  const completionTimeRef = useRef(new Date());
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationComplete, setEvaluationComplete] = useState(false);
  const [evaluationError, setEvaluationError] = useState(null);
  const [alreadyEvaluated, setAlreadyEvaluated] = useState(false);
  const [candidateData, setCandidateData] = useState(null);

  // Feedback form states
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    overall_experience: 5,
    interview_difficulty: 3,
    technical_relevance: 5,
    interviewer_behavior: 5,
    platform_usability: 5,
    would_recommend: "yes",
    improvements: "",
    additional_comments: "",
  });

  // Check if interview is already evaluated
  useEffect(() => {
    const checkEvaluationStatus = async () => {
      if (!driveCandidateId || !interviewType) {
        console.warn("Missing driveCandidateId or interviewType");
        return;
      }

      try {
        const response = await fetch(
          `${BASE_URL}/api/interview/candidate/${driveCandidateId}`
        );

        if (response.ok) {
          const data = await response.json();
          setCandidateData(data);

          // Find the round matching the interview type
          const currentRound = data.rounds_status?.find(
            (round) =>
              round.round_type.toLowerCase() === interviewType.toLowerCase()
          );

          if (currentRound && currentRound.completed === "yes") {
            setAlreadyEvaluated(true);
            setEvaluationComplete(true);
            // Show feedback form after a short delay, but don't scroll on page refresh
            setTimeout(() => {
              setShowFeedbackForm(true);
            }, 2000);
          }
        } else {
          console.error("Failed to fetch candidate data:", response.status);
        }
      } catch (error) {
        console.error("Error checking evaluation status:", error);
      }
    };

    checkEvaluationStatus();
  }, [driveCandidateId, interviewType]);

  // Call evaluation API when component mounts (only if not already evaluated)
  useEffect(() => {
    const evaluateInterview = async () => {
      if (alreadyEvaluated) {
        return;
      }

      if (!conversation || !resumeText || conversation.length === 0) {
        console.warn("No conversation data available for evaluation");
        setEvaluationError("No interview data available for evaluation");
        return;
      }

      setIsEvaluating(true);
      setEvaluationError(null);

      try {
        const response = await fetch(`${BASE_URL}/api/interview/evaluate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeText,
            transcript: conversation,
            driveCandidateId,
            userData,
            interviewType: interviewType || "general",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setEvaluationComplete(true);
          // Show feedback form after evaluation completes
          setTimeout(() => {
            setShowFeedbackForm(true);
          }, 2000);
        } else {
          const errorText = await response.text();
          console.error("❌ Evaluation failed:", response.status, errorText);
          setEvaluationError(
            `Evaluation failed: ${response.status} - ${errorText}`
          );
        }
      } catch (error) {
        console.error("❌ Evaluation error:", error);
        setEvaluationError(`Network error: ${error.message}`);
      } finally {
        setIsEvaluating(false);
      }
    };

    const timer = setTimeout(() => {
      evaluateInterview();
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    conversation,
    resumeText,
    driveCandidateId,
    userData,
    interviewType,
    alreadyEvaluated,
  ]);

  // Format date and time - use ref to prevent re-renders
  const formatDateTime = (date) => {
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // If no user data, redirect to home
  useEffect(() => {
    if (!userData) {
      console.warn("No user data available, redirecting to home");
      navigate("/");
    }
  }, [userData, navigate]);

  // Handle feedback form input changes - memoize to prevent re-renders
  const handleFeedbackChange = useCallback((field, value) => {
    setFeedbackData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Submit feedback - memoize to prevent re-renders
  const handleFeedbackSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFeedbackSubmitting(true);
      console.log("handle submit feedback form called");
      try {
        const response = await fetch(
          `${BASE_URL}/api/interview-feedback/submit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              drive_candidate_id: driveCandidateId,
              interview_type: interviewType,
              candidate_email: userData.email,
              candidate_name: userData.name,
              ...feedbackData,
            }),
          }
        );

        if (response.ok) {
          setFeedbackSubmitted(true);
          setTimeout(() => setShowFeedbackForm(false), 3000);
        } else {
          console.error("Failed to submit feedback:", response.status);
          alert("Failed to submit feedback. Please try again.");
        }
      } catch (error) {
        console.error("Error submitting feedback:", error);
        alert("Error submitting feedback. Please try again.");
      } finally {
        setFeedbackSubmitting(false);
      }
    },
    [driveCandidateId, interviewType, userData, feedbackData]
  );

  if (!userData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-black">Loading...</p>
        </div>
      </div>
    );
  }

  // Evaluation Status Component
  const EvaluationStatus = () => {
    if (alreadyEvaluated) {
      return (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="font-medium text-green-900">
                Interview Already Evaluated
              </h3>
              <p className="text-sm text-green-700">
                Your interview has already been evaluated. We'll contact you
                soon with the results.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (isEvaluating) {
      return (
        <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Loader className="w-5 h-5 text-blue-600 animate-spin" />
            <div>
              <h3 className="font-medium text-blue-900">
                We will Evaluate Your Interview and get back to you soon!
              </h3>
            </div>
          </div>
        </div>
      );
    }

    if (evaluationError) {
      return (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-medium text-red-900">Evaluation Error</h3>
              <p className="text-sm text-red-700">{evaluationError}</p>
              <p className="text-xs text-red-600 mt-1">
                Don't worry - your interview has been saved and our team will
                review it manually.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (evaluationComplete) {
      return (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="font-medium text-green-900">
                Evaluation Complete!
              </h3>
              <p className="text-sm text-green-700">
                Your interview has been successfully evaluated. We'll contact
                you soon.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Feedback Form Component
  const FeedbackForm = () => {
    if (!showFeedbackForm) return null;

    if (feedbackSubmitted) {
      return (
        <div className="bg-white border-2 border-green-500 rounded-xl p-8 mb-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-900 mb-2">
              Thank You for Your Feedback!
            </h3>
            <p className="text-green-700">
              Your feedback helps us improve our interview process.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border-2 border-black rounded-xl p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-black" />
          <h2 className="text-2xl font-bold text-black">Interview Feedback</h2>
        </div>

        <p className="text-gray-700 mb-6">
          We'd love to hear about your interview experience. Your feedback helps
          us improve!
        </p>

        <form onSubmit={handleFeedbackSubmit} className="space-y-6">
          {/* Overall Experience */}
          <div>
            <div className="block text-sm font-medium text-black mb-2">
              Overall Experience *
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    handleFeedbackChange("overall_experience", rating)
                  }
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg border-2 transition-all ${
                    feedbackData.overall_experience === rating
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      feedbackData.overall_experience >= rating
                        ? "fill-current"
                        : ""
                    }`}
                  />
                  <span>{rating}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              1 = Poor, 5 = Excellent
            </p>
          </div>

          {/* Interview Difficulty */}
          <div>
            <div className="block text-sm font-medium text-black mb-2">
              Interview Difficulty *
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { value: 1, label: "Very Easy" },
                { value: 2, label: "Easy" },
                { value: 3, label: "Moderate" },
                { value: 4, label: "Hard" },
                { value: 5, label: "Very Hard" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    handleFeedbackChange("interview_difficulty", option.value)
                  }
                  className={`px-4 py-2 rounded-lg border-2 transition-all flex-1 min-w-[100px] ${
                    feedbackData.interview_difficulty === option.value
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Technical Relevance */}
          <div>
            <div className="block text-sm font-medium text-black mb-2">
              Technical Relevance (Questions matched your skills) *
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    handleFeedbackChange("technical_relevance", rating)
                  }
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg border-2 transition-all ${
                    feedbackData.technical_relevance === rating
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      feedbackData.technical_relevance >= rating
                        ? "fill-current"
                        : ""
                    }`}
                  />
                  <span>{rating}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interviewer Behavior */}
          <div>
            <div className="block text-sm font-medium text-black mb-2">
              AI Interviewer Behavior *
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    handleFeedbackChange("interviewer_behavior", rating)
                  }
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg border-2 transition-all ${
                    feedbackData.interviewer_behavior === rating
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      feedbackData.interviewer_behavior >= rating
                        ? "fill-current"
                        : ""
                    }`}
                  />
                  <span>{rating}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Platform Usability */}
          <div>
            <div className="block text-sm font-medium text-black mb-2">
              Platform Usability *
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    handleFeedbackChange("platform_usability", rating)
                  }
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg border-2 transition-all ${
                    feedbackData.platform_usability === rating
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      feedbackData.platform_usability >= rating
                        ? "fill-current"
                        : ""
                    }`}
                  />
                  <span>{rating}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Would Recommend */}
          <div>
            <div className="block text-sm font-medium text-black mb-2">
              Would you recommend this interview platform to others? *
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { value: "yes", label: "Yes, definitely" },
                { value: "maybe", label: "Maybe" },
                { value: "no", label: "No" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    handleFeedbackChange("would_recommend", option.value)
                  }
                  className={`px-6 py-2 rounded-lg border-2 transition-all flex-1 min-w-[120px] ${
                    feedbackData.would_recommend === option.value
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Improvements */}
          <div>
            <label
              htmlFor="improvements"
              className="block text-sm font-medium text-black mb-2"
            >
              What could we improve? *
            </label>
            <textarea
              id="improvements"
              value={feedbackData.improvements}
              onChange={(e) =>
                handleFeedbackChange("improvements", e.target.value)
              }
              placeholder="Share your suggestions for improvement..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none resize-none"
              rows="4"
              required
            />
          </div>

          {/* Additional Comments */}
          <div>
            <label
              htmlFor="additional-comments"
              className="block text-sm font-medium text-black mb-2"
            >
              Additional Comments (Optional)
            </label>
            <textarea
              id="additional-comments"
              value={feedbackData.additional_comments}
              onChange={(e) =>
                handleFeedbackChange("additional_comments", e.target.value)
              }
              placeholder="Any other feedback you'd like to share..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none resize-none"
              rows="3"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={feedbackSubmitting || !feedbackData.improvements.trim()}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {feedbackSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Feedback
              </>
            )}
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white border-4 border-black rounded-full mb-6">
            {isEvaluating ? (
              <Loader className="w-10 h-10 text-black animate-spin" />
            ) : evaluationComplete || alreadyEvaluated ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <CheckCircle className="w-10 h-10 text-black" />
            )}
          </div>

          <h1 className="text-3xl font-bold text-black mb-2">
            {isEvaluating
              ? "Processing Your Interview"
              : "Interview Completed Successfully!"}
          </h1>

          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            {isEvaluating
              ? "Please wait while we analyze your interview responses and prepare your evaluation."
              : "Thank you for taking the time to complete your interview. Your responses have been recorded and evaluated."}
          </p>
        </div>

        {/* Evaluation Status */}
        <EvaluationStatus />

        {/* Main Card */}
        <div className="bg-white border-2 border-black rounded-xl p-8 mb-6">
          {/* Candidate Information */}
          <div className="border-b-2 border-gray-300 pb-6 mb-6">
            <h2 className="text-xl font-semibold text-black mb-4">
              Interview Summary
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border-2 border-black rounded-lg">
                  <div className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center">
                    <span className="text-black font-semibold text-lg">
                      {userData.name
                        ? userData.name.charAt(0).toUpperCase()
                        : "C"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-black">
                      {userData.name || "Candidate"}
                    </p>
                    <p className="text-sm text-gray-600">Interviewee</p>
                  </div>
                </div>

                {userData.email && (
                  <div className="flex items-center gap-3 text-gray-700 p-3 border border-gray-300 rounded-lg">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{userData.email}</span>
                  </div>
                )}

                {userData.phone && (
                  <div className="flex items-center gap-3 text-gray-700 p-3 border border-gray-300 rounded-lg">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{userData.phone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700 p-3 border border-gray-300 rounded-lg">
                  <Calendar className="w-4 h-4" />
                  <div>
                    <p className="text-sm font-medium">Interview Completed</p>
                    <p className="text-xs text-gray-600">
                      {formatDateTime(completionTimeRef.current)}
                    </p>
                  </div>
                </div>

                {driveCandidateId && (
                  <div className="flex items-center gap-3 text-gray-700 p-3 border border-gray-300 rounded-lg">
                    <FileText className="w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium">Application ID</p>
                      <p className="text-xs text-gray-600 font-mono">
                        {driveCandidateId}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-gray-700 p-3 border-2 border-green-500 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-700">
                      Status: Submitted
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-black mb-3">
              Questions or Concerns?
            </h3>
            <p className="text-gray-700 mb-4">
              If you have any questions about your interview or the hiring
              process, please don't hesitate to reach out to our HR team.
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700 px-3 py-2 border border-gray-300 rounded-lg">
                <Mail className="w-4 h-4" />
                <span>hirekruit@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 px-3 py-2 border border-gray-300 rounded-lg">
                <Phone className="w-4 h-4" />
                <span>+91 6202908328</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <FeedbackForm />

        {/* Footer Message */}
        <div className="text-center mt-8 pt-6 border-t-2 border-gray-300">
          <p className="text-gray-600 text-sm">
            {isEvaluating
              ? "Please wait while we process your interview. Do not close this page."
              : "Thank you for your interest in joining our team. We appreciate the time you've invested in this process."}
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Interview completed at {formatDateTime(completionTimeRef.current)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewCompletionPage;
