import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  Eye,
  MoreVertical,
  BrainCircuit,
  PlayCircle,
  Copy,
  Check,
  Edit,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DriveCard = ({ drive, onView, onDelete }) => {
  // Guard: Prevent rendering stale/deleted drive objects
  if (!drive) return null;

  const navigate = useNavigate();
  const {
    _id,
    job_id,
    role,
    location,
    start_date,
    end_date,
    status,
    rounds,
    round_statuses,
    current_round,
    skills,
    created_at,
    candidates_to_hire,
    job_type,
    progress,
  } = drive;

  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Toggle menu
  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  // Close menu when clicking outside (simple implementation using onBlur could work efficiently if button is focused, but here we just handle click)
  // Or better, use a backdrop or just rely on manual toggle for MVP.
  // Adding a simple click listener to window is better but requires useEffect. 
  // Let's stick to simple toggle for now, maybe add onBlur to the button wrapper.

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    // Team Note: Edit page reuses existing form with prefilled drive data
    navigate(`/dashboard/drives/edit/${_id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (window.confirm("Are you sure you want to delete this drive?")) {
      // Team Note: Added Drive actions menu (Edit/Delete) via three-dot dropdown
      if (onDelete) onDelete(_id);
    }
  };

  // Copy job_id to clipboard
  const handleCopyJobId = async () => {
    try {
      await navigator.clipboard.writeText(job_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Get drive progress based on rounds
  const getDriveProgress = () => {
    // Steps: 1) resumeUploaded, 2) resumeShortlisted, 3) emailSent,
    // then one step per round, then final selection email => totalSteps = 4 + rounds.length
    const roundsCount = rounds?.length || 0;
    const totalSteps = 4 + roundsCount;

    // Completed steps (can be fractional for in-progress round)
    let completedSteps = 0;

    // Fast-complete
    if (status === "selectionEmailSent" || status === "completed") {
      return { text: "Completed", color: "green", percentage: 100 };
    }

    // Base steps according to status
    if (status === "resumeUploaded") completedSteps = 1;
    else if (status === "resumeShortlisted") completedSteps = 2;
    else if (status === "emailSent") completedSteps = 3;

    // Count completed rounds
    const completedRounds = (round_statuses || []).filter(
      (rs) => rs.status === "completed"
    ).length;
    completedSteps += completedRounds;

    // If there's an in-progress round that isn't completed, add half-step
    const hasInProgress = (round_statuses || []).some(
      (rs) => rs.status === "in_progress"
    );
    if (hasInProgress) completedSteps += 0.5;

    // Ensure completedSteps doesn't exceed totalSteps - 1 (final will be selectionEmailSent)
    if (completedSteps > totalSteps - 1) completedSteps = totalSteps - 1;

    const percentage = Math.round((completedSteps / totalSteps) * 100);

    // Determine display text and color
    let text = "";
    let color = "blue";

    if (completedSteps < 1) {
      text = "Drive Created";
      color = "gray";
    } else if (completedSteps < 2) {
      text = "Resume Screening";
      color = "blue";
    } else if (completedSteps < 3) {
      text = "Candidates Shortlisted";
      color = "blue";
    } else if (completedSteps < 3 + roundsCount) {
      // Round stage
      const nextRound = Math.min(
        roundsCount,
        Math.max(1, Math.floor(completedSteps - 3) + 1)
      );
      const roundType =
        rounds && rounds[nextRound - 1]
          ? rounds[nextRound - 1].type
          : `Round ${nextRound}`;
      text = `Round ${nextRound}: ${roundType}`;
      color = hasInProgress ? "orange" : "blue";
    } else {
      text = "Final Selection";
      color = "orange";
    }

    return { text, color, percentage };
  };

  const driveProgress = getDriveProgress();

  // Determine if drive is ongoing or completed
  const isCompleted = status === "selectionEmailSent" || status === "completed";
  const isOngoing = !isCompleted;

  const statusConfig = isCompleted
    ? {
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      icon: CheckCircle,
      label: "Completed",
    }
    : {
      color: "text-black",
      bgColor: "bg-gray-200",
      icon: Clock,
      label: "Ongoing",
    };

  const StatusIcon = statusConfig.icon;

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Days remaining
  const getDaysRemaining = () => {
    if (isCompleted) return null;

    const end = new Date(end_date);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();

  // Get progress color
  const getProgressColor = () => {
    if (driveProgress.color === "green") return "bg-green-600";
    if (driveProgress.color === "blue") return "bg-blue-600";
    if (driveProgress.color === "orange") return "bg-orange-500";
    return "bg-gray-600";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-300 hover:shadow-xl transition-shadow duration-200 relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={handleCopyJobId}
                className="group flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="Click to copy Job ID"
              >
                <span>{job_id}</span>
                {copied ? (
                  <Check size={12} className="text-green-600" />
                ) : (
                  <Copy
                    size={12}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                )}
              </button>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
              >
                <StatusIcon size={12} />
                {statusConfig.label}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{role}</h3>

            {/* Job Type Badge */}
            {job_type && (
              <div className="mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                  {job_type === "internship" ? "Internship" : "Full-Time"}
                </span>
              </div>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                <BrainCircuit size={14} />
                <span className="truncate">
                  {skills.slice(0, 3).join(", ")}
                </span>
                {skills.length > 3 && <span>+{skills.length - 3}</span>}
              </div>
            )}

            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin size={14} />
              {location}
            </div>

            {/* Candidates to Hire */}
            {candidates_to_hire && (
              <div className="text-xs text-gray-500 mt-1">
                Target: {candidates_to_hire} candidate
                {candidates_to_hire > 1 ? "s" : ""}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <MoreVertical size={16} className="text-gray-400" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar - Show for ongoing drives */}
      {isOngoing && (
        <div className="px-4 py-3 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700">
                {driveProgress.text}
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-700">
              {driveProgress.percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`${getProgressColor()} h-2.5 rounded-full transition-all duration-300`}
              style={{ width: `${driveProgress.percentage}%` }}
            ></div>
          </div>
          {daysRemaining !== null && (
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
              <Clock size={12} />
              <span>
                {daysRemaining > 0
                  ? `${daysRemaining} day${daysRemaining > 1 ? "s" : ""
                  } remaining`
                  : "Drive ends today"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Date Range */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Calendar size={14} />
          <span>
            {formatDate(start_date)} - {formatDate(end_date)}
          </span>
        </div>

        {/* Interview Rounds */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Interview Rounds ({rounds?.length || 0})
          </h4>
          <div className="flex flex-wrap gap-1">
            {rounds?.slice(0, 3).map((round, index) => {
              // Check if this round has status info
              const roundStatus = round_statuses?.find(
                (rs) => rs.round_number === index + 1
              );

              let roundBgColor = "bg-gray-100";
              let roundTextColor = "text-gray-700";

              if (roundStatus) {
                if (roundStatus.status === "completed") {
                  roundBgColor = "bg-green-100";
                  roundTextColor = "text-green-700";
                } else if (roundStatus.status === "in_progress") {
                  roundBgColor = "bg-blue-100";
                  roundTextColor = "text-blue-700";
                }
              }

              return (
                <span
                  key={index}
                  className={`px-2 py-1 ${roundBgColor} ${roundTextColor} rounded text-xs font-medium flex items-center gap-1`}
                >
                  {roundStatus?.status === "in_progress" && (
                    <PlayCircle size={10} className="animate-spin" />
                  )}
                  {roundStatus?.status === "completed" && (
                    <CheckCircle size={10} />
                  )}
                  {round.type}
                </span>
              );
            })}
            {rounds && rounds.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                +{rounds.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onView}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-black transition-colors"
        >
          <Eye size={16} />
          View Drive
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-lg border-t border-gray-300">
        <div className="text-xs text-gray-500">
          Created on {formatDate(created_at)}
        </div>
      </div>
    </div>
  );
};

export default DriveCard;
