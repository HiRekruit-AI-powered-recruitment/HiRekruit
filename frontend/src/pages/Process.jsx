import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Upload,
  Users,
  Mail,
  Calendar,
  UserCheck,
  AlertCircle,
  Code,
  MessageSquare,
  Target,
  Settings,
  CheckCircle2,
} from "lucide-react";
import { useParams } from "react-router-dom";
import Loader from "../components/Loader";

const BaseURL = import.meta.env.VITE_BASE_URL;

const Process = () => {
  const { driveId } = useParams();
  console.log("Drive ID:", driveId);

  const [currentStep, setCurrentStep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driveData, setDriveData] = useState(null);
  const [steps, setSteps] = useState([]);
  const [roundProgress, setRoundProgress] = useState([]);

  // Default icons for different round types
  const roundTypeIcons = {
    Technical: Settings,
    HR: MessageSquare,
    Behavioral: Users,
    "System Design": Target,
    Coding: Code,
    Panel: Users,
    Final: CheckCircle2,
  };

  // Fetch current drive status on component mount
  useEffect(() => {
    if (driveId) {
      console.log("Component mounted with driveId:", driveId);
      fetchDriveStatus();
    } else {
      console.log("No driveId provided");
      setError("Drive ID is required");
    }
  }, [driveId]);

  const fetchDriveStatus = async () => {
    console.log("Fetching status for drive ID:", driveId);
    try {
      setLoading(true);
      setError(null);

      // Fetch drive details
      const response = await fetch(`${BaseURL}/api/drive/${driveId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Drive not found");
        } else if (response.status === 400) {
          throw new Error("Invalid drive ID format");
        }
        throw new Error(
          `HTTP ${response.status}: Failed to fetch drive details`
        );
      }

      const data = await response.json();
      console.log("Fetched drive data:", data);

      const drive = data.drive;
      setDriveData(drive);

      // Build dynamic steps based on drive rounds
      const dynamicSteps = buildStepsFromDrive(drive);
      setSteps(dynamicSteps);

      // Determine current step based on drive status and round progress
      const currentStepIndex = determineCurrentStep(drive, dynamicSteps);
      setCurrentStep(currentStepIndex);

      // Fetch round progress if available
      if (drive.round_progress) {
        setRoundProgress(drive.round_progress);
      }

      console.log("Current step updated to:", currentStepIndex);
    } catch (err) {
      console.error("Error fetching drive status:", err);
      setError(`Failed to load drive status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const buildStepsFromDrive = (drive) => {
    const baseSteps = [
      {
        id: "resume_upload",
        label: "Resume Upload",
        shortLabel: "Resume Upload",
        description: "Upload and collect candidate resumes",
        icon: Upload,
        status: "resumeUploaded",
      },
      {
        id: "resume_shortlist",
        label: "Resume Shortlisting",
        shortLabel: "Shortlisting",
        description: "Review and shortlist qualified candidates",
        icon: Users,
        status: "resumeShortlisted",
      },
      {
        id: "email_sent",
        label: "Send Email",
        shortLabel: "Send Email",
        description: "Send invitation emails to shortlisted candidates",
        icon: Mail,
        status: "emailSent",
      },
    ];

    // Add round-based steps
    const rounds = drive.rounds || [];
    const roundSteps = rounds.map((round, index) => {
      const roundNumber = index + 1;
      const icon = roundTypeIcons[round.type] || Calendar;

      return {
        id: `round_${roundNumber}`,
        label: `Round ${roundNumber}: ${round.type}`,
        shortLabel: round.type,
        description: round.description || `Complete ${round.type} round`,
        icon: icon,
        roundNumber: roundNumber,
        roundType: round.type,
        isRound: true,
      };
    });

    const finalStep = {
      id: "selection_email",
      label: "Final Mail to Selected",
      shortLabel: "Final Selection",
      description: "Send final confirmation to hired candidates",
      icon: UserCheck,
      status: "selectionEmailSent",
    };

    return [...baseSteps, ...roundSteps, finalStep];
  };

  const determineCurrentStep = (drive, dynamicSteps) => {
    const status = drive.status;
    const roundStatuses = drive.round_statuses || [];
    const roundsCount = drive.rounds?.length || 0;

    // Fast-complete
    if (status === "selectionEmailSent" || status === "completed") {
      return dynamicSteps.length - 1;
    }

    // Base steps according to status
    let completedSteps = 0;
    if (status === "resumeUploaded") completedSteps = 1;
    else if (status === "resumeShortlisted") completedSteps = 2;
    else if (status === "emailSent") completedSteps = 3;

    // Count completed rounds
    const completedRounds = (roundStatuses || []).filter(
      (rs) => rs.status === "completed"
    ).length;
    completedSteps += completedRounds;

    // If there's an in-progress round that isn't completed, add half-step
    const hasInProgress = (roundStatuses || []).some(
      (rs) => rs.status === "in_progress"
    );
    if (hasInProgress) completedSteps += 0.5;

    // Ensure completedSteps doesn't exceed totalSteps - 1
    const totalSteps = 4 + roundsCount;
    if (completedSteps > totalSteps - 1) completedSteps = totalSteps - 1;

    // Map completedSteps to step index in dynamicSteps
    // dynamicSteps: [0:resume_upload, 1:resume_shortlist, 2:email_sent, 3..3+roundsCount-1:rounds, 3+roundsCount:selection_email]
    let stepIndex = Math.floor(completedSteps);

    // Clamp to valid range
    stepIndex = Math.max(0, Math.min(stepIndex, dynamicSteps.length - 1));

    return stepIndex;
  };

  const updateDriveStatus = async (step) => {
    console.log("Updating drive status for step:", step);
    if (!driveId) {
      setError("Drive ID is required");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      let requestBody = {};

      // Handle different step types
      if (step.isRound) {
        // This is a round step
        requestBody = {
          status: "ROUND_SCHEDULING",
          round_number: step.roundNumber,
        };
      } else if (step.status) {
        // This is a standard status step
        requestBody = {
          status: step.status,
        };
      }

      console.log("Sending request:", requestBody);

      const response = await fetch(`${BaseURL}/api/drive/${driveId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update drive status");
      }

      const data = await response.json();
      console.log("Drive status updated successfully:", data);

      // Refresh drive data
      await fetchDriveStatus();

      return true;
    } catch (err) {
      console.error("Error updating drive status:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      const nextStepData = steps[nextStepIndex];

      const success = await updateDriveStatus(nextStepData);
      if (success) {
        setCurrentStep(nextStepIndex);
      }
    }
  };

  const goToStep = async (stepIndex) => {
    if (
      stepIndex >= 0 &&
      stepIndex < steps.length &&
      stepIndex !== currentStep
    ) {
      const stepData = steps[stepIndex];

      const success = await updateDriveStatus(stepData);
      if (success) {
        setCurrentStep(stepIndex);
      }
    }
  };

  const markRoundComplete = async () => {
    const currentStepData = steps[currentStep];

    if (currentStepData.isRound) {
      try {
        setLoading(true);
        const response = await fetch(`${BaseURL}/api/drive/${driveId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "ROUND_COMPLETED",
            round_number: currentStepData.roundNumber,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to mark round as complete");
        }

        await fetchDriveStatus();
      } catch (err) {
        console.error("Error marking round complete:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Show loading when currentStep is null
  if (loading || currentStep === null || steps.length === 0) {
    return (
      <Loader
        message="Loading drive status..."
        subMessage={`Drive ID: ${driveId}`}
        error={error}
        onRetry={fetchDriveStatus}
      />
    );
  }

  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;
  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex justify-center px-8 pb-8">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12 mt-0">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Recruitment Process
          </h1>
          <p className="text-gray-600">
            Follow the hiring workflow from resume collection to final selection
          </p>
          {driveData && (
            <div className="mt-4 space-y-1">
              <p className="text-sm text-gray-500">Drive ID: {driveId}</p>
              <p className="text-sm font-medium text-gray-700">
                Role: {driveData.role} | Total Rounds:{" "}
                {driveData.rounds?.length || 0}
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Stepper Container */}
        <div className="relative mb-12 overflow-x-auto pb-4">
          <div className="inline-flex items-center justify-start min-w-full px-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                {/* Step Circle and Label */}
                <div
                  className="flex flex-col items-center"
                  style={{ width: "120px" }}
                >
                  {/* Circle Step */}
                  <div className="relative mb-3">
                    <motion.div
                      className={`w-16 h-16 rounded-full border-4 flex items-center justify-center relative z-10 cursor-pointer ${
                        index <= currentStep
                          ? "border-black bg-black"
                          : "border-gray-300 bg-white"
                      }`}
                      initial={false}
                      animate={{
                        scale: index === currentStep ? 1.1 : 1,
                        borderColor:
                          index <= currentStep ? "#000000" : "#d1d5db",
                        backgroundColor:
                          index <= currentStep ? "#000000" : "#ffffff",
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      onClick={() => !loading && goToStep(index)}
                      whileHover={{ scale: loading ? 1 : 1.05 }}
                    >
                      <AnimatePresence mode="wait">
                        {index < currentStep ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ duration: 0.4, ease: "backOut" }}
                          >
                            <Check
                              className="w-8 h-8 text-white"
                              strokeWidth={3}
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="icon"
                            className={`${
                              index <= currentStep
                                ? "text-white"
                                : "text-gray-500"
                            }`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {React.createElement(step.icon, {
                              className: "w-8 h-8",
                              strokeWidth: 2,
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Loading spinner for current step */}
                      {loading && index === currentStep && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        </div>
                      )}
                    </motion.div>

                    {/* Pulse Animation for Current Step */}
                    {index === currentStep && !loading && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-black"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.7, 0, 0.7],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </div>

                  {/* Step Label - Centered under circle */}
                  <motion.div
                    className="text-center px-2"
                    animate={{
                      color: index <= currentStep ? "#000000" : "#9ca3af",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <p
                      className={`text-xs font-medium cursor-pointer leading-tight ${
                        index <= currentStep ? "text-black" : "text-gray-400"
                      }`}
                      onClick={() => !loading && goToStep(index)}
                    >
                      {step.shortLabel}
                    </p>
                  </motion.div>
                </div>

                {/* Connecting Line - Between circles at same level */}
                {index < totalSteps - 1 && (
                  <div
                    className="relative self-start"
                    style={{
                      width: "80px",
                      height: "4px",
                      marginTop: "30px",
                      marginLeft: "-10px",
                      marginRight: "-10px",
                    }}
                  >
                    <div className="absolute w-full h-full bg-gray-300 rounded-full" />
                    <motion.div
                      className="absolute h-full bg-black rounded-full"
                      initial={{ width: "0%" }}
                      animate={{
                        width: index < currentStep ? "100%" : "0%",
                      }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Description */}
        <div className="text-center mb-12">
          <motion.div
            className="inline-block"
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-center mb-4">
              {React.createElement(currentStepData.icon, {
                className: "w-12 h-12 text-black mr-4",
                strokeWidth: 2,
              })}
              <div className="text-left">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {currentStepData.label}
                </h2>
                <p className="text-gray-600">{currentStepData.description}</p>
                {currentStepData.isRound && (
                  <p className="text-sm text-blue-600 mt-1">
                    Round Type: {currentStepData.roundType}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Round Progress Info */}
        {currentStepData.isRound && roundProgress.length > 0 && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-white rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Round Progress
            </h3>
            {roundProgress
              .filter((rp) => rp.round_number === currentStepData.roundNumber)
              .map((rp) => (
                <div key={rp.round_number} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Scheduled:</span>
                    <span className="font-medium">
                      {rp.scheduled_count} candidates
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium">
                      {rp.completed_count} candidates
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Passed:</span>
                    <span className="font-medium text-green-600">
                      {rp.passed_count} candidates
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${rp.completion_percentage || 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-black to-gray-800 h-3 rounded-full"
              initial={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              animate={{
                width: `${((currentStep + 1) / totalSteps) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        {!isLastStep && (
          <div className="flex justify-center space-x-4">
            <motion.button
              onClick={nextStep}
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-medium shadow-lg transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-black to-gray-800 text-white hover:shadow-xl hover:from-gray-900 hover:to-black"
              }`}
              whileHover={!loading ? { scale: 1.05 } : {}}
              whileTap={!loading ? { scale: 0.95 } : {}}
            >
              {loading ? "Updating..." : "Proceed to Next Step"}
            </motion.button>

            {currentStepData.isRound && (
              <motion.button
                onClick={markRoundComplete}
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-medium shadow-lg transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
                whileHover={!loading ? { scale: 1.05 } : {}}
                whileTap={!loading ? { scale: 0.95 } : {}}
              >
                {loading ? "Updating..." : "Mark Round Complete"}
              </motion.button>
            )}
          </div>
        )}

        {/* Completion Message */}
        <AnimatePresence>
          {isLastStep && (
            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, ease: "backOut", delay: 0.3 }}
                >
                  <Check className="w-10 h-10 text-black" strokeWidth={3} />
                </motion.div>
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                Recruitment Complete!
              </h3>
              <p className="text-gray-600">
                All candidates have been processed and final selections made.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Process;
