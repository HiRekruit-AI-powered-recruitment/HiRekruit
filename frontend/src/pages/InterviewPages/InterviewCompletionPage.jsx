import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Mail,
  Phone,
  FileText,
  Calendar,
  Star,
  AlertCircle,
  MessageSquare,
  Send,
  Home,
  Sparkles,
  Award,
  Clock,
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

  // Ref to track if we should scroll to feedback form
  const shouldScrollToFeedback = useRef(false);
  const feedbackFormRef = useRef(null);
  const hasScrolledToFeedback = useRef(false);

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
            // Show feedback form after a short delay
            setTimeout(() => {
              shouldScrollToFeedback.current = true;
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

  // Scroll to feedback form only when it first appears
  useEffect(() => {
    if (
      showFeedbackForm &&
      shouldScrollToFeedback.current &&
      !hasScrolledToFeedback.current &&
      feedbackFormRef.current
    ) {
      setTimeout(() => {
        feedbackFormRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        hasScrolledToFeedback.current = true;
        shouldScrollToFeedback.current = false;
      }, 300);
    }
  }, [showFeedbackForm]);

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
            shouldScrollToFeedback.current = true;
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

  // Format date and time
  const formatDateTime = useCallback((date) => {
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // If no user data, redirect to home
  useEffect(() => {
    if (!userData) {
      console.warn("No user data available, redirecting to home");
      navigate("/");
    }
  }, [userData, navigate]);

  // Handle feedback form input changes - properly memoized
  const handleFeedbackChange = useCallback((field, value) => {
    setFeedbackData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Submit feedback - properly memoized
  const handleFeedbackSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFeedbackSubmitting(true);
      console.log("Submitting feedback form");

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-spin" />
          <p className="text-lg text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Evaluation Status Component
  const EvaluationStatus = () => {
    if (alreadyEvaluated) {
      return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-3 border-green-500 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-900 mb-1">
                Interview Already Evaluated
              </h3>
              <p className="text-green-700 font-medium">
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-3 border-blue-500 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Loader className="w-7 h-7 text-white animate-spin" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-900 mb-1">
                Evaluating Your Interview
              </h3>
              <p className="text-blue-700 font-medium">
                Our AI is analyzing your responses. This will take just a
                moment...
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (evaluationError) {
      return (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-3 border-red-500 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <AlertCircle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-900 mb-1">
                Evaluation Error
              </h3>
              <p className="text-red-700 font-medium mb-2">{evaluationError}</p>
              <p className="text-sm text-red-600">
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
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-3 border-green-500 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-900 mb-1">
                Evaluation Complete! 🎉
              </h3>
              <p className="text-green-700 font-medium">
                Your interview has been successfully evaluated. We'll contact
                you soon with results.
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
        <div
          ref={feedbackFormRef}
          className="bg-gradient-to-br from-green-50 to-emerald-50 border-3 border-green-500 rounded-2xl p-10 mb-6 shadow-xl"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-green-900 mb-3">
              Thank You for Your Feedback! 🙏
            </h3>
            <p className="text-lg text-green-700 font-medium">
              Your feedback helps us improve our interview process.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={feedbackFormRef}
        className="bg-white border-3 border-gray-900 rounded-2xl p-8 mb-6 shadow-xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Interview Feedback
            </h2>
            <p className="text-gray-600 font-medium">
              Help us improve your experience
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4 mb-6">
          <p className="text-gray-700 font-medium flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            We'd love to hear about your interview experience. Your feedback
            helps us improve!
          </p>
        </div>

        <form onSubmit={handleFeedbackSubmit} className="space-y-8">
          {/* Overall Experience */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-3">
              Overall Experience *
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    handleFeedbackChange("overall_experience", rating)
                  }
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl border-3 transition-all transform hover:scale-105 ${
                    feedbackData.overall_experience === rating
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-lg"
                      : "border-gray-300 hover:border-gray-400 bg-white"
                  }`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      feedbackData.overall_experience >= rating
                        ? "fill-current"
                        : ""
                    }`}
                  />
                  <span className="font-semibold">{rating}</span>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              1 = Poor, 5 = Excellent
            </p>
          </div>

          {/* Interview Difficulty */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-3">
              Interview Difficulty *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                  className={`px-4 py-3 rounded-xl border-3 transition-all transform hover:scale-105 font-semibold ${
                    feedbackData.interview_difficulty === option.value
                      ? "border-purple-600 bg-purple-600 text-white shadow-lg"
                      : "border-gray-300 hover:border-gray-400 bg-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Technical Relevance */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-3">
              Technical Relevance (Questions matched your skills) *
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    handleFeedbackChange("technical_relevance", rating)
                  }
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl border-3 transition-all transform hover:scale-105 ${
                    feedbackData.technical_relevance === rating
                      ? "border-blue-600 bg-blue-600 text-white shadow-lg"
                      : "border-gray-300 hover:border-gray-400 bg-white"
                  }`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      feedbackData.technical_relevance >= rating
                        ? "fill-current"
                        : ""
                    }`}
                  />
                  <span className="font-semibold">{rating}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interviewer Behavior */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-3">
              AI Interviewer Behavior *
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    handleFeedbackChange("interviewer_behavior", rating)
                  }
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl border-3 transition-all transform hover:scale-105 ${
                    feedbackData.interviewer_behavior === rating
                      ? "border-green-600 bg-green-600 text-white shadow-lg"
                      : "border-gray-300 hover:border-gray-400 bg-white"
                  }`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      feedbackData.interviewer_behavior >= rating
                        ? "fill-current"
                        : ""
                    }`}
                  />
                  <span className="font-semibold">{rating}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Platform Usability */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-3">
              Platform Usability *
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    handleFeedbackChange("platform_usability", rating)
                  }
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl border-3 transition-all transform hover:scale-105 ${
                    feedbackData.platform_usability === rating
                      ? "border-orange-600 bg-orange-600 text-white shadow-lg"
                      : "border-gray-300 hover:border-gray-400 bg-white"
                  }`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      feedbackData.platform_usability >= rating
                        ? "fill-current"
                        : ""
                    }`}
                  />
                  <span className="font-semibold">{rating}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Would Recommend */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-3">
              Would you recommend this interview platform to others? *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: "yes", label: "Yes, definitely ✅" },
                { value: "maybe", label: "Maybe 🤔" },
                { value: "no", label: "No ❌" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    handleFeedbackChange("would_recommend", option.value)
                  }
                  className={`px-6 py-4 rounded-xl border-3 transition-all transform hover:scale-105 font-bold text-lg ${
                    feedbackData.would_recommend === option.value
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-lg"
                      : "border-gray-300 hover:border-gray-400 bg-white"
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
              className="block text-base font-bold text-gray-900 mb-3"
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
              className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none resize-none text-base font-medium"
              rows="5"
              required
            />
          </div>

          {/* Additional Comments */}
          <div>
            <label
              htmlFor="additional-comments"
              className="block text-base font-bold text-gray-900 mb-3"
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
              className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none resize-none text-base font-medium"
              rows="4"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={feedbackSubmitting || !feedbackData.improvements.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-5 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg border-3 border-indigo-800"
          >
            {feedbackSubmitting ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Submitting Feedback...
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                Submit Feedback
              </>
            )}
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 border-4 border-white rounded-full mb-6 shadow-2xl">
            {isEvaluating ? (
              <Loader className="w-12 h-12 text-white animate-spin" />
            ) : evaluationComplete || alreadyEvaluated ? (
              <CheckCircle className="w-12 h-12 text-white" />
            ) : (
              <Clock className="w-12 h-12 text-white" />
            )}
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            {isEvaluating
              ? "Processing Your Interview ⚡"
              : "Interview Completed Successfully! 🎉"}
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            {isEvaluating
              ? "Please wait while we analyze your interview responses and prepare your evaluation."
              : "Thank you for taking the time to complete your interview. Your responses have been recorded and evaluated."}
          </p>
        </div>

        {/* Evaluation Status */}
        <EvaluationStatus />

        {/* Main Card */}
        <div className="bg-white border-3 border-gray-900 rounded-2xl p-8 mb-6 shadow-xl">
          {/* Candidate Information */}
          <div className="border-b-3 border-gray-200 pb-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FileText className="w-7 h-7 text-indigo-600" />
              Interview Summary
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border-3 border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-md">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 border-3 border-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-white font-bold text-xl">
                      {userData.name
                        ? userData.name.charAt(0).toUpperCase()
                        : "C"}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {userData.name || "Candidate"}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      Interviewee
                    </p>
                  </div>
                </div>

                {userData.email && (
                  <div className="flex items-center gap-3 text-gray-700 p-4 border-2 border-gray-300 rounded-xl bg-white hover:border-gray-400 transition-colors">
                    <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <span className="text-sm font-medium break-all">
                      {userData.email}
                    </span>
                  </div>
                )}

                {userData.phone && (
                  <div className="flex items-center gap-3 text-gray-700 p-4 border-2 border-gray-300 rounded-xl bg-white hover:border-gray-400 transition-colors">
                    <Phone className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <span className="text-sm font-medium">
                      {userData.phone}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700 p-4 border-2 border-gray-300 rounded-xl bg-white">
                  <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Interview Completed
                    </p>
                    <p className="text-xs text-gray-600 font-medium mt-1">
                      {formatDateTime(completionTimeRef.current)}
                    </p>
                  </div>
                </div>

                {driveCandidateId && (
                  <div className="flex items-center gap-3 text-gray-700 p-4 border-2 border-gray-300 rounded-xl bg-white">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        Application ID
                      </p>
                      <p className="text-xs text-gray-600 font-mono font-medium mt-1">
                        {driveCandidateId}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-gray-700 p-4 border-3 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-md">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-700">
                      Status: Submitted ✓
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-3 border-gray-300 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Mail className="w-6 h-6 text-indigo-600" />
              Questions or Concerns?
            </h3>
            <p className="text-gray-700 mb-5 font-medium">
              If you have any questions about your interview or the hiring
              process, please don't hesitate to reach out to our HR team.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="mailto:hirekruit@gmail.com"
                className="flex items-center gap-3 text-gray-700 px-5 py-3 border-2 border-gray-300 rounded-xl bg-white hover:border-indigo-500 hover:bg-indigo-50 transition-all font-medium"
              >
                <Mail className="w-5 h-5 text-indigo-600" />
                <span>hirekruit@gmail.com</span>
              </a>
              <a
                href="tel:+917255892578"
                className="flex items-center gap-3 text-gray-700 px-5 py-3 border-2 border-gray-300 rounded-xl bg-white hover:border-green-500 hover:bg-green-50 transition-all font-medium"
              >
                <Phone className="w-5 h-5 text-green-600" />
                <span>+91 7255892578</span>
              </a>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <FeedbackForm />

        {/* Footer Message */}
        <div className="text-center mt-8 pt-6 border-t-3 border-gray-200">
          <p className="text-gray-600 font-medium mb-2">
            {isEvaluating
              ? "⏳ Please wait while we process your interview. Do not close this page."
              : "🎯 Thank you for your interest in joining our team. We appreciate the time you've invested in this process."}
          </p>
          <p className="text-gray-500 text-sm font-medium">
            Interview completed at {formatDateTime(completionTimeRef.current)}
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
          >
            <Home className="w-5 h-5" />
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCompletionPage;
