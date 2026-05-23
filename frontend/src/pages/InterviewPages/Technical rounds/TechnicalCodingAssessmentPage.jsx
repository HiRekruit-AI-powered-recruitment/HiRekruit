import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  CheckCircle,
  Code2,
  Loader,
  Mic,
  MicOff,
  Moon,
  Sun,
  User,
  Video,
  VideoOff,
} from "lucide-react";
import Sidebar from "../../../components/CodingAssessment/Sidebar";
import Problem from "../../../components/CodingAssessment/Problem";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

function TechnicalInterviewMiniPanel({
  userData,
  currentQuestion,
  isSpeaking,
  isMuted,
  isVideoOff,
  livekitConnected,
  onToggleAudio,
  onToggleVideo,
  onReturnToInterview,
}) {
  const controlButtonClass =
    "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-3 p-4 border-b border-gray-200 bg-white">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-bold text-gray-900">
                AI Interviewer
              </p>
              <span
                className={`w-2 h-2 rounded-full ${
                  isSpeaking ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              />
            </div>
            <p className="text-xs text-gray-500 mb-2">
              {isSpeaking ? "Speaking now" : "Listening while you answer"}
            </p>
            <p className="text-sm text-gray-700 line-clamp-2">
              {currentQuestion ||
                "Ask your doubt out loud. The AI interviewer remains active."}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-gray-300 text-gray-900 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">
              {userData?.name || "Candidate"}
            </p>
            <p className="text-xs text-gray-500 mb-2">
              Technical question task
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onToggleAudio}
                disabled={!livekitConnected}
                title={isMuted ? "Unmute microphone" : "Mute microphone"}
                className={`${controlButtonClass} ${
                  isMuted
                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    : "bg-white text-gray-800 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-3 h-3 text-red-500" />
                ) : (
                  <Mic className="w-3 h-3 text-green-600" />
                )}
                {isMuted ? "Muted" : "Mic on"}
              </button>
              <button
                type="button"
                onClick={onToggleVideo}
                disabled={!livekitConnected}
                title={isVideoOff ? "Turn camera on" : "Turn camera off"}
                className={`${controlButtonClass} ${
                  isVideoOff
                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    : "bg-white text-gray-800 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {isVideoOff ? (
                  <VideoOff className="w-3 h-3 text-red-500" />
                ) : (
                  <Video className="w-3 h-3 text-green-600" />
                )}
                {isVideoOff ? "Camera off" : "Camera on"}
              </button>
              <span className="inline-flex items-center gap-1 rounded-md bg-white border border-gray-200 px-2 py-1 text-xs text-gray-700">
                <span
                  className={`w-2 h-2 rounded-full ${
                    livekitConnected ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />
                {livekitConnected ? "Connected" : "Connecting"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onReturnToInterview}
        className="h-full min-h-[88px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Interview
      </button>
    </div>
  );
}

export default function TechnicalCodingAssessmentPage({
  driveCandidateId,
  driveId,
  candidateId,
  userData,
  currentQuestion,
  isSpeaking,
  isMuted,
  isVideoOff,
  livekitConnected,
  onToggleAudio,
  onToggleVideo,
  onReturnToInterview,
  onAnswersChange,
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchAttempt, setFetchAttempt] = useState(0);
  const [technicalAnswers, setTechnicalAnswers] = useState({});
  const [saveStatus, setSaveStatus] = useState("idle");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [dividerPos, setDividerPos] = useState(45);
  const [isDragging, setIsDragging] = useState(false);
  const hasUserEditedRef = useRef(false);

  const containerRef = useRef(null);

  const technicalAnswer = technicalAnswers[selectedProblem?._id] || "";
  const bgColor = darkMode ? "#0d0d0d" : "#ffffff";
  const borderColor = darkMode ? "#2a2a2a" : "#e5e5e5";
  const textColor = darkMode ? "#e0e0e0" : "#000000";
  const answerStatus = problems.reduce((status, problem) => {
    const answer = technicalAnswers[problem._id] || "";
    if (answer.trim()) {
      status[problem._id] = { result: "Accepted" };
    }
    return status;
  }, {});
  const answeredCount = Object.keys(answerStatus).length;
  const answerPayload = useMemo(
    () =>
      problems.map((problem) => ({
        question_id: problem._id,
        question_text: problem.description,
        answer: technicalAnswers[problem._id] || "",
      })),
    [problems, technicalAnswers],
  );

  const getReadableFetchError = async (response, fallbackMessage) => {
    try {
      const data = await response.json();
      return data?.error || data?.message || fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  const transformTechnicalQuestions = (questions) =>
    questions.map((q, index) => ({
      _id: q._id,
      id: q._id,
      number: index + 1,
      title: q.title || `Technical Question ${index + 1}`,
      description: q.question_text,
      constraints:
        "Write your answer clearly. Explain your reasoning, assumptions, and final solution.",
      testCases: [],
      allTestCasesMetadata: [],
      difficulty: q.difficulty || "medium",
      tags: q.tags || [],
      expectedAnswer: q.expected_answer || "",
      evaluationPoints: q.evaluation_points || [],
    }));

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!driveId || !candidateId) {
          throw new Error(
            "Drive ID and candidate ID are required for the technical question task.",
          );
        }

        const driveRes = await fetch(`${BASE_URL}/api/drive/${driveId}`);
        let drive = {};
        if (driveRes.ok) {
          const driveResult = await driveRes.json();
          drive = driveResult.drive || {};
        }

        const hasTechnicalQuestions =
          Array.isArray(drive.technical_question_ids) &&
          drive.technical_question_ids.length > 0;

        if (!hasTechnicalQuestions) {
          throw new Error(
            "No technical questions are assigned to this drive. Add technical-round questions while creating or editing the drive, then open this task again.",
          );
        }

        const questionsResponse = await fetch(
          `${BASE_URL}/api/coding-assessment/problem/technical?drive_id=${encodeURIComponent(
            driveId,
          )}`,
        );

        if (!questionsResponse.ok) {
          const message = await getReadableFetchError(
            questionsResponse,
            "Failed to fetch technical questions",
          );
          throw new Error(message);
        }

        const questions = await questionsResponse.json();
        const transformedQuestions = transformTechnicalQuestions(questions);

        if (transformedQuestions.length === 0) {
          throw new Error("No technical questions are configured for this drive.");
        }

        setProblems(transformedQuestions);
        setSelectedProblem(transformedQuestions[0]);

        const initialAnswers = {};
        transformedQuestions.forEach((problem) => {
          initialAnswers[problem._id] = "";
        });
        setTechnicalAnswers(initialAnswers);
      } catch (err) {
        console.error("Error fetching technical coding problems:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [candidateId, driveId, fetchAttempt]);

  const handleTechnicalAnswerChange = (value) => {
    if (!selectedProblem) return;

    hasUserEditedRef.current = true;

    setTechnicalAnswers((prev) => {
      const nextAnswers = {
        ...prev,
        [selectedProblem._id]: value,
      };

      onAnswersChange?.(
        problems.map((problem) => ({
          question_id: problem._id,
          question_text: problem.description,
          answer: nextAnswers[problem._id] || "",
        })),
      );

      return nextAnswers;
    });
  };

  useEffect(() => {
    if (!hasUserEditedRef.current) return undefined;
    if (!driveId || !candidateId || problems.length === 0) return undefined;

    const saveTimer = setTimeout(async () => {
      try {
        setSaveStatus("saving");
        const response = await fetch(
          `${BASE_URL}/api/coding-assessment/problem/technical/draft`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              drive_candidate_id: driveCandidateId,
              candidate_id: candidateId,
              drive_id: driveId,
              answers: answerPayload,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to autosave answers");
        }

        setLastSavedAt(new Date());
        setSaveStatus("saved");
      } catch (err) {
        console.error("Error autosaving technical answers:", err);
        setSaveStatus("error");
      }
    }, 1200);

    return () => clearTimeout(saveTimer);
  }, [answerPayload, candidateId, driveCandidateId, driveId, problems.length]);

  const saveNow = async () => {
    if (!driveId || !candidateId || problems.length === 0) return;

    setSaveStatus("saving");
    const response = await fetch(
      `${BASE_URL}/api/coding-assessment/problem/technical/draft`,
      {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            drive_candidate_id: driveCandidateId,
            candidate_id: candidateId,
            drive_id: driveId,
          answers: answerPayload,
          }),
        },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to save technical answers");
    }

    setLastSavedAt(new Date());
    setSaveStatus("saved");
  };

  const handleReturnToInterview = async () => {
    if (hasUserEditedRef.current) {
      try {
        await saveNow();
      } catch (err) {
        console.error("Error saving before returning to interview:", err);
      }
    }

    onReturnToInterview?.();
  };

  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleMouseMove = (e) => {
      if (isDragging && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newPos = ((e.clientX - rect.left) / rect.width) * 100;
        if (newPos > 20 && newPos < 80) setDividerPos(newPos);
      }

    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDragging]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <TechnicalInterviewMiniPanel
        userData={userData}
        currentQuestion={currentQuestion}
        isSpeaking={isSpeaking}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        livekitConnected={livekitConnected}
        onToggleAudio={onToggleAudio}
        onToggleVideo={onToggleVideo}
        onReturnToInterview={handleReturnToInterview}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader className="w-5 h-5 animate-spin" />
            Loading technical questions...
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md rounded-lg border border-red-200 bg-white p-8 text-center shadow-lg">
            <Code2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Technical Questions Unavailable
            </h2>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <button
              type="button"
              onClick={() => setFetchAttempt((prev) => prev + 1)}
              className="px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-100 mr-3"
            >
              Retry
            </button>
              <button
                type="button"
                onClick={handleReturnToInterview}
                className="px-5 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800"
              >
              Return to Interview
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            problems={problems}
            selectedProblem={selectedProblem}
            onSelectProblem={setSelectedProblem}
            darkMode={darkMode}
            problemStatus={answerStatus}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            <div
              className="px-5 py-3 border-b flex items-center justify-between gap-4"
              style={{ borderColor, backgroundColor: bgColor }}
            >
              <div>
                <h2 className="m-0 text-base font-bold">
                  Technical Question Task
                </h2>
                <p className="text-xs text-gray-500">
                  Answer each question in writing. You can ask the AI interviewer for clarification while answering.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600">
                  {saveStatus === "saving"
                    ? "Autosaving..."
                    : saveStatus === "saved"
                      ? `Saved${
                          lastSavedAt
                            ? ` ${lastSavedAt.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}`
                            : ""
                        }`
                      : saveStatus === "error"
                        ? "Autosave failed"
                        : "Autosave ready"}
                </div>

                <button
                  type="button"
                  onClick={() => setDarkMode((prev) => !prev)}
                  className="p-2 rounded-lg border hover:bg-gray-100"
                  style={{ borderColor }}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </div>

            <div
              ref={containerRef}
              className="flex-1 flex overflow-hidden relative"
            >
              <div
                style={{
                  width: `${dividerPos}%`,
                  borderRight: `1px solid ${borderColor}`,
                  overflowY: "auto",
                  padding: "24px",
                  backgroundColor: bgColor,
                }}
              >
                <Problem problem={selectedProblem} darkMode={darkMode} />
              </div>

              <div
                onMouseDown={handleMouseDown}
                style={{
                  width: "4px",
                  backgroundColor: isDragging
                    ? darkMode
                      ? "#444444"
                      : "#cccccc"
                    : "transparent",
                  cursor: "col-resize",
                  flexShrink: 0,
                }}
              />

              <div
                style={{
                  width: `${100 - dividerPos}%`,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  backgroundColor: bgColor,
                  padding: "24px",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold m-0">Your Answer</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Answer the selected question. Use the sidebar to move one
                      by one.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">
                    Question {selectedProblem?.number || 1} of {problems.length}
                  </span>
                </div>

                <textarea
                  value={technicalAnswer}
                  onChange={(e) => handleTechnicalAnswerChange(e.target.value)}
                  placeholder="Type your answer here..."
                  className="flex-1 w-full resize-none rounded-lg border border-gray-300 p-4 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-black"
                  style={{
                    backgroundColor: darkMode ? "#151515" : "#ffffff",
                    color: textColor,
                  }}
                />

                <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                  Your answers are autosaved while the AI interview stays live.
                  Ask doubts out loud whenever you need clarification.
                </div>
              </div>
            </div>

            {answeredCount > 0 && (
              <div className="px-5 py-2 border-t border-gray-200 bg-green-50 text-green-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {answeredCount} of {problems.length} answers drafted and
                included in the final interview evaluation.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
