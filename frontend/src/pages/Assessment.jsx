import { useState, useEffect, useRef } from "react";
import { Sun, Moon, Maximize } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Instructions from "./Instructions";
import Sidebar from "../components/CodingAssessment/Sidebar";
import Problem from "../components/CodingAssessment/Problem";
import CodeEditor from "../components/CodingAssessment/CodeEditor";
import Input from "../components/CodingAssessment/Input";
import Output from "../components/CodingAssessment/Output";
import { useParams } from "react-router-dom";
import Loader from "../components/Loader";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Assessment() {
  const { driveId: routeDriveId, candidateId: routeCandidateId } = useParams();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const [driveId, setDriveId] = useState(null);
  const [candidateId, setCandidateId] = useState(null);

  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [timerActive, setTimerActive] = useState(false);

  const [problemCode, setProblemCode] = useState({});
  const [language, setLanguage] = useState("python");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");

  const [problemStatus, setProblemStatus] = useState({});

  // Divider positions
  const [dividerPos, setDividerPos] = useState(50); // Problem vs Editor (horizontal)
  const [editorHeight, setEditorHeight] = useState(70); // Editor height percentage
  const [inputOutputDivider, setInputOutputDivider] = useState(50); // Input vs Output

  // Dragging states
  const [isDragging, setIsDragging] = useState(false);
  const [isVerticalDragging, setIsVerticalDragging] = useState(false);
  const [isInputOutputDragging, setIsInputOutputDragging] = useState(false);

  // Fullscreen states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef(null);
  const rightPanelRef = useRef(null);
  const inputOutputRef = useRef(null);

  const code = problemCode[selectedProblem?._id] || "";

  const setCode = (newCode) => {
    if (selectedProblem) {
      setProblemCode((prev) => ({
        ...prev,
        [selectedProblem._id]: newCode,
      }));
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (selectedProblem) {
      const defaultCode = getDefaultCode(newLanguage);
      setProblemCode((prev) => ({
        ...prev,
        [selectedProblem._id]: defaultCode,
      }));
    }
  };

  // Timer effect
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timerActive, timeRemaining]);

  useEffect(() => {
    if ( problems.length === 0) {
      fetchProblems();
    }
  }, [assessmentStarted]);

  // Fullscreen management
  useEffect(() => {
    if (assessmentStarted) {
      enterFullscreen();
    }
  }, [assessmentStarted]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      // Only show modal if user exits fullscreen and assessment hasn't been submitted
      if (!isCurrentlyFullscreen && assessmentStarted && !isSubmitting) {
        setShowFullscreenModal(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [assessmentStarted, isSubmitting]);

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.error("Error entering fullscreen:", err);
      });
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);

      const urlParams = new URLSearchParams(window.location.search);
      const drive_id = routeDriveId || urlParams.get("drive_id");
      const candidate_id = routeCandidateId || urlParams.get("candidate_id");

      if (!drive_id || !candidate_id) {
        throw new Error("Drive ID and Candidate ID are required");
      }

      setDriveId(drive_id);
      setCandidateId(candidate_id);

      const questionsResponse = await fetch(
        `${BASE_URL}/api/coding-assessment/problem?drive_id=${drive_id}
        `
      );

      if (!questionsResponse.ok) {
        if (questionsResponse.status === 404) {
          throw new Error("No coding questions found for this assessment.");
        }
        throw new Error("Failed to fetch coding questions");
      }

      const questions = await questionsResponse.json();

      if (!questions || questions.length === 0) {
        throw new Error("No coding questions found");
      }

      const transformedQuestions = questions.map((q, index) => ({
        _id: q._id,
        id: q._id,
        number: index + 1,
        title: q.title,
        description: q.description,
        constraints: q.constraints,
        testCases: q.test_cases.map((tc) => ({
          input: tc.input,
          output: tc.output,
        })),
        difficulty: q.difficulty,
        tags: q.tags,
      }));

      setProblems(transformedQuestions);
      setSelectedProblem(transformedQuestions[0]);

      const initialCode = {};
      transformedQuestions.forEach((problem) => {
        initialCode[problem._id] = getDefaultCode(language);
      });
      setProblemCode(initialCode);
    } catch (err) {
      console.error("Error fetching problems:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultCode = (lang) => {
    const templates = {
      python: "# Write your code here\n",
      javascript: "// Write your code here\n",
      java: "// Write your code here\n",
      cpp: "// Write your code here\n",
    };
    return templates[lang] || "";
  };

  const handleStartAssessment = () => {
    setAssessmentStarted(true);
    setTimerActive(true);
  };

  const handleTimeUp = async () => {
    alert("Time's up! Your assessment has been automatically submitted.");
    await handleFinalSubmit();
  };

  const handleRun = async () => {
    if (!selectedProblem || !driveId || !candidateId) {
      setOutput(
        JSON.stringify({
          status: { description: "Error", id: -1 },
          stderr: "Assessment not properly initialized",
        })
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
            language: language,
            time_taken: 3600 - timeRemaining,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit question");
      }

      const data = await response.json();

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
            results: data.results,
          },
          null,
          2
        )
      );
    } catch (err) {
      console.error("Error running code:", err);
      setOutput(
        JSON.stringify({
          status: { description: "Connection Error", id: -1 },
          stderr: err.message,
        })
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!driveId || !candidateId) {
      alert("Assessment not properly initialized");
      return;
    }

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
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Exit fullscreen before navigation
        exitFullscreen();

        // Navigate to submission page
        navigate("/assessment-submission", {
          state: {
            statistics: data.statistics,
            candidateId: candidateId,
            driveId: driveId,
            timeTaken: 3600 - timeRemaining,
          },
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit assessment");
      }
    } catch (err) {
      console.error("Error submitting assessment:", err);
      alert(`Error submitting assessment: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Horizontal divider (Problem vs Editor)
  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const newPos = ((e.clientX - rect.left) / rect.width) * 100;
      if (newPos > 20 && newPos < 80) setDividerPos(newPos);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDragging]);

  // Vertical divider (Editor vs Input/Output)
  const handleVerticalMouseDown = () => setIsVerticalDragging(true);

  useEffect(() => {
    const handleMouseUp = () => setIsVerticalDragging(false);
    const handleMouseMove = (e) => {
      if (!isVerticalDragging || !rightPanelRef.current) return;
      const container = rightPanelRef.current;
      const rect = container.getBoundingClientRect();
      const newPos = ((e.clientY - rect.top) / rect.height) * 100;
      if (newPos > 20 && newPos < 80) setEditorHeight(newPos);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isVerticalDragging]);

  // Input/Output divider
  const handleInputOutputMouseDown = () => setIsInputOutputDragging(true);

  useEffect(() => {
    const handleMouseUp = () => setIsInputOutputDragging(false);
    const handleMouseMove = (e) => {
      if (!isInputOutputDragging || !inputOutputRef.current) return;
      const container = inputOutputRef.current;
      const rect = container.getBoundingClientRect();
      const newPos = ((e.clientX - rect.left) / rect.width) * 100;
      if (newPos > 20 && newPos < 80) setInputOutputDivider(newPos);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isInputOutputDragging]);

  if (!assessmentStarted) {
    console.log(problems.length);
    return (
      <Instructions
        onStartAssessment={handleStartAssessment}
        darkMode={darkMode}
        totalQuestions={problems.length}
        timeLimit={60}
      />
    );
  }

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: darkMode ? "#0d0d0d" : "#ffffff",
          color: darkMode ? "#e0e0e0" : "#000000",
        }}
      >
        <div
          style={{ textAlign: "center", maxWidth: "400px", padding: "40px" }}
        >
          <h2
            style={{
              marginBottom: "12px",
              color: "#dc2626",
              fontWeight: "600",
            }}
          >
            Error loading assessment
          </h2>
          <p
            style={{
              marginBottom: "20px",
              color: darkMode ? "#999999" : "#666666",
            }}
          >
            {error}
          </p>
          <button
            onClick={fetchProblems}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              backgroundColor: darkMode ? "#ffffff" : "#000000",
              color: darkMode ? "#000000" : "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const bgColor = darkMode ? "#0d0d0d" : "#ffffff";
  const borderColor = darkMode ? "#2a2a2a" : "#e5e5e5";

  return (
    <>
      <div
        style={{
          display: "flex",
          height: "100vh",
          backgroundColor: bgColor,
          color: darkMode ? "#e0e0e0" : "#000000",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <Sidebar
          problems={problems}
          selectedProblem={selectedProblem}
          onSelectProblem={setSelectedProblem}
          darkMode={darkMode}
          problemStatus={problemStatus}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 24px",
              borderBottom: `1px solid ${borderColor}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: bgColor,
            }}
          >
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
              Coding Assessment • {problems.length} Problems
            </h2>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  padding: "8px 16px",
                  backgroundColor:
                    timeRemaining < 300
                      ? "#fef2f2"
                      : darkMode
                      ? "#1a1a1a"
                      : "#fafafa",
                  borderRadius: "6px",
                  fontWeight: "700",
                  fontSize: "16px",
                  fontFamily: "monospace",
                  color:
                    timeRemaining < 300
                      ? "#dc2626"
                      : darkMode
                      ? "#e0e0e0"
                      : "#000000",
                  border: `1px solid ${
                    timeRemaining < 300 ? "#dc2626" : borderColor
                  }`,
                }}
              >
                {formatTime(timeRemaining)}
              </div>

              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                style={{
                  padding: "8px 20px",
                  backgroundColor: isSubmitting ? "#16a34a" : "#22c55e",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  transition: "background-color 0.2s",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = "#16a34a";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = "#22c55e";
                  }
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit Assessment"}
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                style={{
                  background: "none",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  color: darkMode ? "#e0e0e0" : "#000000",
                }}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div
            ref={containerRef}
            style={{
              flex: 1,
              display: "flex",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Problem Section */}
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

            {/* Horizontal Divider */}
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
                transition: isDragging ? "none" : "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkMode
                  ? "#333333"
                  : "#e5e5e5";
              }}
              onMouseLeave={(e) => {
                if (!isDragging)
                  e.currentTarget.style.backgroundColor = "transparent";
              }}
            />

            {/* Editor and Input/Output Section */}
            <div
              ref={rightPanelRef}
              style={{
                width: `${100 - dividerPos}%`,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                backgroundColor: bgColor,
                position: "relative",
              }}
            >
              {/* Code Editor - Fixed height with proper container */}
              <div
                style={{
                  height: `${editorHeight}%`,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  position: "relative",
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

              {/* Vertical Divider (between Editor and Input/Output) */}
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
                  transition: isVerticalDragging
                    ? "none"
                    : "background-color 0.2s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode
                    ? "#333333"
                    : "#e5e5e5";
                }}
                onMouseLeave={(e) => {
                  if (!isVerticalDragging)
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
              />

              {/* Input/Output Section */}
              <div
                ref={inputOutputRef}
                style={{
                  height: `${100 - editorHeight}%`,
                  display: "flex",
                  overflow: "hidden",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                {/* Input */}
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

                {/* Input/Output Divider */}
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
                    transition: isInputOutputDragging
                      ? "none"
                      : "background-color 0.2s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = darkMode
                      ? "#333333"
                      : "#e5e5e5";
                  }}
                  onMouseLeave={(e) => {
                    if (!isInputOutputDragging)
                      e.currentTarget.style.backgroundColor = "transparent";
                  }}
                />

                {/* Output */}
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
        </div>
      </div>

      {/* Fullscreen Exit Modal */}
      {showFullscreenModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
              padding: "40px",
              borderRadius: "12px",
              maxWidth: "450px",
              textAlign: "center",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
            }}
          >
            <Maximize
              size={56}
              style={{
                color: "#ef4444",
                marginBottom: "20px",
                strokeWidth: 2,
              }}
            />
            <h2
              style={{
                marginBottom: "16px",
                fontSize: "22px",
                fontWeight: "700",
                color: darkMode ? "#e0e0e0" : "#000000",
              }}
            >
              Please Stay in Fullscreen
            </h2>
            <p
              style={{
                marginBottom: "28px",
                color: darkMode ? "#999" : "#666",
                lineHeight: "1.6",
                fontSize: "15px",
              }}
            >
              You must remain in fullscreen mode during the assessment for
              security purposes. Click the button below to return to fullscreen
              and continue your assessment.
            </p>
            <button
              onClick={() => {
                setShowFullscreenModal(false);
                enterFullscreen();
              }}
              style={{
                padding: "14px 36px",
                backgroundColor: "#22c55e",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#16a34a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#22c55e";
              }}
            >
              Return to Fullscreen
            </button>
          </div>
        </div>
      )}
    </>
  );
}
