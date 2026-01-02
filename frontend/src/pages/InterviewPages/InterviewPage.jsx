import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Pause, Shield } from "lucide-react";
import Loader from "../../components/Loader";
import { useLiveKit } from "../../Hooks/InterviewHooks/useLiveKit";
import { useVapi } from "../../Hooks/InterviewHooks/useVapi";
import InterviewHeader from "../../components/Interview/InterviewHeader";
import AIInterviewerPanel from "../../components/Interview/AIInterviewerPanel";
import LocalVideoPanel from "../../components/Interview/LocalVideoPanel";
import RemoteParticipantPanel from "../../components/Interview/RemoteParticipantPanel";
import HRControls from "../../components/Interview/HRControls";
import TranscriptPanel from "../../components/Interview/TranscriptPanel";
import InterviewControls from "../../components/Interview/InterviewControls";
import { AlertCircle } from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const InterviewPage = () => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract user data and role
  const { userData, prompt } = location.state || {};
  const isHR = location.state?.isHR === true;
  const hrName = location.state?.hrName || "HR Manager";

  const driveCandidateId =
    params.driveCandidateId || location.state?.driveCandidateId;
  const interviewType =
    location.state?.interviewType ||
    location.state?.type ||
    params.interviewType ||
    "general";

  // Refs
  const vapiListeningRef = useRef(true);
  const initializingRef = useRef(false);
  const mountedRef = useRef(true);
  const hasInitializedRef = useRef(false);

  // Core interview states
  const [resumeText, setResumeText] = useState(userData?.resume_content || "");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isVapiReady, setIsVapiReady] = useState(false);
  const [isCheckingCompletion, setIsCheckingCompletion] = useState(true);
  const [interviewAlreadyCompleted, setInterviewAlreadyCompleted] =
    useState(false);
  const [cameraPermission, setCameraPermission] = useState("prompt");

  // AI Avatar states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [blinkState, setBlinkState] = useState(false);

  // HR intervention states
  const [hrHandRaised, setHrHandRaised] = useState(false);
  const [aiPaused, setAiPaused] = useState(false);
  const [hrSpeaking, setHrSpeaking] = useState(false);

  // LiveKit states
  const [livekitConnected, setLivekitConnected] = useState(false);
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  const [isLoadingLiveKit, setIsLoadingLiveKit] = useState(true);
  const [localTracks, setLocalTracks] = useState([]);

  // Transcript states
  const [fullTranscript, setFullTranscript] = useState([]);
  const [showTranscript, setShowTranscript] = useState(false);

  // Custom hooks
  const {
    livekitRoomRef,
    localVideoRef,
    initializeLiveKit,
    stopCamera,
    toggleVideo: toggleVideoFn,
    toggleAudio: toggleAudioFn,
  } = useLiveKit({
    driveCandidateId,
    interviewType,
    isHR,
    hrName,
    userData,
    interviewStarted,
    mountedRef,
    hasInitializedRef,
    initializingRef,
    setIsLoadingLiveKit,
    setLivekitConnected,
    setLocalTracks,
    setCameraPermission,
    setConnectionError,
    setFullTranscript,
    setRemoteParticipants,
  });

  const { vapiClientRef, initializeVapi, handleStartInterview } = useVapi({
    resumeText,
    interviewAlreadyCompleted,
    isHR,
    prompt,
    setIsConnecting,
    setConnectionError,
    setIsVapiReady,
    setConversation,
    setFullTranscript,
    setCurrentQuestion,
    setIsSpeaking,
    setInterviewStarted,
    setIsRecording,
    vapiListeningRef,
  });

  // Check if interview is already completed (only for candidates)
  const checkInterviewCompletion = useCallback(async () => {
    if (isHR) {
      console.log("👤 HR detected - Skipping completion check");
      setIsCheckingCompletion(false);
      return;
    }

    if (!driveCandidateId || !interviewType) {
      setConnectionError("Interview ID is required");
      setIsCheckingCompletion(false);
      return;
    }

    try {
      console.log("🔍 Checking if interview is already completed...");
      setIsCheckingCompletion(true);
      const response = await fetch(
        `${BASE_URL}/api/interview/candidate/${driveCandidateId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const roundsStatus = data.rounds_status || [];
      const normalizedInterviewType = interviewType.toLowerCase().trim();

      const currentRound = roundsStatus.find(
        (round) =>
          round.round_type &&
          round.round_type.toLowerCase().trim() === normalizedInterviewType
      );

      const isCompleted = currentRound && currentRound.completed === "yes";
      setInterviewAlreadyCompleted(isCompleted);
      console.log(`✅ Completion check done - Completed: ${isCompleted}`);
    } catch (error) {
      console.error("❌ Error checking interview completion:", error);
      setConnectionError(`Failed to check interview status: ${error.message}`);
    } finally {
      setIsCheckingCompletion(false);
    }
  }, [driveCandidateId, interviewType, isHR]);

  // Toggle video wrapper
  const toggleVideo = useCallback(() => {
    toggleVideoFn(isVideoOff, setIsVideoOff);
  }, [isVideoOff, toggleVideoFn]);

  // Toggle audio wrapper
  const toggleAudio = useCallback(() => {
    toggleAudioFn(isMuted, setIsMuted);
  }, [isMuted, toggleAudioFn]);

  // AI speaking animation
  useEffect(() => {
    if (interviewStarted && isSpeaking && !aiPaused) {
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
  }, [interviewStarted, isSpeaking, aiPaused]);

  // Blink animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Attach video track when localTracks changes
  useEffect(() => {
    if (localTracks.length > 0 && localVideoRef.current) {
      const videoTrack = localTracks.find((t) => t.kind === Track.Kind.Video);
      if (videoTrack) {
        console.log("🎥 Attaching video track from state update");
        const element = videoTrack.attach();
        localVideoRef.current.innerHTML = "";
        localVideoRef.current.appendChild(element);
      }
    }
  }, [localTracks]);

  // End interview
  const handleEndInterview = useCallback(async () => {
    const client = vapiClientRef.current;
    if (client && typeof client.stop === "function") {
      setIsConnecting(true);
      try {
        await client.stop();
        console.log("✅ Vapi stopped");
      } catch (error) {
        console.error("❌ Error stopping VAPI client:", error);
      }
    }

    stopCamera();

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

    if (!isHR) {
      console.log("✅ Navigating to completion page");
      navigate("/interview-completion", {
        state: {
          userData,
          driveCandidateId,
          interviewType,
          resumeText,
          conversation: conversationData,
        },
      });
    } else {
      alert("You have left the interview session.");
      navigate(-1);
    }
  }, [
    conversation,
    navigate,
    userData,
    driveCandidateId,
    resumeText,
    interviewType,
    stopCamera,
    isHR,
    vapiClientRef,
  ]);

  // HR Intervention Functions
  const handleHrHandRaise = useCallback(() => {
    if (!interviewStarted) return;
    console.log("✋ HR raised hand - PAUSING AI");
    vapiListeningRef.current = false;
    setHrHandRaised(true);
    setAiPaused(true);
    setIsSpeaking(false);
    const hrInterventionMessage = {
      role: "system",
      content: `🛑 AI Paused - ${hrName} requested to speak`,
      timestamp: new Date().toISOString(),
    };
    setFullTranscript((prev) => [...prev, hrInterventionMessage]);
  }, [interviewStarted, hrName]);

  const handleHrStartSpeaking = useCallback(() => {
    console.log("🎤 HR started speaking");
    setHrSpeaking(true);
    setHrHandRaised(false);
    const hrSpeakingMessage = {
      role: "system",
      content: `🎤 ${hrName} is now speaking`,
      timestamp: new Date().toISOString(),
    };
    setFullTranscript((prev) => [...prev, hrSpeakingMessage]);
  }, [hrName]);

  const handleHrStopSpeaking = useCallback(() => {
    console.log("🎤 HR stopped speaking - RESUMING AI");
    vapiListeningRef.current = true;
    setHrSpeaking(false);
    setAiPaused(false);
    const resumeMessage = {
      role: "system",
      content: `▶️ AI Resumed - ${hrName} finished speaking`,
      timestamp: new Date().toISOString(),
    };
    setFullTranscript((prev) => [...prev, resumeMessage]);
    setCurrentQuestion("Thank you. Let me continue with the next question...");
  }, [hrName]);

  const handleResumeAI = useCallback(() => {
    console.log("▶️ AI resumed manually");
    vapiListeningRef.current = true;
    setAiPaused(false);
    setHrHandRaised(false);
    setHrSpeaking(false);
    const resumeMessage = {
      role: "system",
      content: "▶️ AI Resumed",
      timestamp: new Date().toISOString(),
    };
    setFullTranscript((prev) => [...prev, resumeMessage]);
  }, []);

  // STEP 1: Check completion (candidates only) - RUNS ONCE
  useEffect(() => {
    if (!isHR) {
      console.log("📋 STEP 1: Checking interview completion");
      checkInterviewCompletion();
    } else {
      console.log("👤 STEP 1: HR mode - skipping completion check");
      setIsCheckingCompletion(false);
    }
  }, []);

  // STEP 2: Initialize LiveKit (when ready) - RUNS ONCE
  useEffect(() => {
    const shouldInitLiveKit = isHR
      ? !isCheckingCompletion
      : !isCheckingCompletion && !interviewAlreadyCompleted;

    if (
      shouldInitLiveKit &&
      !hasInitializedRef.current &&
      !initializingRef.current
    ) {
      console.log("🎥 STEP 2: Initializing LiveKit");
      initializeLiveKit();
    }
  }, [
    isCheckingCompletion,
    interviewAlreadyCompleted,
    isHR,
    initializeLiveKit,
  ]);

  // STEP 3: Initialize Vapi (candidates only, after LiveKit)
  useEffect(() => {
    if (
      !isHR &&
      !interviewAlreadyCompleted &&
      !isCheckingCompletion &&
      livekitConnected &&
      !isLoadingLiveKit &&
      resumeText &&
      !vapiClientRef.current
    ) {
      console.log("🤖 STEP 3: Initializing Vapi for candidate");
      const client = initializeVapi();

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
    }
  }, [
    isHR,
    interviewAlreadyCompleted,
    isCheckingCompletion,
    livekitConnected,
    isLoadingLiveKit,
    resumeText,
    initializeVapi,
  ]);

  // STEP 4: Auto-start interview (candidates only, when everything ready)
  useEffect(() => {
    if (
      !isHR &&
      isVapiReady &&
      vapiClientRef.current &&
      resumeText &&
      !interviewStarted &&
      !isConnecting &&
      !interviewAlreadyCompleted &&
      livekitConnected &&
      (cameraPermission === "granted" || cameraPermission === "denied")
    ) {
      console.log("🎬 STEP 4: Auto-starting interview");
      const timer = setTimeout(() => {
        handleStartInterview();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [
    isHR,
    isVapiReady,
    resumeText,
    interviewStarted,
    isConnecting,
    handleStartInterview,
    interviewAlreadyCompleted,
    cameraPermission,
    livekitConnected,
  ]);

  // Component unmount cleanup - CRITICAL
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      console.log("🧹 Component unmounting - cleaning up");
      mountedRef.current = false;

      if (
        vapiClientRef.current &&
        typeof vapiClientRef.current.stop === "function"
      ) {
        try {
          vapiClientRef.current.stop().catch(console.error);
        } catch (error) {
          console.error("Error stopping Vapi on unmount:", error);
        }
      }

      // Use ref instead of state for cleanup
      if (livekitRoomRef.current) {
        try {
          // Get tracks from room participant instead of state
          const participant = livekitRoomRef.current.localParticipant;
          if (participant) {
            participant.tracks.forEach((publication) => {
              const track = publication.track;
              if (track) {
                try {
                  track.detach();
                  track.stop();
                } catch (err) {
                  console.error("Error stopping track:", err);
                }
              }
            });
          }

          livekitRoomRef.current.disconnect();
        } catch (error) {
          console.error("Error disconnecting room on unmount:", error);
        }
      }
    };
  }, []); // Empty array - only cleanup on actual unmount

  // Show loader during initial setup
  if (!isHR && (isCheckingCompletion || isLoadingLiveKit)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-white border-3 border-gray-900 rounded-2xl p-8 text-center shadow-2xl">
          <Loader className="w-20 h-20 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {isCheckingCompletion
              ? "Preparing Interview"
              : "Connecting to Interview Room"}
          </h2>
          <p className="text-gray-600 text-lg">
            {isCheckingCompletion
              ? "Checking interview status..."
              : "Setting up video and audio..."}
          </p>
          <p className="text-indigo-600 text-sm mt-4 font-medium">
            💡 HR can join anytime during the interview
          </p>
        </div>
      </div>
    );
  }

  // HR loader
  if (isHR && isLoadingLiveKit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-white border-3 border-gray-900 rounded-2xl p-8 text-center shadow-2xl">
          <Loader className="w-20 h-20 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Joining Interview Room
          </h2>
          <p className="text-gray-600 text-lg">Connecting as HR observer...</p>
        </div>
      </div>
    );
  }

  // Early return for completed interview
  if (interviewAlreadyCompleted && !isHR) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-white border-3 border-orange-500 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Interview Already Completed
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            You have already completed your interview for this position. Thank
            you!
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Calculate grid layout
  const totalParticipants = 2 + remoteParticipants.length;
  const gridCols =
    totalParticipants <= 2
      ? "lg:grid-cols-2"
      : totalParticipants === 3
      ? "lg:grid-cols-3"
      : "lg:grid-cols-2";

  // Check if any HR is present
  const hrPresent = remoteParticipants.some((p) =>
    p.identity.startsWith("hr_")
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* AI Paused Global Indicator */}
      {aiPaused && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-yellow-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-pulse border-2 border-yellow-600">
            <Pause className="w-5 h-5" />
            <span className="font-bold">AI Paused - HR Speaking</span>
          </div>
        </div>
      )}

      {/* HR Present Indicator (for candidate) */}
      {!isHR && hrPresent && !aiPaused && (
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-purple-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 border-2 border-purple-700">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-semibold">HR Observing</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <InterviewHeader
          isHR={isHR}
          hrName={hrName}
          userData={userData}
          interviewType={interviewType}
          remoteParticipants={remoteParticipants}
          interviewStarted={interviewStarted}
          connectionError={connectionError}
          isCheckingCompletion={isCheckingCompletion}
          interviewAlreadyCompleted={interviewAlreadyCompleted}
          isLoadingLiveKit={isLoadingLiveKit}
          isConnecting={isConnecting}
          isVapiReady={isVapiReady}
          livekitConnected={livekitConnected}
        />

        {/* Dynamic Video Grid */}
        <div className={`grid grid-cols-1 ${gridCols} gap-6 mb-6`}>
          {/* AI Interviewer Section */}
          <AIInterviewerPanel
            blinkState={blinkState}
            mouthOpen={mouthOpen}
            isSpeaking={isSpeaking}
            aiPaused={aiPaused}
            audioLevel={audioLevel}
            hrHandRaised={hrHandRaised}
            interviewStarted={interviewStarted}
            connectionError={connectionError}
            currentQuestion={currentQuestion}
            isConnecting={isConnecting}
            isHR={isHR}
          />

          {/* Local Participant Video */}
          <LocalVideoPanel
            localVideoRef={localVideoRef}
            cameraPermission={cameraPermission}
            isVideoOff={isVideoOff}
            livekitConnected={livekitConnected}
            isRecording={isRecording}
            isMuted={isMuted}
            isHR={isHR}
            hrName={hrName}
            userData={userData}
            showTranscript={showTranscript}
            setShowTranscript={setShowTranscript}
          />

          {/* Remote Participants */}
          {remoteParticipants.map((participant) => (
            <RemoteParticipantPanel
              key={participant.sid}
              participant={participant}
            />
          ))}
        </div>

        {/* HR Controls */}
        {isHR && (
          <HRControls
            livekitConnected={livekitConnected}
            interviewStarted={interviewStarted}
            aiPaused={aiPaused}
            hrHandRaised={hrHandRaised}
            hrSpeaking={hrSpeaking}
            hrName={hrName}
            handleHrHandRaise={handleHrHandRaise}
            handleHrStartSpeaking={handleHrStartSpeaking}
            handleHrStopSpeaking={handleHrStopSpeaking}
            handleResumeAI={handleResumeAI}
          />
        )}

        {/* Transcript Panel */}
        {showTranscript && (
          <TranscriptPanel
            fullTranscript={fullTranscript}
            userData={userData}
            isHR={isHR}
          />
        )}

        {/* Controls Bar */}
        <InterviewControls
          livekitConnected={livekitConnected}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          interviewStarted={interviewStarted}
          isHR={isHR}
          showTranscript={showTranscript}
          hrPresent={hrPresent}
          isVapiReady={isVapiReady}
          cameraPermission={cameraPermission}
          toggleAudio={toggleAudio}
          toggleVideo={toggleVideo}
          handleEndInterview={handleEndInterview}
          setShowTranscript={setShowTranscript}
        />
      </div>
    </div>
  );
};

export default InterviewPage;
