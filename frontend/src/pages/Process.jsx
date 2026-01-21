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
  Target,
  Settings,
  CheckCircle2,
  Computer,
  Clock,
} from "lucide-react";
import { useParams } from "react-router-dom";
import Loader from "../components/Loader";

const BaseURL = import.meta.env.VITE_BASE_URL;

const Process = () => {
  const { driveId } = useParams();

  // State Management
  const [currentStep, setCurrentStep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driveData, setDriveData] = useState(null);
  const [steps, setSteps] = useState([]);
  const [roundProgress, setRoundProgress] = useState([]);
  const [selectedDeadline, setSelectedDeadline] = useState("");

  // Default icons for different round types
  const roundTypeIcons = {
    Technical: Settings,
    HR: Computer,
    Behavioral: Users,
    "System Design: ": Target,
    Coding: Code,
    Panel: Users,
    Final: CheckCircle2,
  };

  // Map base stage names to step objects
  const stageToStepMap = {
    resumeUploaded: {
      id: "resume_upload",
      label: "Resume Upload",
      shortLabel: "Resumes",
      description: "Collecting candidate resumes for the role.",
      icon: Upload,
      status: "resumeUploaded",
    },
    resumeShortlisted: {
      id: "resume_shortlist",
      label: "Resume Shortlisting",
      shortLabel: "Shortlisting",
      description: "Reviewing and shortlisting candidates based on skills.",
      icon: Users,
      status: "resumeShortlisted",
    },
    emailSent: {
      id: "email_sent",
      label: "Invitation Emails",
      shortLabel: "Invitations",
      description: "Sending round invitations to shortlisted candidates.",
      icon: Mail,
      status: "emailSent",
    },
    finalMail: {
      id: "selection_email",
      label: "Final Selection",
      shortLabel: "Hiring",
      description: "Sending final offers and selection emails.",
      icon: UserCheck,
      status: "selectionEmailSent",
    },
  };

  // 1. Fetch Drive Status
  const fetchDriveStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BaseURL}/api/drive/${driveId}`);

      if (!response.ok) throw new Error("Failed to fetch drive details");

      const data = await response.json();
      const drive = data.drive;

      setDriveData(drive);
      setSteps(buildStepsFromStages(drive));
      setCurrentStep(drive.currentStage || 0);

      if (drive.round_progress) {
        setRoundProgress(drive.round_progress);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (driveId) fetchDriveStatus();
  }, [driveId]);

  // 2. Build Steps Logic
  const buildStepsFromStages = (drive) => {
    const stages = drive.stages || [];
    const rounds = drive.rounds || [];
    const steps = [];

    stages.forEach((stage) => {
      if (stageToStepMap[stage]) {
        steps.push(stageToStepMap[stage]);
      } else if (stage.startsWith("schedule") && stage.endsWith("Round")) {
        let roundTypeName = stage.replace(/^schedule/, "").replace(/Round$/, "");
        roundTypeName = roundTypeName.replace(/([A-Z])/g, " $1").trim();

        const roundIndex = rounds.findIndex(
          (r) => r.type.toLowerCase() === roundTypeName.toLowerCase()
        );

        if (roundIndex >= 0) {
          const round = rounds[roundIndex];
          steps.push({
            id: `round_${roundIndex + 1}`,
            label: `Round ${roundIndex + 1}: ${round.type}`,
            shortLabel: round.type,
            description: round.description || `Managing the ${round.type} round.`,
            icon: roundTypeIcons[round.type] || Calendar,
            roundNumber: roundIndex + 1,
            roundType: round.type,
            isRound: true,
          });
        }
      }
    });
    return steps;
  };

  // 3. Update Status (Next Step)
  const handleNextStep = async () => {
    if (currentStep >= steps.length - 1) return;
    const nextStepData = steps[currentStep + 1];

    try {
      setLoading(true);
      let requestBody = nextStepData.isRound
        ? { status: "ROUND_SCHEDULING", round_number: nextStepData.roundNumber, round_type: nextStepData.roundType }
        : { status: nextStepData.status };

      const response = await fetch(`${BaseURL}/api/drive/${driveId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("Update failed");
      await fetchDriveStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Update Round Deadline
  const handleUpdateDeadline = async () => {
    if (!selectedDeadline) return alert("Select a date and time");
    const currentStepData = steps[currentStep];

    try {
      setLoading(true);
      const response = await fetch(`${BaseURL}/api/drive/${driveId}/deadlines`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deadlines: [{
            round_number: currentStepData.roundNumber,
            deadline: new Date(selectedDeadline).toISOString(),
          }],
        }),
      });

      if (!response.ok) throw new Error("Failed to update deadline");
      alert("Deadline updated successfully!");
      fetchDriveStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Mark Round as Complete
  const markRoundComplete = async () => {
    const currentStepData = steps[currentStep];
    try {
      setLoading(true);
      const response = await fetch(`${BaseURL}/api/drive/${driveId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ROUND_COMPLETED",
          round_number: currentStepData.roundNumber,
        }),
      });
      if (!response.ok) throw new Error("Failed to complete round");
      await fetchDriveStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !driveData) return <Loader message="Fetching workflow..." />;
  if (steps.length === 0) return <Loader message="Initializing stages..." />;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-6 py-10">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800">Hiring Pipeline</h1>
          <p className="text-slate-500 mt-2">Drive ID: {driveId} • {driveData?.role}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* Stepper UI */}
        <div className="flex items-center justify-between mb-16 px-4 overflow-x-auto">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center min-w-[100px]">
                <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all ${
                  index <= currentStep ? "bg-black border-black text-white" : "bg-white border-slate-200 text-slate-400"
                }`}>
                  {index < currentStep ? <Check size={24} /> : React.createElement(step.icon, { size: 24 })}
                </div>
                <p className={`text-[10px] font-bold mt-2 uppercase tracking-tighter ${index <= currentStep ? "text-black" : "text-slate-400"}`}>
                  {step.shortLabel}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 rounded-full ${index < currentStep ? "bg-black" : "bg-slate-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Main Content Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="p-5 bg-slate-100 rounded-2xl">
              {React.createElement(currentStepData.icon, { size: 40, className: "text-black" })}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-slate-800">{currentStepData.label}</h2>
              <p className="text-slate-500 mt-1">{currentStepData.description}</p>
            </div>

            {/* Status Button Area */}
            <div className="flex flex-col gap-3">
              {!isLastStep && (
                <button
                  onClick={handleNextStep}
                  disabled={loading}
                  className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-all disabled:bg-slate-300"
                >
                  {loading ? "Processing..." : "Next Stage"}
                </button>
              )}
              {currentStepData.isRound && (
                <button
                  onClick={markRoundComplete}
                  className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-xl font-bold hover:bg-green-50 transition-all"
                >
                  Mark Round Complete
                </button>
              )}
            </div>
          </div>

          {/* Deadline Manager (Only for Rounds) */}
          {currentStepData.isRound && (
            <div className="mt-10 pt-8 border-t border-slate-100">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Setting Deadline */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Clock size={16} /> Update Round Deadline
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      className="flex-1 p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-black"
                      value={selectedDeadline}
                      onChange={(e) => setSelectedDeadline(e.target.value)}
                    />
                    <button
                      onClick={handleUpdateDeadline}
                      className="bg-black text-white px-5 rounded-xl font-bold hover:bg-slate-800"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Current Round Stats */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-700 mb-4">Round Statistics</h3>
                  {roundProgress
                    .filter((rp) => rp.round_number === currentStepData.roundNumber)
                    .map((rp) => (
                      <div key={rp.round_number} className="space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Candidates Scheduled</span>
                          <span className="font-bold">{rp.scheduled_count}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Current Deadline</span>
                          <span className="font-bold text-red-600">
                            {rp.deadline ? new Date(rp.deadline).toLocaleString() : "Not Set"}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-black h-full" style={{ width: `${rp.completion_percentage}%` }} />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Process;