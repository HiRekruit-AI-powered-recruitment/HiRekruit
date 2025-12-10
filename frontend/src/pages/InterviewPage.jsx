import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Settings,
  Monitor,
  Loader2,
  AlertCircle,
  Camera,
  CameraOff,
} from "lucide-react";

import Vapi from "@vapi-ai/web";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const InterviewPage = () => {
  const params = useParams();
  const routeDriveId = params.driveId;
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, prompt } = location.state || {};
  // The ID passed from the form may actually be a driveCandidate id (sometimes named `driveId` in state).
  // Prefer an explicit `driveCandidateId` from location.state, fall back to `driveId` or route param.
  const stateDriveId =
    (location &&
      (location.state?.driveCandidateId || location.state?.driveId)) ||
    null;
  const driveCandidateId = stateDriveId || routeDriveId;

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [resumeText, setResumeText] = useState(userData?.resume_content || "");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [vapiClient, setVapiClient] = useState(null);
  const [isVapiReady, setIsVapiReady] = useState(false);
  const [isCheckingCompletion, setIsCheckingCompletion] = useState(true);
  const [interviewAlreadyCompleted, setInterviewAlreadyCompleted] =
    useState(false);
  const [cameraPermission, setCameraPermission] = useState("prompt");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Avatar animation states
  const [mouthOpen, setMouthOpen] = useState(0);
  const [blinkState, setBlinkState] = useState(false);

  const checkInterviewCompletion = useCallback(async () => {
    if (!driveCandidateId) {
      setConnectionError("Drive Candidate ID is required");
      setIsCheckingCompletion(false);
      return;
    }

    try {
      setIsCheckingCompletion(true);
      const response = await fetch(
        `${BASE_URL}/api/interview/candidate/${driveCandidateId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("candidate info :", data);
      if (data.interview_completed && data.interview_completed !== "no") {
        setInterviewAlreadyCompleted(true);
      } else {
        setInterviewAlreadyCompleted(false);
      }
    } catch (error) {
      console.error("Error checking interview completion:", error);
      setConnectionError(`Failed to check interview status: ${error.message}`);
    } finally {
      setIsCheckingCompletion(false);
    }
  }, [driveCandidateId]);

  // Initialize webcam
  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      mediaStreamRef.current = stream;
      setCameraPermission("granted");

      // Setup audio visualization
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      return stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraPermission("denied");
      setConnectionError(
        "Camera access denied. Please allow camera permissions."
      );
      return null;
    }
  }, []);

  // Stop webcam
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // Simulate AI speaking with audio visualization
  useEffect(() => {
    if (interviewStarted && isSpeaking) {
      const interval = setInterval(() => {
        const randomLevel = Math.random() * 0.8 + 0.2;
        setAudioLevel(randomLevel);
        setMouthOpen(randomLevel);
      }, 100);

      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
      setMouthOpen(0);
    }
  }, [interviewStarted, isSpeaking]);

  // Blink animation for avatar
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Simulate speaking patterns
  useEffect(() => {
    if (interviewStarted) {
      const speakingInterval = setInterval(() => {
        setIsSpeaking((prev) => !prev);
      }, 5000);

      return () => clearInterval(speakingInterval);
    }
  }, [interviewStarted]);

  const initializeVapi = useCallback(() => {
    if (interviewAlreadyCompleted) return null;

    const apiKey = import.meta.env.VITE_PUBLIC_VAPI_API_KEY;

    if (!apiKey) {
      setConnectionError("Missing API configuration");
      setIsConnecting(false);
      return null;
    }

    if (!resumeText) {
      setConnectionError("No resume data available");
      setIsConnecting(false);
      return null;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const client = new Vapi(apiKey);
      if (!client) throw new Error("Failed to create VAPI client instance");

      let finalMessages = [];

      client.on("message", (msg) => {
        if (msg.messages && Array.isArray(msg.messages)) {
          finalMessages = msg.messages;
          setConversation([...msg.messages]);

          const lastAssistantMessage = msg.messages
            .filter((m) => m.role === "assistant")
            .pop();
          if (lastAssistantMessage) {
            const questionText =
              lastAssistantMessage.message || lastAssistantMessage.content;
            setCurrentQuestion(questionText);
          }
        }
      });

      client.on("call-start", () => {
        setInterviewStarted(true);
        setIsRecording(true);
        setIsConnecting(false);
        setCurrentQuestion("Interview started. Please introduce yourself.");
        setIsSpeaking(true);
      });

      client.on("call-end", async () => {
        setInterviewStarted(false);
        setIsRecording(false);
        setIsConnecting(false);
        setIsSpeaking(false);

        const conversationOnly = finalMessages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            role: m.role,
            content: m.message || m.content,
            timestamp: m.time,
            secondsFromStart: m.secondsFromStart,
          }));

        if (conversationOnly.length > 0) {
          try {
            const res = await fetch(`${BASE_URL}/api/interview/evaluate`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                resumeText,
                transcript: conversationOnly,
                driveId: driveCandidateId,
              }),
            });

            if (!res.ok) {
              throw new Error(`Evaluation failed: ${res.status}`);
            }

            const evaluationData = await res.json();
            console.log("Interview evaluated:", evaluationData);
          } catch (err) {
            console.error("Evaluation error:", err);
          }
        }
      });

      client.on("error", (error) => {
        setConnectionError(`Connection error: ${error.message || error}`);
        setIsConnecting(false);
        setInterviewStarted(false);
        setIsRecording(false);
        setIsSpeaking(false);
      });

      setVapiClient(client);
      setIsVapiReady(true);
      setIsConnecting(false);

      return client;
    } catch (error) {
      setConnectionError(`Failed to initialize: ${error.message}`);
      setIsConnecting(false);
      setIsVapiReady(false);
      return null;
    }
  }, [resumeText, driveCandidateId, interviewAlreadyCompleted]);

  const handleStartInterview = useCallback(async () => {
    if (!vapiClient || !resumeText || !prompt) {
      setConnectionError("Cannot start interview - missing requirements");
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      await vapiClient.start({
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: prompt }],
        },
        voice: {
          provider: "11labs",
          voiceId: "21m00Tcm4TlvDq8ikWAM",
        },
      });
    } catch (error) {
      setConnectionError(`Failed to start: ${error.message}`);
      setIsConnecting(false);
    }
  }, [vapiClient, resumeText, prompt]);

  const handleEndInterview = useCallback(async () => {
    if (vapiClient && typeof vapiClient.stop === "function") {
      setIsConnecting(true);
      try {
        await vapiClient.stop();
      } catch (error) {
        console.error("Error stopping VAPI client:", error);
      }
    }

    const conversationData = conversation
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role,
        content: m.message || m.content,
        timestamp: m.time,
        secondsFromStart: m.secondsFromStart,
      }));

    setInterviewStarted(false);
    setIsRecording(false);
    setIsConnecting(false);

    navigate("/interview-completion", {
      state: {
        userData,
        driveId: driveCandidateId,
        resumeText,
        conversation: conversationData,
      },
    });
  }, [
    vapiClient,
    conversation,
    navigate,
    userData,
    driveCandidateId,
    resumeText,
  ]);

  useEffect(() => {
    checkInterviewCompletion();
  }, [checkInterviewCompletion]);

  useEffect(() => {
    initializeCamera();
    return () => stopCamera();
  }, [initializeCamera, stopCamera]);

  useEffect(() => {
    let client = null;
    if (
      resumeText &&
      !vapiClient &&
      !isCheckingCompletion &&
      !interviewAlreadyCompleted
    ) {
      client = initializeVapi();
    }

    return () => {
      if (client && typeof client.stop === "function") {
        try {
          const stopPromise = client.stop();
          if (stopPromise && typeof stopPromise.catch === "function") {
            stopPromise.catch(console.error);
          }
        } catch (error) {
          console.error("Error during VAPI cleanup:", error);
        }
      }
    };
  }, [
    resumeText,
    initializeVapi,
    vapiClient,
    isCheckingCompletion,
    interviewAlreadyCompleted,
  ]);

  useEffect(() => {
    if (
      isVapiReady &&
      vapiClient &&
      resumeText &&
      !interviewStarted &&
      !isConnecting &&
      !interviewAlreadyCompleted &&
      cameraPermission === "granted"
    ) {
      const timer = setTimeout(() => {
        handleStartInterview();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    isVapiReady,
    vapiClient,
    resumeText,
    interviewStarted,
    isConnecting,
    handleStartInterview,
    interviewAlreadyCompleted,
    cameraPermission,
  ]);

  const ConnectionStatus = () => {
    if (isCheckingCompletion) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-700 px-3 py-1 border border-gray-300 rounded-full">
          <Loader2 className="w-4 h-4 animate-spin" />
          Checking status...
        </div>
      );
    }

    if (interviewAlreadyCompleted) {
      return (
        <div className="flex items-center gap-2 text-sm text-orange-700 px-3 py-1 border border-orange-500 bg-orange-50 rounded-full">
          <AlertCircle className="w-4 h-4" />
          Already completed
        </div>
      );
    }

    if (isConnecting) {
      return (
        <div className="flex items-center gap-2 text-sm text-blue-700 px-3 py-1 border border-blue-500 bg-blue-50 rounded-full">
          <Loader2 className="w-4 h-4 animate-spin" />
          Connecting...
        </div>
      );
    }

    if (connectionError) {
      return (
        <div className="text-sm text-red-700 px-3 py-1 border border-red-500 bg-red-50 rounded-full">
          Error: {connectionError}
        </div>
      );
    }

    if (interviewStarted) {
      return (
        <div className="flex items-center gap-2 text-sm text-green-700 px-3 py-1 border border-green-500 bg-green-50 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Active
        </div>
      );
    }

    if (isVapiReady) {
      return (
        <div className="text-sm text-gray-700 px-3 py-1 border border-gray-300 rounded-full">
          Ready
        </div>
      );
    }

    return (
      <div className="text-sm text-gray-500 px-3 py-1 border border-gray-300 rounded-full">
        Initializing...
      </div>
    );
  };

  // Animated Avatar Component
  const AnimatedAvatar = () => {
    const eyeHeight = blinkState ? 2 : 12;
    const mouthHeight = mouthOpen * 20;

    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="drop-shadow-lg"
        >
          {/* Head */}
          <circle cx="100" cy="100" r="80" fill="#6366f1" />

          {/* Eyes */}
          <ellipse cx="75" cy="85" rx="12" ry={eyeHeight} fill="white" />
          <ellipse cx="125" cy="85" rx="12" ry={eyeHeight} fill="white" />

          {/* Pupils */}
          {!blinkState && (
            <>
              <circle cx="75" cy="85" r="6" fill="#1e293b" />
              <circle cx="125" cy="85" r="6" fill="#1e293b" />
            </>
          )}

          {/* Mouth */}
          <ellipse
            cx="100"
            cy="120"
            rx="25"
            ry={Math.max(3, mouthHeight)}
            fill="#e11d48"
            className="transition-all duration-100"
          />

          {/* Audio level indicator */}
          {isSpeaking && (
            <>
              <circle
                cx="100"
                cy="100"
                r={80 + audioLevel * 20}
                fill="none"
                stroke="#818cf8"
                strokeWidth="2"
                opacity={audioLevel * 0.5}
                className="transition-all duration-100"
              />
              <circle
                cx="100"
                cy="100"
                r={80 + audioLevel * 30}
                fill="none"
                stroke="#818cf8"
                strokeWidth="1"
                opacity={audioLevel * 0.3}
                className="transition-all duration-100"
              />
            </>
          )}
        </svg>

        {isSpeaking && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-indigo-500 rounded-full transition-all duration-100"
                style={{
                  height: `${
                    (Math.sin(Date.now() / 100 + i) * 0.5 + 0.5) * 20 + 10
                  }px`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (interviewAlreadyCompleted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-white border-2 border-orange-500 rounded-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-black mb-2">
            Interview Already Completed
          </h2>
          <p className="text-gray-700 mb-6">
            You have already completed your interview for this position. Thank
            You!
          </p>
        </div>
      </div>
    );
  }

  if (isCheckingCompletion) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-white border-2 border-black rounded-lg p-8 text-center">
          <Loader2 className="w-16 h-16 text-black mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-black mb-2">
            Preparing Interview
          </h2>
          <p className="text-gray-700">
            Checking your interview status and preparing the session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white border-2 border-black rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-black">
                Live Interview Session
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      interviewStarted ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></div>
                  {userData?.name || "Candidate"} • Interview
                </div>
                <ConnectionStatus />
              </div>
            </div>
            {interviewStarted && (
              <div className="flex items-center gap-2 px-3 py-1 border-2 border-red-500 bg-red-50 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-700">Live</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Video Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* AI Interviewer Section */}
          <div className="bg-white border-2 border-black rounded-lg overflow-hidden">
            <div className="aspect-video relative">
              <AnimatedAvatar />
              {interviewStarted && isSpeaking && (
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium border border-green-700">
                  Speaking
                </div>
              )}
            </div>
            <div className="p-3 border-t-2 border-black">
              <p className="text-sm text-gray-700 italic min-h-[40px]">
                {connectionError ? (
                  <span className="text-red-600 font-medium">
                    Connection Error: {connectionError}
                  </span>
                ) : currentQuestion ? (
                  currentQuestion
                ) : isConnecting ? (
                  "Connecting to interviewer..."
                ) : (
                  "Waiting to start interview..."
                )}
              </p>
            </div>
          </div>

          {/* Candidate Video Section */}
          <div className="bg-white border-2 border-black rounded-lg overflow-hidden relative">
            <div className="aspect-video bg-gray-900 flex items-center justify-center relative overflow-hidden">
              {cameraPermission === "granted" && !isVideoOff ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : cameraPermission === "denied" ? (
                <div className="text-gray-400 text-center p-4">
                  <CameraOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Camera access denied</p>
                  <p className="text-xs mt-1">
                    Please enable camera in settings
                  </p>
                </div>
              ) : isVideoOff ? (
                <div className="text-gray-400 text-center">
                  <VideoOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Video is off</p>
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50 animate-pulse" />
                  <p className="text-sm">Requesting camera access...</p>
                </div>
              )}

              {isRecording && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 font-medium border border-red-700">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Recording
                </div>
              )}

              {isMuted && (
                <div className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full">
                  <MicOff className="w-4 h-4" />
                </div>
              )}

              {isConnecting && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Connecting...</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 border-t-2 border-black">
              <div className="flex items-center justify-between">
                <span className="font-medium text-black">
                  {userData?.name || "Candidate"}
                </span>
                <div className="flex items-center gap-2 px-2 py-1 border rounded-full">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      connectionError
                        ? "bg-red-500"
                        : interviewStarted
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  ></div>
                  <span className="text-xs text-gray-700">
                    {connectionError
                      ? "Error"
                      : interviewStarted
                      ? "Connected"
                      : "Connecting"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white border-2 border-black rounded-lg p-4 flex items-center justify-center gap-4">
          <button
            onClick={toggleAudio}
            disabled={!interviewStarted}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors border-2 ${
              !interviewStarted
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
                : isMuted
                ? "bg-red-500 hover:bg-red-600 text-white border-red-600"
                : "bg-white hover:bg-gray-50 text-black border-black"
            }`}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            disabled={!interviewStarted}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors border-2 ${
              !interviewStarted
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
                : isVideoOff
                ? "bg-red-500 hover:bg-red-600 text-white border-red-600"
                : "bg-white hover:bg-gray-50 text-black border-black"
            }`}
          >
            {isVideoOff ? (
              <VideoOff className="w-5 h-5" />
            ) : (
              <Video className="w-5 h-5" />
            )}
          </button>

          {!interviewStarted ? (
            <button
              onClick={handleStartInterview}
              disabled={
                !isVapiReady ||
                !resumeText ||
                isConnecting ||
                !!connectionError ||
                cameraPermission !== "granted"
              }
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors border-2 ${
                isVapiReady &&
                resumeText &&
                !isConnecting &&
                !connectionError &&
                cameraPermission === "granted"
                  ? "bg-green-500 hover:bg-green-600 text-white border-green-600"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300"
              }`}
            >
              {isConnecting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Phone className="w-5 h-5" />
              )}
            </button>
          ) : (
            <button
              onClick={handleEndInterview}
              className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white border-2 border-red-600 flex items-center justify-center transition-colors"
              title="End Interview"
            >
              <Phone className="w-5 h-5" />
            </button>
          )}

          <button
            disabled={isConnecting}
            className="w-12 h-12 rounded-full bg-white hover:bg-gray-50 text-black border-2 border-black flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            disabled={!interviewStarted || isConnecting}
            className="w-12 h-12 rounded-full bg-white hover:bg-gray-50 text-black border-2 border-black flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <Monitor className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
