import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  Clock,
  Zap,
  Shield,
  Camera,
  Video,
  Volume2,
  Monitor,
  XCircle,
  RefreshCw,
} from "lucide-react";

const DependencyPipeline = ({
  dependencyStates,
  loadingStage,
  loadingProgress,
  loadingMessage,
  loadingSubtext,
  isHR,
  errors = {},
  onRetry,
  estimatedTimeRemaining,
}) => {
  const [expandedSteps, setExpandedSteps] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Celebrate completed steps with animation
  useEffect(() => {
    Object.entries(dependencyStates).forEach(([stepId, isComplete]) => {
      if (isComplete && !completedSteps.has(stepId)) {
        setCompletedSteps((prev) => new Set([...prev, stepId]));
      }
    });
  }, [dependencyStates]);

  // Define pipeline steps
  const pipelineSteps = [
    {
      id: "completionCheck",
      name: "Interview Access",
      description: "Verifying interview eligibility",
      icon: Shield,
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
      skip: isHR,
      details:
        "Checking your interview status and ensuring you have permission to proceed.",
    },
    {
      id: "permissions",
      name: "Device Permissions",
      description: "Camera & microphone access",
      icon: Camera,
      color: "purple",
      gradient: "from-purple-500 to-purple-600",
      details:
        "Requesting access to your camera and microphone for the video interview.",
    },
    {
      id: "livekit",
      name: "Video Connection",
      description: "Connecting to interview room",
      icon: Video,
      color: "emerald",
      gradient: "from-emerald-500 to-emerald-600",
      details: "Establishing secure connection to the interview server.",
    },
    {
      id: "videoElement",
      name: "Video Display",
      description: "Setting up video elements",
      icon: Monitor,
      color: "indigo",
      gradient: "from-indigo-500 to-indigo-600",
      details: "Configuring video preview and display components.",
    },
    {
      id: "vapi",
      name: "AI Interviewer",
      description: "Initializing conversational AI",
      icon: Zap,
      color: "amber",
      gradient: "from-amber-500 to-amber-600",
      skip: isHR,
      details: "Loading the AI interviewer and natural language processing.",
    },
    {
      id: "audioContext",
      name: "Audio System",
      description: "Configuring audio context",
      icon: Volume2,
      color: "pink",
      gradient: "from-pink-500 to-pink-600",
      details: "Setting up audio processing and voice detection.",
    },
  ];

  const activeSteps = pipelineSteps.filter((step) => !step.skip);

  const getStepStatus = (stepId) => {
    if (errors[stepId]) return "error";
    if (dependencyStates[stepId]) return "completed";
    if (loadingStage === stepId) return "active";
    return "pending";
  };

  const toggleStepExpansion = (stepId) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const getStepIcon = (step) => {
    const status = getStepStatus(step.id);
    const Icon = step.icon;

    if (status === "error") {
      return <XCircle className="w-5 h-5 text-red-500" />;
    } else if (status === "completed") {
      return (
        <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-scale-in" />
      );
    } else if (status === "active") {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    } else {
      return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStepColor = (step) => {
    const status = getStepStatus(step.id);
    if (status === "error") return "border-red-500 bg-red-50";
    if (status === "completed") return "border-emerald-500 bg-emerald-50";
    if (status === "active")
      return `border-${step.color}-500 bg-${step.color}-50`;
    return "border-gray-200 bg-gray-50";
  };

  const getConnectorColor = (index) => {
    const currentStep = activeSteps[index];
    const currentStatus = getStepStatus(currentStep.id);

    if (currentStatus === "error") return "bg-red-500";
    if (currentStatus === "completed") return "bg-emerald-500";
    if (currentStatus === "active") return "bg-blue-500 animate-pulse";
    return "bg-gray-200";
  };

  const completedCount = activeSteps.filter(
    (step) => getStepStatus(step.id) === "completed",
  ).length;
  const totalSteps = activeSteps.length;
  const progressPercentage = Math.max(
    loadingProgress,
    (completedCount / totalSteps) * 100,
  );

  const hasErrors = Object.keys(errors).length > 0;
  const isComplete = loadingProgress === 100 || completedCount === totalSteps;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-8 border border-gray-200 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Outer pulse ring */}
            {!isComplete && !hasErrors && (
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
            )}

            {/* Main circle */}
            <div
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                hasErrors
                  ? "bg-red-100"
                  : isComplete
                    ? "bg-emerald-100"
                    : "bg-blue-100"
              }`}
            >
              {hasErrors ? (
                <AlertCircle className="w-10 h-10 text-red-500 animate-bounce" />
              ) : isComplete ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-scale-in" />
              ) : (
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              )}
            </div>

            {/* Progress indicator */}
            {!isComplete && !hasErrors && (
              <div className="absolute -bottom-2 -right-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <span className="text-xs text-white font-bold">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {hasErrors ? "Setup Encountered Issues" : loadingMessage}
        </h3>
        <p className="text-gray-600">{loadingSubtext}</p>

        {/* Step counter */}
        <div className="mt-4 inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
          <span className="text-sm font-medium text-gray-700">
            Step {completedCount} of {totalSteps}
          </span>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="relative w-full bg-gray-200 rounded-full h-3 mb-8 overflow-hidden shadow-inner">
        <div
          className={`h-3 rounded-full transition-all duration-700 ease-out ${
            hasErrors
              ? "bg-gradient-to-r from-red-500 to-red-600"
              : "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700"
          }`}
          style={{ width: `${progressPercentage}%` }}
        >
          <div className="h-full w-full bg-white/20 animate-shimmer"></div>
        </div>

        {/* Progress milestones */}
        <div className="absolute top-0 left-0 w-full h-full flex justify-between px-1">
          {activeSteps.map((_, idx) => {
            const milestone = ((idx + 1) / totalSteps) * 100;
            return (
              <div
                key={idx}
                className={`w-0.5 h-full ${
                  progressPercentage >= milestone
                    ? "bg-white/50"
                    : "bg-gray-300"
                }`}
              ></div>
            );
          })}
        </div>
      </div>

      {/* Pipeline Steps - Horizontal Layout */}
      <div className="relative">
        {/* Horizontal connector line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 z-0" />

        {/* Steps in horizontal row */}
        <div className="relative flex justify-between items-start z-10">
          {activeSteps.map((step, index) => {
            const status = getStepStatus(step.id);
            const isActive = status === "active";
            const isExpanded = expandedSteps[step.id];
            const error = errors[step.id];

            return (
              <div key={step.id} className="flex-1 flex flex-col items-center">
                {/* Step Circle and Content */}
                <div className="relative flex flex-col items-center w-full">
                  {/* Connector Line to Next Step */}
                  {index < activeSteps.length - 1 && (
                    <div
                      className={`absolute top-6 left-1/2 w-full h-0.5 transition-all duration-500 z-0 ${getConnectorColor(
                        index,
                      )}`}
                    ></div>
                  )}

                  {/* Step Icon Circle */}
                  <button
                    onClick={() => toggleStepExpansion(step.id)}
                    className="relative z-10 group"
                  >
                    <div
                      className={`
                        w-12 h-12 rounded-full border-2 flex items-center justify-center
                        transition-all duration-300 ${getStepColor(step)}
                        ${isActive ? "shadow-lg ring-2 ring-blue-200 ring-offset-2 scale-110" : ""}
                        group-hover:scale-105
                      `}
                    >
                      {getStepIcon(step)}
                    </div>
                  </button>

                  {/* Step Name and Description */}
                  <div className="mt-3 text-center max-w-[140px]">
                    <h4
                      className={`font-semibold text-sm leading-tight ${
                        status === "error"
                          ? "text-red-700"
                          : status === "completed"
                            ? "text-emerald-700"
                            : status === "active"
                              ? "text-blue-700"
                              : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </h4>
                    <p
                      className={`text-xs mt-1 leading-tight ${
                        status === "error"
                          ? "text-red-600"
                          : status === "completed"
                            ? "text-emerald-600"
                            : status === "active"
                              ? "text-blue-600"
                              : "text-gray-400"
                      }`}
                    >
                      {step.description}
                    </p>

                    {/* Status Badge */}
                    <div className="mt-2">
                      {status === "completed" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ✓
                        </span>
                      )}
                      {status === "active" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
                          ●
                        </span>
                      )}
                      {status === "error" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                          ✕
                        </span>
                      )}
                      {status === "pending" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          ○
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Dropdown */}
                {isExpanded && (
                  <div className="mt-4 w-full max-w-[200px] animate-slide-down">
                    <div
                      className={`
                        rounded-lg border-2 p-3 shadow-lg
                        ${
                          status === "error"
                            ? "border-red-300 bg-red-50"
                            : status === "completed"
                              ? "border-emerald-300 bg-emerald-50"
                              : status === "active"
                                ? "border-blue-300 bg-blue-50"
                                : "border-gray-200 bg-white"
                        }
                      `}
                    >
                      <p className="text-xs text-gray-700 mb-2">
                        {step.details}
                      </p>

                      {error && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded">
                          <div className="flex items-start">
                            <AlertCircle className="w-3 h-3 text-red-600 mt-0.5 mr-1 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-red-800">
                                {error.message || "An error occurred"}
                              </p>
                              {onRetry && (
                                <button
                                  onClick={() => onRetry(step.id)}
                                  className="mt-2 inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-white border border-red-300 rounded hover:bg-red-50 transition-colors"
                                >
                                  <RefreshCw className="w-3 h-3 mr-1" />
                                  Retry
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>
            {hasErrors
              ? "Please resolve errors to continue"
              : isComplete
                ? "Setup complete! Starting interview..."
                : estimatedTimeRemaining
                  ? `Estimated time remaining: ${estimatedTimeRemaining}`
                  : "Please wait while we prepare your interview..."}
          </span>
        </div>

        {/* Additional help text */}
        {!isComplete && !hasErrors && (
          <p className="text-center text-xs text-gray-500 mt-3">
            This process typically takes 10-15 seconds
          </p>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default DependencyPipeline;
