import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { AlertCircle, Shield } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";
import useLiveKit from "../../Hooks/InterviewHooks/useLiveKit";
import { useVapi } from "../../Hooks/InterviewHooks/useVapi";
import InterviewHeader from "../../components/Interview/InterviewHeader";
import AIInterviewerPanel from "../../components/Interview/AIInterviewerPanel";
import LocalVideoPanel from "../../components/Interview/LocalVideoPanel";
import RemoteParticipantPanel from "../../components/Interview/RemoteParticipantPanel";
import HRControls from "../../components/Interview/HRControls";
import TranscriptPanel from "../../components/Interview/TranscriptPanel";
import InterviewControls from "../../components/Interview/InterviewControls";
import DependencyPipeline from "../../components/Interview/DependencyPipeline";

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
  const livekitRoomRef = useRef(null); // 🔴 NEW: Create livekitRoomRef here to pass to both hooks

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

  // Resume support (localStorage)
  const [initialConversation, setInitialConversation] = useState(null);
  const [resumePending, setResumePending] = useState(false);
  const resumeAutoStartRef = useRef(false);

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

  // 🔴 COMPREHENSIVE: Ready state - wait for ALL initialization before showing UI
  const [isFullyReady, setIsFullyReady] = useState(false);

  // 🔴 ENHANCED: Track individual dependency states for optimal loading sequence
  const [dependencyStates, setDependencyStates] = useState({
    completionCheck: false, // Interview completion check done
    livekit: false, // LiveKit connected and loaded
    vapi: false, // VAPI initialized and ready
    permissions: false, // Camera/microphone permissions resolved
    connection: false, // LiveKit connection established
    videoElement: false, // Video element mounted and ready
    audioContext: false, // Web Audio API context ready
    vapiAudio: false, // VAPI audio capture configured
  });

  // 🔴 NEW: Loading stage tracking for progressive UI feedback
  const [loadingStage, setLoadingStage] = useState("initializing");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(
    "Initializing interview...",
  );
  const [loadingSubtext, setLoadingSubtext] = useState(
    "Please wait while we prepare everything",
  );

  // 🔴 NEW: Add buffer state to ensure all components are fully rendered
  const [isRenderBufferComplete, setIsRenderBufferComplete] = useState(false);

  // Calculate HR presence from remote participants
  const hrPresent = remoteParticipants.length > 0;

  // Calculate grid columns based on number of participants
  const gridCols =
    remoteParticipants.length > 0 ? "lg:grid-cols-3" : "lg:grid-cols-2";

  // Transcript states
  const [fullTranscript, setFullTranscript] = useState([]);
  const [showTranscript, setShowTranscript] = useState(false);

  // Custom hooks - REORDERED: useLiveKit must be called first to get localVideoRef
  const {
    // livekitRoomRef, // 🔴 Don't destructure - we already have it from our own ref
    localVideoRef,
    localVideoTrackRef,
    localAudioTrackRef,
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
    // onRemoteParticipantJoin: restoreAudioAfterRemoteJoin, // 🔴 REMOVED: Not needed here
    livekitRoomRef, // 🔴 PASS OUR OWN REF
  });

  const {
    vapiClientRef,
    initializeVapi,
    handleStartInterview,
    updateMuteState,
    restoreAudioAfterRemoteJoin, // 🔴 GET THIS FIRST
    captureAndPublishVapiAudio, // 🔴 NEW: Capture Vapi audio and publish to LiveKit
  } = useVapi({
    resumeText,
    interviewAlreadyCompleted,
    isHR,
    prompt,
    initialConversation,
    setIsConnecting,
    setConnectionError,
    setIsVapiReady,
    setConversation,
    setFullTranscript,
    setCurrentQuestion,
    setIsSpeaking,
    setInterviewStarted,
    setIsRecording,
    interviewStarted, // 🔴 NEW: Pass interviewStarted state
    vapiListeningRef,
    livekitRoomRef, // 🔴 PASS THIS INSTEAD OF NULL
    localVideoRef, // 🔴 NEW: Pass localVideoRef for synchronization
  });

  const interviewStorageKey = useMemo(() => {
    if (!driveCandidateId || !interviewType) return null;
    return `interview_state:${driveCandidateId}:${String(interviewType).toLowerCase()}`;
  }, [driveCandidateId, interviewType]);

  // Load saved state (candidate only). This lets VAPI start with prior context after reload.
  useEffect(() => {
    if (isHR) return;
    if (!interviewStorageKey) return;

    try {
      const raw = localStorage.getItem(interviewStorageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!parsed) return;

      const ts = parsed.savedAt;
      const isFresh =
        typeof ts === "number" && Date.now() - ts < 6 * 60 * 60 * 1000;
      if (!isFresh) {
        localStorage.removeItem(interviewStorageKey);
        return;
      }

      if (
        Array.isArray(parsed.conversation) &&
        parsed.conversation.length > 0
      ) {
        setInitialConversation(parsed.conversation);
        setConversation(parsed.conversation);
        setResumePending(true);
      }

      if (
        Array.isArray(parsed.fullTranscript) &&
        parsed.fullTranscript.length > 0
      ) {
        setFullTranscript(parsed.fullTranscript);
      }

      if (
        typeof parsed.currentQuestion === "string" &&
        parsed.currentQuestion
      ) {
        setCurrentQuestion(parsed.currentQuestion);
      }

      console.log("♻️ Restored interview state from localStorage", {
        key: interviewStorageKey,
        conversationLength: parsed.conversation?.length || 0,
        transcriptLength: parsed.fullTranscript?.length || 0,
      });
    } catch (e) {
      console.warn("⚠️ Failed to restore interview state", e);
    }
  }, [
    isHR,
    interviewStorageKey,
    setConversation,
    setCurrentQuestion,
    setFullTranscript,
  ]);

  // Auto-resume: once core dependencies + VAPI are ready, start a new VAPI call seeded with previous context.
  useEffect(() => {
    if (isHR) return;
    if (!resumePending) return;
    if (resumeAutoStartRef.current) return;
    if (interviewAlreadyCompleted) return;
    if (connectionError) return;

    const depsOk =
      dependencyStates.completionCheck &&
      dependencyStates.permissions &&
      dependencyStates.livekit;

    if (!depsOk) return;
    if (!isVapiReady) return;
    if (interviewStarted) return;
    if (isConnecting) return;

    resumeAutoStartRef.current = true;
    console.log(
      "♻️ Auto-resuming interview: starting VAPI with previous context",
    );
    handleStartInterview();
  }, [
    isHR,
    resumePending,
    interviewAlreadyCompleted,
    connectionError,
    dependencyStates.completionCheck,
    dependencyStates.permissions,
    dependencyStates.livekit,
    isVapiReady,
    interviewStarted,
    isConnecting,
    handleStartInterview,
  ]);

  // Persist state (candidate only)
  useEffect(() => {
    if (isHR) return;
    if (!interviewStorageKey) return;

    // Save once interview has started OR we have some conversation
    if (!interviewStarted && (!conversation || conversation.length === 0))
      return;

    try {
      const payload = {
        savedAt: Date.now(),
        driveCandidateId,
        interviewType,
        interviewStarted,
        currentQuestion,
        conversation,
        fullTranscript,
      };
      localStorage.setItem(interviewStorageKey, JSON.stringify(payload));
    } catch (e) {
      console.warn("⚠️ Failed to persist interview state", e);
    }
  }, [
    isHR,
    interviewStorageKey,
    driveCandidateId,
    interviewType,
    interviewStarted,
    currentQuestion,
    conversation,
    fullTranscript,
  ]);

  const clearSavedInterviewState = useCallback(() => {
    if (isHR) return;
    if (!interviewStorageKey) return;
    try {
      localStorage.removeItem(interviewStorageKey);
    } catch (e) {
      console.warn("⚠️ Failed to clear interview state", e);
    }
  }, [isHR, interviewStorageKey]);

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
        `${BASE_URL}/api/interview/candidate/${driveCandidateId}`,
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
          round.round_type.toLowerCase().trim() === normalizedInterviewType,
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

  // ✅ FIXED: Toggle video wrapper
  const toggleVideo = useCallback(async () => {
    console.log("📹 toggleVideo called, current isVideoOff:", isVideoOff);
    await toggleVideoFn(isVideoOff, setIsVideoOff);
  }, [isVideoOff, toggleVideoFn]);

  // ✅ FIXED: Toggle audio wrapper that ALSO updates VAPI
  const toggleAudio = useCallback(() => {
    console.log("🎤 toggleAudio called, current isMuted:", isMuted);

    // Toggle LiveKit audio
    toggleAudioFn(isMuted, setIsMuted);

    // ✅ CRITICAL: Also update VAPI mute state
    const newMutedState = !isMuted;
    updateMuteState(newMutedState);

    console.log(
      `🔇 Audio ${newMutedState ? "MUTED" : "UNMUTED"} (both LiveKit and VAPI)`,
    );
  }, [isMuted, toggleAudioFn, updateMuteState]);

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
    const blinkInterval = setInterval(
      () => {
        setBlinkState(true);
        setTimeout(() => setBlinkState(false), 150);
      },
      3000 + Math.random() * 2000,
    );
    return () => clearInterval(blinkInterval);
  }, []);

  // Update completion check state when checkInterviewCompletion finishes
  useEffect(() => {
    if (!isCheckingCompletion) {
      setDependencyStates((prev) => ({
        ...prev,
        completionCheck: true,
      }));
      console.log("✅ STEP 3: Completion check state updated");
    }
  }, [isCheckingCompletion]);

  // Update LiveKit and connection states when LiveKit connects
  useEffect(() => {
    const newStates = {
      livekit: livekitConnected && !isLoadingLiveKit,
      connection: livekitConnected,
    };

    setDependencyStates((prev) => {
      const updated = { ...prev, ...newStates };
      if (
        updated.livekit !== prev.livekit ||
        updated.connection !== prev.connection
      ) {
        console.log("🔄 STEP 4: LiveKit states updated", {
          livekit: updated.livekit,
          connection: updated.connection,
        });
      }
      return updated;
    });
  }, [livekitConnected, isLoadingLiveKit]);

  // Update permission state when camera permission changes
  useEffect(() => {
    const permissionsResolved =
      cameraPermission === "granted" || cameraPermission === "denied";
    setDependencyStates((prev) => {
      const updated = { ...prev, permissions: permissionsResolved };
      if (updated.permissions !== prev.permissions) {
        console.log("🔄 STEP 2: Permission state updated", {
          permissions: permissionsResolved,
          cameraPermission,
        });
      }
      return updated;
    });
  }, [cameraPermission]);

  // STEP 5: Video Element Creation (800-1500ms) - Track when video element is ready
  useEffect(() => {
    const videoReady =
      localVideoRef?.current !== null && localVideoRef?.current !== undefined;

    setDependencyStates((prev) => {
      const updated = { ...prev, videoElement: videoReady };
      if (updated.videoElement !== prev.videoElement) {
        if (videoReady) {
          console.log("✅ STEP 5: Video element ready");
          setLoadingStage("video");
          setLoadingProgress(60);
          setLoadingMessage("Setting up video display...");
          setLoadingSubtext("Configuring video elements...");
        }
      }
      return updated;
    });

    // Fallback: If LiveKit is connected but video element is not ready after 3 seconds, mark it as ready
    const fallbackTimer = setTimeout(() => {
      if (dependencyStates.livekit && !dependencyStates.videoElement) {
        console.log(
          "⚠️ STEP 5: Video element fallback - marking as ready after timeout",
        );
        setDependencyStates((prev) => ({
          ...prev,
          videoElement: true,
        }));
        setLoadingStage("video");
        setLoadingProgress(60);
        setLoadingMessage("Setting up video display...");
        setLoadingSubtext("Video elements configured (fallback)...");
      }
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, [localVideoRef, dependencyStates.livekit, dependencyStates.videoElement]);

  // STEP 6: Audio Context & VAPI Setup (1000-2000ms) - Initialize VAPI when dependencies are ready
  useEffect(() => {
    // Initialize VAPI as part of unified system when basic dependencies are ready
    if (
      !isHR &&
      !interviewAlreadyCompleted &&
      dependencyStates.completionCheck &&
      dependencyStates.livekit &&
      dependencyStates.permissions &&
      !vapiClientRef.current &&
      resumeText
    ) {
      console.log(
        "🤖 STEP 6: Initializing VAPI as part of unified dependency system...",
      );
      setLoadingStage("vapi");
      setLoadingProgress(70);
      setLoadingMessage("Preparing AI interviewer...");
      setLoadingSubtext("Initializing conversational AI...");

      const client = initializeVapi();

      // Cleanup function will be handled by component unmount
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
    dependencyStates.completionCheck,
    dependencyStates.livekit,
    dependencyStates.permissions,
    vapiClientRef.current,
    resumeText,
    initializeVapi,
  ]);

  // Update VAPI state when VAPI becomes ready
  useEffect(() => {
    const vapiReady = interviewAlreadyCompleted || isVapiReady;
    setDependencyStates((prev) => {
      const updated = { ...prev, vapi: vapiReady };
      if (updated.vapi !== prev.vapi) {
        if (vapiReady) {
          console.log("✅ STEP 6: VAPI ready");
        }
      }
      return updated;
    });
  }, [isVapiReady, interviewAlreadyCompleted]);

  // Set audio context as ready (always true when context is created)
  useEffect(() => {
    setDependencyStates((prev) => {
      const updated = { ...prev, audioContext: true };
      if (updated.audioContext !== prev.audioContext) {
        console.log("✅ STEP 6: Audio context ready");
      }
      return updated;
    });
  }, []);

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

    stopCamera(localTracks);

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

    // Clear persisted state once the interview ends (candidate)
    clearSavedInterviewState();

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
    localTracks,
    isHR,
    vapiClientRef,
    clearSavedInterviewState,
  ]);

  // HR Intervention Functions
  const handleHrHandRaise = useCallback(() => {
    if (!interviewStarted) return;
    console.log("⏸️ AI PAUSED - HR is taking over the conversation");
    vapiListeningRef.current = false; // Stop AI from listening
    updateMuteState(false); // Unmute to allow HR to speak
    setHrHandRaised(true);
    setAiPaused(true);
    setIsSpeaking(false);
    const hrInterventionMessage = {
      role: "system",
      content: `⏸️ AI Paused - ${hrName} is now conducting the interview. Real-time conversation with the candidate starts now.`,
      timestamp: new Date().toISOString(),
    };
    setFullTranscript((prev) => [...prev, hrInterventionMessage]);
  }, [interviewStarted, hrName, updateMuteState]);

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
    console.log("▶️ HR stopped speaking - RESUMING AI to continue interview");
    vapiListeningRef.current = true; // Resume AI listening
    setHrSpeaking(false);
    setAiPaused(false);
    const resumeMessage = {
      role: "system",
      content: `▶️ AI Interview Resumed - Continuing with the interview questions`,
      timestamp: new Date().toISOString(),
    };
    setFullTranscript((prev) => [...prev, resumeMessage]);
    setCurrentQuestion(
      "Thank you for that response. Let me continue with the next question...",
    );
  }, [hrName]);

  const handleResumeAI = useCallback(() => {
    console.log("▶️ AI RESUMED - Returning to automated interview mode");
    vapiListeningRef.current = true; // Resume AI listening
    setAiPaused(false);
    setHrHandRaised(false);
    setHrSpeaking(false);
    const resumeMessage = {
      role: "system",
      content: `▶️ AI Interview Resumed by HR - Back to automated interview mode`,
      timestamp: new Date().toISOString(),
    };
    setFullTranscript((prev) => [...prev, resumeMessage]);
    setCurrentQuestion("Let's continue with the interview...");
  }, []);

  // STEP 1: Component Mount & Validation (0-100ms)
  useEffect(() => {
    console.log("🚀 STEP 1: Component Mount & Validation");
    setLoadingStage("initializing");
    setLoadingProgress(10);
    setLoadingMessage("Initializing interview...");
    setLoadingSubtext("Validating session and preparing components...");

    // Validate route parameters immediately
    if (!driveCandidateId || !interviewType) {
      setConnectionError("Invalid interview parameters");
      return;
    }

    // Check user data availability
    if (!userData && !isHR) {
      console.warn("⚠️ User data not available for candidate");
    }

    console.log("✅ STEP 1: Component validation complete");
  }, [driveCandidateId, interviewType, userData, isHR]);

  // STEP 2: Permission Check & Request (100-300ms)
  useEffect(() => {
    console.log("🔐 STEP 2: Permission Check & Request");
    setLoadingStage("permission");
    setLoadingProgress(20);
    setLoadingMessage("Checking camera permissions...");
    setLoadingSubtext("Please allow camera and microphone access...");

    const checkPermissions = async () => {
      try {
        // Check camera permission
        const cameraPermission = await navigator.permissions.query({
          name: "camera",
        });
        const microphonePermission = await navigator.permissions.query({
          name: "microphone",
        });

        const permissionsResolved =
          cameraPermission.state !== "prompt" &&
          microphonePermission.state !== "prompt";

        setDependencyStates((prev) => ({
          ...prev,
          permissions: permissionsResolved,
        }));

        if (permissionsResolved) {
          console.log("✅ STEP 2: Permissions resolved");
        } else {
          console.log("⏳ STEP 2: Waiting for user permission...");
        }
      } catch (error) {
        console.warn("⚠️ Permission check failed, assuming granted:", error);
        setDependencyStates((prev) => ({
          ...prev,
          permissions: true,
        }));
      }
    };

    checkPermissions();
  }, []);

  // STEP 3: Interview Completion Check (Candidates only) - PARALLEL (200-500ms)
  useEffect(() => {
    if (isHR) {
      console.log("👤 STEP 3: HR mode - skipping completion check");
      setDependencyStates((prev) => ({ ...prev, completionCheck: true }));
      return;
    }

    console.log("📋 STEP 3: Interview Completion Check (parallel)");
    setLoadingStage("completion");
    setLoadingProgress(30);
    setLoadingMessage("Checking interview status...");
    setLoadingSubtext("Verifying your interview access...");

    checkInterviewCompletion();
  }, []); // Empty deps - runs once on mount

  // STEP 4: LiveKit Connection Setup (300-1000ms)
  useEffect(() => {
    // For HR: start immediately after permission check
    if (
      isHR &&
      dependencyStates.permissions &&
      !hasInitializedRef.current &&
      !initializingRef.current
    ) {
      console.log("🎥 STEP 4: HR mode - initializing LiveKit immediately");
      setLoadingStage("livekit");
      setLoadingProgress(40);
      setLoadingMessage("Setting up video conference...");
      setLoadingSubtext("Connecting to interview room...");
      initializeLiveKit();
      return;
    }

    // For candidates: start after completion check AND permissions
    if (
      !isHR &&
      dependencyStates.completionCheck &&
      dependencyStates.permissions &&
      !interviewAlreadyCompleted &&
      !hasInitializedRef.current &&
      !initializingRef.current
    ) {
      console.log(
        "🎥 STEP 4: Candidate mode - initializing LiveKit after checks",
      );
      setLoadingStage("livekit");
      setLoadingProgress(50);
      setLoadingMessage("Setting up camera and microphone...");
      setLoadingSubtext("Connecting to interview room...");
      initializeLiveKit();
    }
  }, [
    isHR,
    dependencyStates.completionCheck,
    dependencyStates.permissions,
    interviewAlreadyCompleted,
    initializeLiveKit,
  ]);

  // 🔴 REMOVED: Separate VAPI initialization - now integrated into unified system

  // 🔴 REMOVED: Auto-start interview logic - now handled by unified system

  // STEP 7: Audio Capture Configuration (1500-2500ms) - Track VAPI audio capture readiness
  useEffect(() => {
    const vapiAudioReady = interviewStarted && vapiClientRef?.current;
    setDependencyStates((prev) => {
      const updated = { ...prev, vapiAudio: vapiAudioReady };
      if (updated.vapiAudio !== prev.vapiAudio) {
        if (vapiAudioReady) {
          console.log("✅ STEP 7: VAPI audio capture configured");
          setLoadingStage("audio");
          setLoadingProgress(80);
          setLoadingMessage("Configuring audio system...");
          setLoadingSubtext("Setting up audio routing...");
        }
      }
      return updated;
    });
  }, [interviewStarted, vapiClientRef]);

  // 🔴 NEW: Capture and publish Vapi audio once interview starts
  useEffect(() => {
    if (interviewStarted && !isHR && vapiClientRef.current) {
      console.log(
        "📡 Attempting to capture and publish Vapi audio to LiveKit...",
      );

      // Try immediately
      captureAndPublishVapiAudio();

      // Also retry after 2 seconds in case audio element hasn't been created yet
      const retryTimer = setTimeout(() => {
        console.log("🔄 Retrying Vapi audio capture...");
        captureAndPublishVapiAudio();
      }, 2000);

      return () => clearTimeout(retryTimer);
    }
  }, [interviewStarted, isHR, captureAndPublishVapiAudio]);

  // STEP 8: Final Validation & Buffer (2500-3000ms) - Comprehensive readiness check
  useEffect(() => {
    let isReady = false;

    if (isHR) {
      // HR: Ready when LiveKit is connected, loaded, and video element is ready
      isReady =
        dependencyStates.livekit &&
        dependencyStates.connection &&
        dependencyStates.videoElement;

      console.log("🔴 HR readiness check:", {
        ...dependencyStates,
        isReady,
      });
    } else {
      // Candidate: Ready when ALL dependencies are satisfied (including VAPI and video)
      isReady =
        dependencyStates.completionCheck &&
        dependencyStates.livekit &&
        dependencyStates.vapi &&
        dependencyStates.permissions &&
        dependencyStates.videoElement &&
        dependencyStates.audioContext;
      // Note: vapiAudio is not required for initial readiness, only for full functionality

      console.log("🔴 Candidate readiness check:", {
        ...dependencyStates,
        isReady,
      });
    }

    // Update loading stage for final validation
    if (isReady && !isFullyReady) {
      console.log(
        "🎯 STEP 8: All dependencies ready - starting final validation",
      );
      setLoadingStage("finalizing");
      setLoadingProgress(90);
      setLoadingMessage("Finalizing setup...");
      setLoadingSubtext("Ensuring all components are ready...");
    }

    if (isReady !== isFullyReady) {
      console.log(`🎯 Setting isFullyReady to ${isReady}`);
      setIsFullyReady(isReady);
    }
  }, [
    isHR,
    dependencyStates.completionCheck,
    dependencyStates.livekit,
    dependencyStates.vapi,
    dependencyStates.permissions,
    dependencyStates.connection,
    dependencyStates.videoElement,
    dependencyStates.audioContext,
    dependencyStates.vapiAudio,
    isFullyReady,
  ]);

  // STEP 9: Interface Transition (3000-3500ms) - Add render buffer to ensure all components are fully rendered
  useEffect(() => {
    if (isFullyReady && !isRenderBufferComplete) {
      console.log(
        "🔄 STEP 9: Starting render buffer for final synchronization...",
      );
      setLoadingStage("rendering");
      setLoadingProgress(95);
      setLoadingMessage("Finalizing interface...");
      setLoadingSubtext("Ensuring all components are loaded...");

      // Start a buffer timer to ensure all components are fully rendered
      const bufferTimer = setTimeout(() => {
        console.log(
          "✅ STEP 9: Render buffer complete - all components should be fully loaded",
        );
        setIsRenderBufferComplete(true);
        setLoadingProgress(100);
        setLoadingMessage("Ready!");
        setLoadingSubtext("Interview interface is now ready");
      }, 1500); // 1.5 second buffer

      return () => clearTimeout(bufferTimer);
    }
  }, [isFullyReady, isRenderBufferComplete]);

  // STEP 10: Auto-Start (Candidates) - Automatically start interview when ready (3500ms+)
  useEffect(() => {
    if (
      !isHR &&
      isRenderBufferComplete &&
      dependencyStates.completionCheck &&
      dependencyStates.livekit &&
      dependencyStates.vapi &&
      dependencyStates.permissions &&
      vapiClientRef.current &&
      resumeText &&
      !interviewStarted &&
      !isConnecting &&
      !interviewAlreadyCompleted
    ) {
      console.log(
        "🎬 STEP 10: Auto-starting interview - all dependencies ready and rendered",
      );
      const startTimer = setTimeout(() => {
        handleStartInterview();
      }, 1000); // 1 second delay after render buffer
      return () => clearTimeout(startTimer);
    }
  }, [
    isHR,
    isRenderBufferComplete,
    dependencyStates.completionCheck,
    dependencyStates.livekit,
    dependencyStates.vapi,
    dependencyStates.permissions,
    vapiClientRef.current,
    resumeText,
    interviewStarted,
    isConnecting,
    interviewAlreadyCompleted,
    handleStartInterview,
  ]);

  // GLOBAL FALLBACK: Force ready state after 10 seconds to prevent infinite loading
  useEffect(() => {
    const globalFallbackTimer = setTimeout(() => {
      if (!isRenderBufferComplete) {
        console.warn(
          "⚠️ GLOBAL FALLBACK: Forcing ready state after 10 seconds timeout",
        );
        // Force all dependencies to ready
        setDependencyStates({
          completionCheck: true,
          livekit: true,
          vapi: true,
          permissions: true,
          connection: true,
          videoElement: true,
          audioContext: true,
          vapiAudio: true,
        });
        setIsFullyReady(true);
        setLoadingStage("rendering");
        setLoadingProgress(100);
        setLoadingMessage("Ready (timeout fallback)");
        setLoadingSubtext("Interface loaded with fallback mechanism");

        // Complete render buffer after short delay
        setTimeout(() => {
          setIsRenderBufferComplete(true);
        }, 500);
      }
    }, 10000); // 10 second global timeout

    return () => clearTimeout(globalFallbackTimer);
  }, [isRenderBufferComplete]);

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
          const stopPromise = vapiClientRef.current.stop();
          if (stopPromise && typeof stopPromise.catch === "function") {
            stopPromise.catch(console.error);
          }
        } catch (error) {
          console.error("Error stopping Vapi on unmount:", error);
        }
      }

      if (livekitRoomRef.current) {
        try {
          const participant = livekitRoomRef.current.localParticipant;
          if (
            participant &&
            participant.tracks &&
            typeof participant.tracks.forEach === "function"
          ) {
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
  }, []);

  // 🔴 ENHANCED: Show loader during initialization, show full interface only when everything is ready
  if (!isRenderBufferComplete || connectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Enhanced Dependency Pipeline - Now as the main focus */}
          <DependencyPipeline
            dependencyStates={dependencyStates}
            loadingStage={loadingStage}
            loadingProgress={loadingProgress}
            loadingMessage={loadingMessage}
            loadingSubtext={loadingSubtext}
            isHR={isHR}
            errors={
              connectionError
                ? { [loadingStage]: { message: connectionError } }
                : {}
            }
            onRetry={() => window.location.reload()}
            estimatedTimeRemaining={
              loadingProgress < 100
                ? `${Math.ceil((100 - loadingProgress) / 10)}s`
                : null
            }
          />

          {/* Error Display - Only if there's a connection error */}
          {connectionError && (
            <div className="mt-6 animate-slide-in">
              <div className="bg-white rounded-xl shadow-lg border-2 border-red-300 overflow-hidden">
                {/* Red accent bar */}
                <div className="h-1 bg-gradient-to-r from-red-500 to-red-600"></div>

                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Error Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                          className="h-6 w-6 text-red-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Error Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-900 mb-1">
                        Connection Error
                      </h3>
                      <p className="text-sm text-red-700 mb-4">
                        {connectionError}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => window.location.reload()}
                          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg font-medium text-sm"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Retry Connection
                        </button>
                        <button
                          onClick={() => {
                            /* Add support contact logic */
                          }}
                          className="inline-flex items-center px-4 py-2 bg-white text-red-700 border-2 border-red-300 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
                        >
                          Get Help
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Troubleshooting Tips */}
                  <div className="mt-6 pt-6 border-t border-red-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Troubleshooting Tips:
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>Check your internet connection</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>
                          Disable browser extensions that might block media
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>
                          Allow camera and microphone permissions when prompted
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>
                          Try using a different browser (Chrome or Firefox
                          recommended)
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Helpful Info Footer */}
          {!connectionError && loadingProgress < 100 && (
            <div className="mt-6 text-center animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">
                  Setting up your interview environment...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes slide-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .animate-slide-in {
            animation: slide-in 0.4s ease-out;
          }

          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
        `}</style>
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

  // Main interview interface - only shown when fully ready
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
