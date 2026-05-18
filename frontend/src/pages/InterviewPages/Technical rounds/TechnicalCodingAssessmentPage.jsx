import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  CheckCircle,
  Code2,
  Loader,
  Mic,
  MicOff,
  Moon,
  Send,
  Sun,
  User,
  Video,
  VideoOff,
} from "lucide-react";
import Sidebar from "../../../components/CodingAssessment/Sidebar";
import Problem from "../../../components/CodingAssessment/Problem";
import CodeEditor from "../../../components/CodingAssessment/CodeEditor";
import Input from "../../../components/CodingAssessment/Input";
import Output from "../../../components/CodingAssessment/Output";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";
const DEFAULT_DURATION_SECONDS = 30 * 60;

const getDefaultCode = (lang) => {
  const templates = {
    python: "# Write your code here\n",
    javascript: "// Write your code here\n",
    java: "// Write your code here\n",
    cpp: "// Write your code here\n",
  };

  return templates[lang] || "";
};

const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;

  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

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
              {isSpeaking ? "Speaking now" : "Listening while you code"}
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
              Technical coding task
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
  onComplete,
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchAttempt, setFetchAttempt] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_DURATION_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [totalDuration, setTotalDuration] = useState(DEFAULT_DURATION_SECONDS);
  const [problemCode, setProblemCode] = useState({});
  const [language, setLanguage] = useState("python");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [problemStatus, setProblemStatus] = useState({});
  const [dividerPos, setDividerPos] = useState(45);
  const [editorHeight, setEditorHeight] = useState(68);
  const [inputOutputDivider, setInputOutputDivider] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isVerticalDragging, setIsVerticalDragging] = useState(false);
  const [isInputOutputDragging, setIsInputOutputDragging] = useState(false);

  const containerRef = useRef(null);
  const rightPanelRef = useRef(null);
  const inputOutputRef = useRef(null);

  const code = problemCode[selectedProblem?._id] || "";
  const bgColor = darkMode ? "#0d0d0d" : "#ffffff";
  const borderColor = darkMode ? "#2a2a2a" : "#e5e5e5";
  const textColor = darkMode ? "#e0e0e0" : "#000000";

  const setCode = (newCode) => {
    if (!selectedProblem) return;

    setProblemCode((prev) => ({
      ...prev,
      [selectedProblem._id]: newCode,
    }));
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);

    if (selectedProblem) {
      setProblemCode((prev) => ({
        ...prev,
        [selectedProblem._id]: getDefaultCode(newLanguage),
      }));
    }
  };

  const getReadableFetchError = async (response, fallbackMessage) => {
    try {
      const data = await response.json();
      return data?.error || data?.message || fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  const transformQuestions = (questions) =>
    questions.map((q, index) => ({
      _id: q._id,
      id: q._id,
      number: index + 1,
      title: q.title,
      description: q.description,
      constraints: q.constraints || "",
      testCases: (q.test_cases || [])
        .filter((tc) => tc.type === "public")
        .map((tc) => ({ input: tc.input, output: tc.output })),
      allTestCasesMetadata: (q.test_cases || []).map((tc) => tc.type),
      difficulty: q.difficulty,
      tags: q.tags || [],
    }));

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!driveId || !candidateId) {
          throw new Error(
            "Drive ID and candidate ID are required for the coding task.",
          );
        }

        const driveRes = await fetch(`${BASE_URL}/api/drive/${driveId}`);
        let drive = {};
        if (driveRes.ok) {
          const driveResult = await driveRes.json();
          drive = driveResult.drive || {};
          const hrs = parseInt(drive.assessment_duration_hours, 10) || 0;
          const mins = parseInt(drive.assessment_duration_minutes, 10) || 0;
          const allocatedSeconds = hrs * 3600 + mins * 60;
          let finalTime = allocatedSeconds || DEFAULT_DURATION_SECONDS;
          const activeRound = drive.round_statuses?.find(
            (round) => round.round_number === drive.current_round,
          );

          if (activeRound?.deadline && activeRound.deadline !== "null") {
            const deadlineDate = new Date(activeRound.deadline);
            const secondsUntilRoundEnd = Math.floor(
              (deadlineDate - new Date()) / 1000,
            );

            if (secondsUntilRoundEnd > 0) {
              finalTime = Math.min(finalTime, secondsUntilRoundEnd);
            }
          }

          setTotalDuration(finalTime);
          setTimeRemaining(finalTime);
        }

        if (
          Array.isArray(drive.coding_question_ids) &&
          drive.coding_question_ids.length === 0
        ) {
          throw new Error(
            "No coding questions are assigned to this drive. Add coding questions while creating or editing the drive, then open this task again.",
          );
        }

        const questionsResponse = await fetch(
          `${BASE_URL}/api/coding-assessment/problem/?drive_id=${encodeURIComponent(
            driveId,
          )}`,
        );

        if (!questionsResponse.ok) {
          const message = await getReadableFetchError(
            questionsResponse,
            "Failed to fetch coding questions",
          );
          throw new Error(message);
        }

        const questions = await questionsResponse.json();
        const transformedQuestions = transformQuestions(questions);

        if (transformedQuestions.length === 0) {
          throw new Error("No coding questions are configured for this drive.");
        }

        setProblems(transformedQuestions);
        setSelectedProblem(transformedQuestions[0]);

        const initialCode = {};
        transformedQuestions.forEach((problem) => {
          initialCode[problem._id] = getDefaultCode(language);
        });
        setProblemCode(initialCode);
        setStartTime(Date.now());
        setTimerActive(true);
      } catch (err) {
        console.error("Error fetching technical coding problems:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [candidateId, driveId, fetchAttempt, language]);

  useEffect(() => {
    if (!timerActive || timeRemaining <= 0) return undefined;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, timeRemaining]);

  useEffect(() => {
    if (timeRemaining === 0 && timerActive === false && problems.length > 0) {
      handleFinalSubmit();
    }
  }, [timeRemaining, timerActive, problems.length]);

  const handleRun = async () => {
    if (!selectedProblem || !driveId || !candidateId) {
      setOutput(
        JSON.stringify(
          {
            status: { description: "Error", id: -1 },
            stderr: "Coding task is not properly initialized",
          },
          null,
          2,
        ),
      );
      return;
    }

    try {
      setIsRunning(true);
      setOutput("Running...");

      const response = await fetch(
        `${BASE_URL}/api/coding-assessment/submission/submit-question`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidate_id: candidateId,
            drive_id: driveId,
            question_id: selectedProblem._id,
            source_code: code,
            language,
            time_taken: totalDuration - timeRemaining,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to run code");
      }

      const data = await response.json();
      const testCaseTypes = selectedProblem.allTestCasesMetadata || [];
      const filteredResults = (data.results || []).map((res, idx) => {
        const isPrivate = testCaseTypes[idx] === "private";

        if (isPrivate) {
          return {
            ...res,
            type: "private",
            stdin: "[Hidden]",
            expected: "[Hidden]",
            stdout: res.status?.id === 3 ? "[Hidden]" : "Hidden case failed",
            stderr: res.stderr ? "Error in hidden case" : null,
          };
        }

        return {
          ...res,
          type: "public",
        };
      });

      setProblemStatus((prev) => ({
        ...prev,
        [selectedProblem._id]: {
          result: data.result,
          testCasesPassed: data.test_cases_passed,
          totalTestCases: data.total_test_cases,
        },
      }));

      setOutput(
        JSON.stringify(
          {
            success: data.success,
            result: data.result,
            test_cases_passed: data.test_cases_passed,
            total_test_cases: data.total_test_cases,
            results: filteredResults,
          },
          null,
          2,
        ),
      );
    } catch (err) {
      console.error("Error running code:", err);
      setOutput(
        JSON.stringify(
          {
            status: { description: "Connection Error", id: -1 },
            stderr: err.message,
          },
          null,
          2,
        ),
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!driveId || !candidateId || isSubmitting) return;

    const timeSpentSeconds = startTime
      ? Math.floor((Date.now() - startTime) / 1000)
      : totalDuration - timeRemaining;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${BASE_URL}/api/coding-assessment/submission/final-submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidate_id: candidateId,
            drive_id: driveId,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit coding task");
      }

      const data = await response.json();
      setTimerActive(false);

      onComplete?.({
        statistics: data.statistics,
        candidateId,
        driveId,
        timeTaken: timeSpentSeconds,
        problemStatus,
      });
    } catch (err) {
      console.error("Error submitting technical coding task:", err);
      alert(`Error submitting coding task: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleVerticalMouseDown = () => setIsVerticalDragging(true);
  const handleInputOutputMouseDown = () => setIsInputOutputDragging(true);

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsVerticalDragging(false);
      setIsInputOutputDragging(false);
    };

    const handleMouseMove = (e) => {
      if (isDragging && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newPos = ((e.clientX - rect.left) / rect.width) * 100;
        if (newPos > 20 && newPos < 80) setDividerPos(newPos);
      }

      if (isVerticalDragging && rightPanelRef.current) {
        const rect = rightPanelRef.current.getBoundingClientRect();
        const newPos = ((e.clientY - rect.top) / rect.height) * 100;
        if (newPos > 20 && newPos < 80) setEditorHeight(newPos);
      }

      if (isInputOutputDragging && inputOutputRef.current) {
        const rect = inputOutputRef.current.getBoundingClientRect();
        const newPos = ((e.clientX - rect.left) / rect.width) * 100;
        if (newPos > 20 && newPos < 80) setInputOutputDivider(newPos);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDragging, isInputOutputDragging, isVerticalDragging]);

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
        onReturnToInterview={onReturnToInterview}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader className="w-5 h-5 animate-spin" />
            Loading coding task...
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md rounded-lg border border-red-200 bg-white p-8 text-center shadow-lg">
            <Code2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Coding Task Unavailable
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
              onClick={onReturnToInterview}
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
            problemStatus={problemStatus}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            <div
              className="px-5 py-3 border-b flex items-center justify-between gap-4"
              style={{ borderColor, backgroundColor: bgColor }}
            >
              <div>
                <h2 className="m-0 text-base font-bold">
                  Technical Coding Task
                </h2>
                <p className="text-xs text-gray-500">
                  You can ask the AI interviewer questions while solving.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`px-4 py-2 rounded-lg border font-mono font-bold ${
                    timeRemaining < 300
                      ? "bg-red-50 text-red-600 border-red-300"
                      : ""
                  }`}
                  style={{
                    borderColor: timeRemaining < 300 ? "#dc2626" : borderColor,
                    color:
                      timeRemaining < 300
                        ? "#dc2626"
                        : darkMode
                          ? "#e0e0e0"
                          : "#000000",
                  }}
                >
                  {formatTime(timeRemaining)}
                </div>

                <button
                  type="button"
                  onClick={() => setDarkMode((prev) => !prev)}
                  className="p-2 rounded-lg border hover:bg-gray-100"
                  style={{ borderColor }}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-bold flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit & Return
                    </>
                  )}
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
                ref={rightPanelRef}
                style={{
                  width: `${100 - dividerPos}%`,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  backgroundColor: bgColor,
                }}
              >
                <div
                  style={{
                    height: `${editorHeight}%`,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <CodeEditor
                    code={code}
                    setCode={setCode}
                    language={language}
                    setLanguage={handleLanguageChange}
                    onRun={handleRun}
                    darkMode={darkMode}
                    isRunning={isRunning}
                  />
                </div>

                <div
                  onMouseDown={handleVerticalMouseDown}
                  style={{
                    height: "4px",
                    width: "100%",
                    backgroundColor: isVerticalDragging
                      ? darkMode
                        ? "#444444"
                        : "#cccccc"
                      : "transparent",
                    cursor: "row-resize",
                    flexShrink: 0,
                  }}
                />

                <div
                  ref={inputOutputRef}
                  style={{
                    height: `${100 - editorHeight}%`,
                    display: "flex",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: `${inputOutputDivider}%`,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Input
                      customInput={customInput}
                      setCustomInput={setCustomInput}
                      darkMode={darkMode}
                    />
                  </div>

                  <div
                    onMouseDown={handleInputOutputMouseDown}
                    style={{
                      width: "4px",
                      backgroundColor: isInputOutputDragging
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
                      width: `${100 - inputOutputDivider}%`,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Output output={output} darkMode={darkMode} />
                  </div>
                </div>
              </div>
            </div>

            {Object.keys(problemStatus).length > 0 && (
              <div className="px-5 py-2 border-t border-gray-200 bg-green-50 text-green-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Progress saved. Submit when you are ready to return to the AI
                interview.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
