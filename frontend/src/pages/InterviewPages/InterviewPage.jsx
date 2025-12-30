import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Hand,
  Pause,
  Play,
  AlertCircle,
  Camera,
  CameraOff,
  Users,
  MessageSquare,
  Volume2,
  Shield,
  UserCheck,
} from "lucide-react";
import Loader from "../../components/Loader";
import Vapi from "@vapi-ai/web";
import { Room, RoomEvent, Track, createLocalTracks } from "livekit-client";

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
  const localVideoRef = useRef(null);
  const vapiClientRef = useRef(null);
  const livekitRoomRef = useRef(null);
  const vapiListeningRef = useRef(true);
  const initializingRef = useRef(false);
  const mountedRef = useRef(true); // Track if component is mounted
  const hasInitializedRef = useRef(false); // Track if we've completed first init

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

  // Update remote participants list
  const updateRemoteParticipants = (room) => {
    if (!mountedRef.current) return;
    const participants = Array.from(room.remoteParticipants.values());
    console.log("📊 Remote participants:", participants.length);
    setRemoteParticipants(participants);
  };

  // Initialize LiveKit connection - MEMOIZED with stable reference
  const initializeLiveKit = useCallback(async () => {
    // Prevent double initialization
    if (initializingRef.current || hasInitializedRef.current) {
      console.log(
        "⚠️ LiveKit initialization blocked (already running or completed)"
      );
      return;
    }

    // Prevent if component unmounted
    if (!mountedRef.current) {
      console.log("⚠️ Component unmounted, skipping LiveKit init");
      return;
    }

    try {
      initializingRef.current = true;
      setIsLoadingLiveKit(true);
      console.log("🎥 Initializing LiveKit...");

      // Get LiveKit token from backend
      const role = isHR ? "hr" : "candidate";
      const identity = isHR
        ? `hr_${hrName.replace(/\s+/g, "_")}`
        : `candidate_${userData?.name?.replace(/\s+/g, "_") || "user"}`;

      console.log(`🔑 Requesting token for ${role}: ${identity}`);

      const response = await fetch(
        `${BASE_URL}/api/livekit/token?driveCandidateId=${driveCandidateId}&type=${interviewType}&role=${role}&identity=${identity}`
      );

      if (!response.ok) {
        throw new Error("Failed to get LiveKit token");
      }

      const data = await response.json();
      const livekitUrl = import.meta.env.VITE_LIVEKIT_URL;

      if (!livekitUrl) {
        throw new Error("LiveKit URL is missing in environment");
      }

      console.log(`🌐 Connecting to LiveKit: ${data.roomName}`);

      // Create LiveKit room
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: {
            width: 1280,
            height: 720,
            frameRate: 30,
          },
        },
      });

      // Set up event listeners
      room
        .on(RoomEvent.ParticipantConnected, (participant) => {
          if (!mountedRef.current) return;
          console.log("✅ Participant connected:", participant.identity);
          updateRemoteParticipants(room);

          if (participant.identity.startsWith("hr_") && interviewStarted) {
            const hrJoinMessage = {
              role: "system",
              content: `👥 ${participant.identity.replace(
                /_/g,
                " "
              )} joined the interview`,
              timestamp: new Date().toISOString(),
            };
            setFullTranscript((prev) => [...prev, hrJoinMessage]);
          }
        })
        .on(RoomEvent.ParticipantDisconnected, (participant) => {
          if (!mountedRef.current) return;
          console.log("❌ Participant disconnected:", participant.identity);
          updateRemoteParticipants(room);

          if (participant.identity.startsWith("hr_")) {
            const hrLeaveMessage = {
              role: "system",
              content: `👋 ${participant.identity.replace(
                /_/g,
                " "
              )} left the interview`,
              timestamp: new Date().toISOString(),
            };
            setFullTranscript((prev) => [...prev, hrLeaveMessage]);
          }
        })
        .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (!mountedRef.current) return;
          console.log("📹 Track subscribed:", track.kind, participant.identity);
          if (track.kind === Track.Kind.Video) {
            updateRemoteParticipants(room);
          }
        })
        .on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
          if (!mountedRef.current) return;
          console.log(
            "📹 Track unsubscribed:",
            track.kind,
            participant.identity
          );
          updateRemoteParticipants(room);
        })
        .on(RoomEvent.LocalTrackPublished, (publication) => {
          console.log("📤 Local track published:", publication.kind);
        })
        .on(RoomEvent.Disconnected, () => {
          console.log("🔌 Disconnected from room");
          if (mountedRef.current) {
            setLivekitConnected(false);
          }
        });

      // Connect to room FIRST
      console.log("🔗 Connecting to LiveKit room...");
      await room.connect(livekitUrl, data.token);

      if (!mountedRef.current) {
        console.log("⚠️ Component unmounted during connection, cleaning up");
        await room.disconnect();
        return;
      }

      console.log("✅ Connected to LiveKit room:", data.roomName);

      // Store room reference immediately
      livekitRoomRef.current = room;
      setLivekitConnected(true);

      // Wait a bit for connection to stabilize before publishing tracks
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!mountedRef.current) {
        console.log("⚠️ Component unmounted, skipping track creation");
        return;
      }

      // Now request and create local tracks
      console.log("🎤 Requesting local media tracks...");
      try {
        const tracks = await createLocalTracks({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: {
            resolution: {
              width: 1280,
              height: 720,
            },
          },
        });

        if (!mountedRef.current) {
          console.log("⚠️ Component unmounted, stopping tracks");
          tracks.forEach((track) => track.stop());
          return;
        }

        console.log(`✅ Got ${tracks.length} local tracks`);

        // Store local tracks
        setLocalTracks(tracks);

        // Publish tracks with timeout protection
        for (const track of tracks) {
          try {
            await Promise.race([
              room.localParticipant.publishTrack(track),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Publish timeout")), 10000)
              ),
            ]);
            console.log(`✅ Published ${track.kind} track`);
          } catch (publishError) {
            console.error(
              `⚠️ Failed to publish ${track.kind} track:`,
              publishError
            );
            // Continue even if one track fails
          }
        }

        // Attach local video
        const videoTrack = tracks.find((t) => t.kind === Track.Kind.Video);
        if (videoTrack && localVideoRef.current) {
          videoTrack.attach(localVideoRef.current);
          console.log("✅ Video track attached to element");
        }

        setCameraPermission("granted");
        console.log("✅ Camera permission granted");
      } catch (mediaError) {
        console.error("⚠️ Media access error:", mediaError);
        // Still mark as connected since room connection succeeded
        if (mediaError.name === "NotAllowedError") {
          setCameraPermission("denied");
          console.log("⚠️ Camera/mic denied, but room connection is OK");
        }
      }

      setIsLoadingLiveKit(false);
      hasInitializedRef.current = true; // Mark as completed

      // Update remote participants
      updateRemoteParticipants(room);

      console.log("✅ LiveKit initialization complete");
    } catch (error) {
      console.error("❌ LiveKit initialization error:", error);
      if (mountedRef.current) {
        setConnectionError(`Failed to connect video: ${error.message}`);
        setIsLoadingLiveKit(false);
      }
    } finally {
      initializingRef.current = false;
    }
  }, [
    driveCandidateId,
    interviewType,
    isHR,
    hrName,
    userData,
    interviewStarted,
  ]);

  // Stop camera and cleanup
  const stopCamera = useCallback(() => {
    console.log("🛑 Stopping camera and cleaning up...");

    if (livekitRoomRef.current) {
      try {
        livekitRoomRef.current.disconnect();
      } catch (error) {
        console.error("Error disconnecting room:", error);
      }
      livekitRoomRef.current = null;
    }

    // Stop local tracks
    localTracks.forEach((track) => {
      try {
        track.stop();
      } catch (error) {
        console.error("Error stopping track:", error);
      }
    });

    if (mountedRef.current) {
      setLivekitConnected(false);
      setLocalTracks([]);
    }

    console.log("✅ Camera stopped and cleaned up");
  }, [localTracks]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    const room = livekitRoomRef.current;
    if (!room) return;

    const newState = !isVideoOff;
    room.localParticipant.setCameraEnabled(!newState);
    setIsVideoOff(newState);
    console.log(`📹 Video ${newState ? "disabled" : "enabled"}`);
  }, [isVideoOff]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    const room = livekitRoomRef.current;
    if (!room) return;

    const newState = !isMuted;
    room.localParticipant.setMicrophoneEnabled(!newState);
    setIsMuted(newState);
    console.log(`🎤 Audio ${newState ? "disabled" : "enabled"}`);
  }, [isMuted]);

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

  // Initialize Vapi (only for candidates)
  const initializeVapi = useCallback(() => {
    if (interviewAlreadyCompleted || isHR) {
      console.log("⏭️ Skipping Vapi init (HR or completed)");
      return null;
    }

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
      console.log("🤖 Initializing Vapi...");
      const client = new Vapi(apiKey);
      if (!client) throw new Error("Failed to create VAPI client instance");

      let finalMessages = [];

      client.on("message", (msg) => {
        if (!vapiListeningRef.current) {
          console.log("🔇 Ignoring Vapi message - AI is paused");
          return;
        }

        if (msg.messages && Array.isArray(msg.messages)) {
          finalMessages = msg.messages;
          setConversation([...msg.messages]);

          const transcript = msg.messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({
              role: m.role,
              content: m.message || m.content,
              timestamp: m.time || new Date().toISOString(),
            }));
          setFullTranscript(transcript);

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

      client.on("speech-start", () => {
        if (!vapiListeningRef.current) return;
        console.log("🎤 AI started speaking");
        setIsSpeaking(true);
      });

      client.on("speech-end", () => {
        console.log("🎤 AI stopped speaking");
        setIsSpeaking(false);
      });

      client.on("call-start", () => {
        console.log("📞 Vapi call started");
        setInterviewStarted(true);
        setIsRecording(true);
        setIsConnecting(false);
        setCurrentQuestion("Interview started. Please introduce yourself.");
        setIsSpeaking(true);
      });

      client.on("call-end", () => {
        console.log("📞 Vapi call ended");
        setInterviewStarted(false);
        setIsRecording(false);
        setIsConnecting(false);
        setIsSpeaking(false);
      });

      client.on("error", (error) => {
        console.error("❌ Vapi error:", error);
        setConnectionError(`Connection error: ${error.message || error}`);
        setIsConnecting(false);
        setInterviewStarted(false);
        setIsRecording(false);
        setIsSpeaking(false);
      });

      vapiClientRef.current = client;
      setIsVapiReady(true);
      setIsConnecting(false);

      console.log("✅ Vapi initialized successfully");
      return client;
    } catch (error) {
      console.error("❌ Failed to initialize Vapi:", error);
      setConnectionError(`Failed to initialize: ${error.message}`);
      setIsConnecting(false);
      setIsVapiReady(false);
      return null;
    }
  }, [resumeText, interviewAlreadyCompleted, isHR]);

  // Start interview
  const handleStartInterview = useCallback(async () => {
    const client = vapiClientRef.current;
    if (!client || !resumeText || !prompt) {
      setConnectionError("Cannot start interview - missing requirements");
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      console.log("🚀 Starting Vapi interview...");
      await client.start({
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
      console.log("✅ Vapi interview started");
    } catch (error) {
      console.error("❌ Failed to start interview:", error);
      setConnectionError(`Failed to start: ${error.message}`);
      setIsConnecting(false);
    }
  }, [resumeText, prompt]);

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
  }, []); // Empty deps - run once on mount

  // STEP 2: Initialize LiveKit (when ready) - RUNS ONCE
  useEffect(() => {
    const shouldInitLiveKit = isHR
      ? !isCheckingCompletion // HR can join immediately
      : !isCheckingCompletion && !interviewAlreadyCompleted; // Candidate needs checks

    if (shouldInitLiveKit && !hasInitializedRef.current) {
      console.log("🎥 STEP 2: Initializing LiveKit");
      initializeLiveKit();
    }
  }, [isCheckingCompletion, interviewAlreadyCompleted, isHR]); // Minimal deps

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

      // Stop Vapi
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

      // Stop LiveKit
      if (livekitRoomRef.current) {
        try {
          livekitRoomRef.current.disconnect();
        } catch (error) {
          console.error("Error disconnecting room on unmount:", error);
        }
      }

      // Stop local tracks
      if (localTracks.length > 0) {
        localTracks.forEach((track) => {
          try {
            track.stop();
          } catch (error) {
            console.error("Error stopping track on unmount:", error);
          }
        });
      }
    };
  }, []); // Empty deps - setup once, cleanup on unmount

  // Animated Avatar Component
  const AnimatedAvatar = () => {
    const eyeHeight = blinkState ? 2 : 12;
    const mouthHeight = mouthOpen * 20;

    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {aiPaused && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg animate-pulse">
            <Pause className="w-3 h-3" />
            AI Paused
          </div>
        )}

        <svg
          width="220"
          height="220"
          viewBox="0 0 200 200"
          className="drop-shadow-2xl"
        >
          <defs>
            <linearGradient
              id="headGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="80" fill="url(#headGradient)" />
          <ellipse cx="75" cy="85" rx="12" ry={eyeHeight} fill="white" />
          <ellipse cx="125" cy="85" rx="12" ry={eyeHeight} fill="white" />
          {!blinkState && (
            <>
              <circle cx="75" cy="85" r="6" fill="#1e293b" />
              <circle cx="125" cy="85" r="6" fill="#1e293b" />
              <circle cx="77" cy="83" r="2" fill="white" />
              <circle cx="127" cy="83" r="2" fill="white" />
            </>
          )}
          <ellipse
            cx="100"
            cy="120"
            rx="25"
            ry={Math.max(3, mouthHeight)}
            fill="#ec4899"
            className="transition-all duration-100"
          />
          {isSpeaking && !aiPaused && (
            <>
              <circle
                cx="100"
                cy="100"
                r={80 + audioLevel * 20}
                fill="none"
                stroke="#a78bfa"
                strokeWidth="3"
                opacity={audioLevel * 0.6}
                className="transition-all duration-100"
              />
              <circle
                cx="100"
                cy="100"
                r={80 + audioLevel * 35}
                fill="none"
                stroke="#c4b5fd"
                strokeWidth="2"
                opacity={audioLevel * 0.4}
                className="transition-all duration-100"
              />
            </>
          )}
        </svg>

        {isSpeaking && !aiPaused && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1.5">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-full transition-all duration-100 shadow-lg"
                style={{
                  height: `${
                    (Math.sin(Date.now() / 80 + i * 0.5) * 0.5 + 0.5) * 24 + 12
                  }px`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Participant Video Component
  const ParticipantVideo = ({ participant }) => {
    const videoRef = useRef(null);
    const [hasVideo, setHasVideo] = useState(false);
    const isHRParticipant = participant.identity.startsWith("hr_");

    useEffect(() => {
      const videoPublications = Array.from(
        participant.videoTrackPublications.values()
      );

      if (videoPublications.length > 0) {
        const publication = videoPublications[0];

        if (publication.track) {
          if (videoRef.current) {
            publication.track.attach(videoRef.current);
            setHasVideo(true);
          }
        }

        const handleTrackSubscribed = (track) => {
          if (track.kind === Track.Kind.Video && videoRef.current) {
            track.attach(videoRef.current);
            setHasVideo(true);
          }
        };

        participant.on("trackSubscribed", handleTrackSubscribed);

        return () => {
          participant.off("trackSubscribed", handleTrackSubscribed);
          if (publication.track && videoRef.current) {
            publication.track.detach(videoRef.current);
          }
        };
      }
    }, [participant]);

    return (
      <div
        className={`relative bg-gray-900 rounded-xl overflow-hidden shadow-xl h-full ${
          isHRParticipant
            ? "border-3 border-purple-500"
            : "border-3 border-indigo-500"
        }`}
      >
        {hasVideo ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                {isHRParticipant ? (
                  <Shield className="w-8 h-8 text-purple-400" />
                ) : (
                  <Users className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <p className="text-gray-300 text-sm font-medium">
                {participant.identity.replace(/_/g, " ")}
              </p>
              <p className="text-gray-500 text-xs mt-1">No video</p>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
          {isHRParticipant && <Shield className="w-3 h-3 text-purple-400" />}
          <p className="text-white text-xs font-semibold">
            {participant.identity.replace(/_/g, " ")}
          </p>
        </div>
        {isHRParticipant && (
          <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
            HR
          </div>
        )}
      </div>
    );
  };

  // Connection Status Component
  const ConnectionStatus = () => {
    if (isCheckingCompletion) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-700 px-4 py-2 border-2 border-gray-300 rounded-full bg-white">
          <Loader className="w-4 h-4 animate-spin" />
          <span className="font-medium">Checking status...</span>
        </div>
      );
    }

    if (interviewAlreadyCompleted && !isHR) {
      return (
        <div className="flex items-center gap-2 text-sm text-orange-700 px-4 py-2 border-2 border-orange-500 bg-orange-50 rounded-full">
          <AlertCircle className="w-4 h-4" />
          <span className="font-semibold">Already completed</span>
        </div>
      );
    }

    if (isLoadingLiveKit) {
      return (
        <div className="flex items-center gap-2 text-sm text-blue-700 px-4 py-2 border-2 border-blue-500 bg-blue-50 rounded-full">
          <Loader className="w-4 h-4 animate-spin" />
          <span className="font-medium">Connecting video...</span>
        </div>
      );
    }

    if (isConnecting) {
      return (
        <div className="flex items-center gap-2 text-sm text-indigo-700 px-4 py-2 border-2 border-indigo-500 bg-indigo-50 rounded-full">
          <Loader className="w-4 h-4 animate-spin" />
          <span className="font-medium">Starting AI...</span>
        </div>
      );
    }

    if (connectionError) {
      return (
        <div className="flex items-center gap-2 text-sm text-red-700 px-4 py-2 border-2 border-red-500 bg-red-50 rounded-full">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium">Error</span>
        </div>
      );
    }

    if (interviewStarted) {
      return (
        <div className="flex items-center gap-2 text-sm text-green-700 px-4 py-2 border-2 border-green-500 bg-green-50 rounded-full">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-semibold">Interview Active</span>
        </div>
      );
    }

    if (isVapiReady || (isHR && livekitConnected)) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-700 px-4 py-2 border-2 border-gray-300 rounded-full bg-white">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
          <span className="font-medium">Ready</span>
        </div>
      );
    }

    return (
      <div className="text-sm text-gray-500 px-4 py-2 border-2 border-gray-300 rounded-full bg-gray-50">
        <span className="font-medium">Initializing...</span>
      </div>
    );
  };

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
        <div className="bg-white border-3 border-gray-900 rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 ${
                  isHR
                    ? "bg-gradient-to-br from-purple-500 to-pink-600"
                    : "bg-gradient-to-br from-indigo-500 to-purple-600"
                } rounded-xl flex items-center justify-center shadow-lg`}
              >
                {isHR ? (
                  <Shield className="w-6 h-6 text-white" />
                ) : (
                  <Users className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isHR ? "HR Interview Panel" : "Live Interview Session"}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-600 font-medium">
                    {isHR ? hrName : userData?.name || "Candidate"}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600 capitalize">
                    {interviewType} Interview
                  </span>
                  {remoteParticipants.length > 0 && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-indigo-600 font-semibold">
                        {remoteParticipants.length + 1} participants
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ConnectionStatus />
              {interviewStarted && (
                <div className="flex items-center gap-2 px-4 py-2 border-3 border-red-500 bg-red-50 rounded-full shadow-lg">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-red-700 uppercase tracking-wide">
                    Live
                  </span>
                </div>
              )}
            </div>
          </div>

          {connectionError && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">
                    Connection Error
                  </h3>
                  <p className="text-sm text-red-700">{connectionError}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Video Grid */}
        <div className={`grid grid-cols-1 ${gridCols} gap-6 mb-6`}>
          {/* AI Interviewer Section */}
          <div className="bg-white border-3 border-gray-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="aspect-video relative bg-gradient-to-br from-indigo-100 to-purple-100">
              <AnimatedAvatar />

              {hrHandRaised && (
                <div className="absolute top-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg animate-pulse">
                  <Hand className="w-4 h-4" />
                  HR Wants to Speak
                </div>
              )}

              {interviewStarted && isSpeaking && !aiPaused && (
                <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold border-2 border-green-700 flex items-center gap-2 shadow-lg">
                  <Volume2 className="w-4 h-4" />
                  AI Speaking
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      AI Interview Assistant
                    </p>
                    <p className="text-white/80 text-xs">Powered by GPT-4</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t-3 border-gray-900 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                <p className="text-gray-800 text-sm leading-relaxed min-h-[60px] font-medium">
                  {connectionError ? (
                    <span className="text-red-600 font-semibold">
                      ⚠️ {connectionError}
                    </span>
                  ) : currentQuestion ? (
                    currentQuestion
                  ) : isConnecting ? (
                    <span className="text-indigo-600">
                      Connecting to AI interviewer...
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      {isHR
                        ? "Waiting for interview to start..."
                        : "Waiting to start interview..."}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Local Participant Video */}
          <div className="bg-white border-3 border-gray-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative overflow-hidden">
              {cameraPermission === "granted" && !isVideoOff ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : cameraPermission === "denied" ? (
                <div className="text-center p-6">
                  <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CameraOff className="w-10 h-10 text-red-400" />
                  </div>
                  <p className="text-red-300 font-semibold mb-2">
                    Camera Access Denied
                  </p>
                  <p className="text-gray-400 text-sm">
                    You can still join audio-only
                  </p>
                </div>
              ) : isVideoOff ? (
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <VideoOff className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-300 font-semibold">Video is Off</p>
                </div>
              ) : livekitConnected ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Camera className="w-10 h-10 text-indigo-400" />
                  </div>
                  <p className="text-gray-300 font-semibold">
                    Requesting Camera Access...
                  </p>
                </div>
              )}

              {isRecording && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 font-bold border-2 border-red-700 shadow-lg">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  RECORDING
                </div>
              )}

              {isMuted && (
                <div className="absolute top-4 right-4 bg-red-600 text-white p-3 rounded-xl border-2 border-red-700 shadow-lg">
                  <MicOff className="w-5 h-5" />
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 ${
                        isHR
                          ? "bg-gradient-to-br from-purple-500 to-pink-600"
                          : "bg-gradient-to-br from-blue-500 to-indigo-600"
                      } rounded-full flex items-center justify-center border-2 border-white shadow-lg`}
                    >
                      <span className="text-white font-bold text-sm">
                        {isHR
                          ? hrName.charAt(0).toUpperCase()
                          : userData?.name?.charAt(0).toUpperCase() || "C"}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {isHR ? hrName : userData?.name || "Candidate"}
                      </p>
                      <p className="text-white/80 text-xs">
                        {isHR ? "HR Manager" : "You"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full border border-white/20">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        livekitConnected
                          ? "bg-green-500 animate-pulse"
                          : "bg-yellow-500"
                      }`}
                    ></div>
                    <span className="text-xs text-white font-medium">
                      {livekitConnected ? "Connected" : "Connecting"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t-3 border-gray-900 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-700">
                    Your Feed
                  </span>
                </div>
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  {showTranscript ? "Hide" : "View"} Transcript
                </button>
              </div>
            </div>
          </div>

          {/* Remote Participants */}
          {remoteParticipants.map((participant) => (
            <div
              key={participant.sid}
              className="bg-white border-3 border-gray-900 rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="aspect-video">
                <ParticipantVideo participant={participant} />
              </div>
              <div className="p-5 border-t-3 border-gray-900 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-700">
                    {participant.identity.replace(/_/g, " ")}
                  </span>
                  {participant.identity.startsWith("hr_") && (
                    <span className="ml-auto px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                      HR
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* HR Controls */}
        {isHR && livekitConnected && interviewStarted && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-3 border-yellow-400 rounded-2xl p-6 mb-6 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
                  <Hand className="w-6 h-6 text-yellow-900" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    HR Manager Controls
                  </h3>
                  <p className="text-sm text-gray-600">
                    {aiPaused
                      ? "AI is paused. You can speak now."
                      : hrHandRaised
                      ? "Waiting for AI to finish..."
                      : "Raise hand to pause AI and ask questions"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!aiPaused && !hrHandRaised && (
                  <button
                    onClick={handleHrHandRaise}
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    <Hand className="w-5 h-5" />
                    Raise Hand
                  </button>
                )}
                {aiPaused && !hrSpeaking && (
                  <button
                    onClick={handleHrStartSpeaking}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    <Mic className="w-5 h-5" />
                    Start Speaking
                  </button>
                )}
                {hrSpeaking && (
                  <button
                    onClick={handleHrStopSpeaking}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    <MicOff className="w-5 h-5" />
                    Stop Speaking
                  </button>
                )}
                {aiPaused && (
                  <button
                    onClick={handleResumeAI}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Resume AI
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transcript Panel */}
        {showTranscript && fullTranscript.length > 0 && (
          <div className="bg-white border-3 border-gray-900 rounded-2xl p-6 mb-6 shadow-xl max-h-96 overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Live Transcript
            </h3>
            <div className="space-y-4">
              {fullTranscript.map((entry, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl ${
                    entry.role === "assistant"
                      ? "bg-indigo-50 border-2 border-indigo-200"
                      : entry.role === "user"
                      ? "bg-blue-50 border-2 border-blue-200"
                      : "bg-yellow-50 border-2 border-yellow-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        entry.role === "assistant"
                          ? "bg-indigo-600 text-white"
                          : entry.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-yellow-600 text-white"
                      }`}
                    >
                      <span className="text-xs font-bold">
                        {entry.role === "assistant"
                          ? "AI"
                          : entry.role === "user"
                          ? isHR
                            ? "C"
                            : "You"
                          : "SYS"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-600">
                          {entry.role === "assistant"
                            ? "AI Interviewer"
                            : entry.role === "user"
                            ? userData?.name || "Candidate"
                            : "System"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {entry.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div className="bg-white border-3 border-gray-900 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={toggleAudio}
              disabled={!livekitConnected}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all transform hover:scale-105 border-3 shadow-lg ${
                !livekitConnected
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
                  : isMuted
                  ? "bg-red-500 hover:bg-red-600 text-white border-red-700"
                  : "bg-white hover:bg-gray-50 text-gray-900 border-gray-900"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={toggleVideo}
              disabled={!livekitConnected}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all transform hover:scale-105 border-3 shadow-lg ${
                !livekitConnected
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
                  : isVideoOff
                  ? "bg-red-500 hover:bg-red-600 text-white border-red-700"
                  : "bg-white hover:bg-gray-50 text-gray-900 border-gray-900"
              }`}
              title={isVideoOff ? "Turn on video" : "Turn off video"}
            >
              {isVideoOff ? (
                <VideoOff className="w-6 h-6" />
              ) : (
                <Video className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={handleEndInterview}
              disabled={!livekitConnected}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all transform hover:scale-105 border-3 shadow-lg ${
                livekitConnected
                  ? "bg-red-500 hover:bg-red-600 text-white border-red-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
              }`}
              title={isHR ? "Leave Interview" : "End Interview"}
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            <button
              onClick={() => setShowTranscript(!showTranscript)}
              disabled={!interviewStarted && !isHR}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all transform hover:scale-105 border-3 shadow-lg ${
                !interviewStarted && !isHR
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
                  : showTranscript
                  ? "bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-700"
                  : "bg-white hover:bg-gray-50 text-gray-900 border-gray-900"
              }`}
              title="Toggle Transcript"
            >
              <MessageSquare className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 font-medium">
              {isHR
                ? interviewStarted
                  ? "🎙️ Interview in progress - You can raise your hand to intervene"
                  : livekitConnected
                  ? "⏳ Waiting for interview to start..."
                  : "🔌 Connecting..."
                : !interviewStarted &&
                  isVapiReady &&
                  (cameraPermission === "granted" ||
                    cameraPermission === "denied")
                ? "✅ Ready to start (HR can join anytime)"
                : !interviewStarted &&
                  cameraPermission !== "granted" &&
                  cameraPermission !== "denied"
                ? "⚠️ Requesting camera and microphone access..."
                : interviewStarted
                ? hrPresent
                  ? "🎙️ Interview in progress - HR is observing"
                  : "🎙️ Interview in progress - HR can join anytime"
                : "⏳ Preparing interview session..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
