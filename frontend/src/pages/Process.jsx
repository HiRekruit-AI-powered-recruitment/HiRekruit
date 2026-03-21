import React, { useState, useEffect } from "react";
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
  Activity
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";

const BaseURL = import.meta.env.VITE_BASE_URL;

const Process = () => {
  const { driveId } = useParams();
  const navigate = useNavigate();

  // State Management
  const[activeStage, setActiveStage] = useState(0); // Only tracking current unlocked stage
  
  const[loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const[driveData, setDriveData] = useState(null);
  const [steps, setSteps] = useState([]);
  const [selectedDeadline, setSelectedDeadline] = useState("");
  const [deadline, setDeadline] = useState("");
  
  // Live Stats - Only tracking total live applications now
  const [stats, setStats] = useState({ total: 0 });

  const roundTypeIcons = {
    Technical: Settings,
    HR: Computer,
    Behavioral: Users,
    "System Design": Target,
    Coding: Code,
    Panel: Users,
    Final: CheckCircle2,
  };

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

  const fetchDriveStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Fetch Drive info
      const response = await fetch(`${BaseURL}/api/drive/${driveId}`);
      if (!response.ok) throw new Error("Failed to fetch drive details");
      const data = await response.json();
      const drive = data.drive;

      setDriveData(drive);
      
      const generatedSteps = buildStepsFromStages(drive);
      setSteps(generatedSteps);

      // 2. Check if the pipeline has officially started moving forward
      const startedStatuses =[
        "resumeUploaded", 
        "resumeShortlisted", 
        "emailSent", 
        "selectionEmailSent", 
        "ROUND_SCHEDULING", 
        "ROUND_COMPLETED"
      ];
      
      const hasStarted = drive.status && startedStatuses.includes(drive.status);
      const backendStage = drive.currentStage !== undefined && drive.currentStage !== null ? drive.currentStage : 0;
      
      // If it hasn't started, stay on Index 0 (Live Applications)
      // If it has started, map it directly to the backend stage + 1 (since 0 is Overview)
      const frontendActiveStage = hasStarted ? backendStage + 1 : 0;
      
      setActiveStage(frontendActiveStage);

      // Check if current round is coding to get deadline
      const currentActiveStepData = generatedSteps[frontendActiveStage];
      if (currentActiveStepData?.isRound && currentActiveStepData.roundType === "Coding") {
        const deadlineRes = await fetch(`${BaseURL}/api/drive/get_deadline?drive_id=${driveId}`);
        const deadlineData = await deadlineRes.json();
        setDeadline(deadlineData.deadline);
      }

      // 3. Fetch Live Candidates Stats for Overview Node (Total Live Only)
      const statsRes = await fetch(`${BaseURL}/api/drive/${driveId}/candidates`);
      if (statsRes.ok) {
        const cData = await statsRes.json();
        const candidatesList = Array.isArray(cData) ? cData : (cData.candidates || cData.data ||[]);
        setStats({
          total: candidatesList.length
        });
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

  const buildStepsFromStages = (drive) => {
    const stages = drive.stages || [];
    const rounds = drive.rounds ||[];
    const workflowSteps = [];

    stages.forEach((stage) => {
      if (stageToStepMap[stage]) {
        workflowSteps.push(stageToStepMap[stage]);
      } else if (stage.startsWith("schedule") && stage.endsWith("Round")) {
        let roundTypeName = stage.replace(/^schedule/, "").replace(/Round$/, "");
        roundTypeName = roundTypeName.replace(/([A-Z])/g, " $1").trim();

        const roundIndex = rounds.findIndex(
          (r) => r.type.toLowerCase() === roundTypeName.toLowerCase()
        );

        if (roundIndex >= 0) {
          const round = rounds[roundIndex];
          workflowSteps.push({
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

    // Inject Live Overview as the First Node
    return[
      {
        id: "live_overview",
        label: "Live Drive Overview",
        shortLabel: "Live Stats",
        description: "Review live applications before starting the pipeline.",
        icon: Activity,
        isOverview: true
      },
      ...workflowSteps
    ];
  };

  const handleNextStep = async () => {
    if (activeStage >= steps.length - 1) return;
    
    // Grabbing the next step to update the backend to start the ACTUAL pipeline
    const nextStepData = steps[activeStage + 1];

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

  const handleUpdateDeadline = async () => {
    if (!selectedDeadline) return alert("Select a date and time");
    const currentStepData = steps[activeStage];

    try {
      setLoading(true);
      const response = await fetch(`${BaseURL}/api/drive/${driveId}/deadlines`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deadlines:[{
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

  const markRoundComplete = async () => {
    const currentStepData = steps[activeStage];
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

  const currentStepData = steps[activeStage];
  const isLastStep = activeStage === steps.length - 1;

  // Determine if the current round is marked as completed in driveData
  const activeRoundInfo = currentStepData.isRound
    ? driveData.round_statuses?.find(rs => rs.round_number === currentStepData.roundNumber)
    : null;
  const isCurrentRoundCompleted = activeRoundInfo?.completed === "yes";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-6 py-10">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-slate-800">Hiring Pipeline</h1>
          <p className="text-slate-500 mt-2">Drive ID: {driveId} • {driveData?.role}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* Stepper Visualization (View-only Progress Bar - CANNOT click to track back) */}
        <div className="flex items-center justify-between mb-16 px-4 overflow-x-auto pb-4">
          {steps.map((step, index) => {
            const isCompleted = index < activeStage;
            const isActive = index === activeStage;
            const isLocked = index > activeStage;

            return (
              <React.Fragment key={step.id}>
                <div 
                  className={`flex flex-col items-center min-w-[100px] transition-transform ${isLocked ? "opacity-50" : ""}`}
                >
                  <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all 
                    ${isActive ? "border-blue-600 bg-blue-50 text-blue-600" 
                    : isCompleted ? "bg-black border-black text-white" 
                    : "bg-white border-slate-200 text-slate-400"
                    }`}>
                    {isCompleted ? <Check size={24} /> : React.createElement(step.icon, { size: 24 })}
                  </div>
                  <p className={`text-[10px] font-bold mt-2 uppercase tracking-tighter 
                    ${isActive ? "text-blue-600" : isCompleted ? "text-black" : "text-slate-400"}`}>
                    {step.shortLabel}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded-full ${index < activeStage ? "bg-black" : "bg-slate-200"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Active Node Card Content */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className={`p-5 rounded-2xl ${currentStepData.isOverview ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-black"}`}>
              {React.createElement(currentStepData.icon, { size: 40 })}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3">
                {currentStepData.label}
                {isCurrentRoundCompleted && <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">Completed</span>}
              </h2>
              <p className="text-slate-500 mt-1">{currentStepData.description}</p>
            </div>

            <div className="flex flex-col gap-3">
              {currentStepData.isRound && !isCurrentRoundCompleted ? (
                // It's the active round, mark complete
                <button
                  onClick={markRoundComplete}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg"
                >
                  {loading ? "Processing..." : "Mark Round Complete"}
                </button>
              ) : (
                // It's a completed stage, move to next stage in backend
                !isLastStep && (
                  <button
                    onClick={handleNextStep}
                    disabled={loading}
                    className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg disabled:bg-slate-300"
                  >
                    {loading ? "Processing..." : "Proceed to Next Stage"}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Render Live Drive Overview details (Only Live Applications Count) */}
          {currentStepData.isOverview && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Live Drive Analytics</h3>
              <div className="grid grid-cols-1">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-600 mb-1">Total Live Applications</p>
                      <p className="text-4xl font-black text-blue-900">{stats.total}</p>
                    </div>
                    <Users className="text-blue-200" size={48} />
                </div>
              </div>

              <div className="mt-6 pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Role</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{driveData?.role || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Company</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{driveData?.company_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Job ID</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{driveData?.job_id || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Stages</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{steps.length - 1} Workflow Steps</p>
                </div>
              </div>
            </div>
          )}

          {/* Render Round details (Only Update Deadline) */}
          {currentStepData.isRound && (
            <div className="mt-10 pt-8 border-t border-slate-100 flex justify-start">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 w-full max-w-xl">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Clock size={16} /> Update Round Deadline
                  </h3>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Current Deadline:</span>
                      <span className={`font-bold ${deadline ? "text-green-600" : "text-red-600"}`}>
                        {deadline ? new Date(deadline).toLocaleString() : "Not Set"}
                      </span>
                    </div>

                    <div className="flex gap-2 w-full">
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
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Process;