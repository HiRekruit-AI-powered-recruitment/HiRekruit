import { useCallback, useRef, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { Track } from "livekit-client";

export const useVapi = ({
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
  interviewStarted, // 🔴 NEW: Add interviewStarted state to hook parameters
  vapiListeningRef,
  livekitRoomRef, // 🔴 NEW: LiveKit room reference for publishing audio
}) => {
  const vapiClientRef = useRef(null);
  const isMutedRef = useRef(false); // ✅ NEW: Track mute state
  const audioContextRef = useRef(null); // 🔴 NEW: Store audio context reference
  const vapiAudioProcessorRef = useRef(null); // 🔴 NEW: Store audio processor for Vapi audio
  const vapiAudioSourceRef = useRef(null); // 🔴 NEW: Store Vapi audio source
  const vapiAudioStreamRef = useRef(null); // 🔴 NEW: Store Vapi audio stream

  // 🔴 NEW: Ensure audio output is active and routed to speakers
  const ensureAudioOutput = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }

      const audioContext = audioContextRef.current;

      // Resume suspended audio context
      if (audioContext.state === "suspended") {
        console.warn("⚠️ AudioContext suspended, resuming...");
        await audioContext.resume();
        console.log("✅ AudioContext resumed, state:", audioContext.state);
      }

      // Check if speakers/output devices are available
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputDevices = devices.filter(
          (device) => device.kind === "audiooutput",
        );
        console.log(
          `📊 Available audio output devices: ${audioOutputDevices.length}`,
          {
            devices: audioOutputDevices.map((d) => ({
              deviceId: d.deviceId,
              label: d.label,
            })),
          },
        );

        if (audioOutputDevices.length === 0) {
          console.warn("⚠️ No audio output devices found!");
        }
      }

      // Also ensure this element's volume is not muted
      const audioElements = document.querySelectorAll("audio");
      audioElements.forEach((audio, idx) => {
        if (audio.muted) {
          console.warn(`⚠️ Audio element ${idx} is muted, unmuting...`);
          audio.muted = false;
        }
      });

      return true;
    } catch (error) {
      console.error("❌ Error ensuring audio output:", error);
      return false;
    }
  }, []);

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
        // ✅ ENHANCED: Check both AI pause and mute state
        if (!vapiListeningRef.current) {
          console.log("🔇 Ignoring Vapi message - AI is paused");
          return;
        }

        // ✅ NEW: Process transcript messages and filter based on mute state
        if (msg.type === "transcript" && msg.transcriptType === "final") {
          const isUserSpeaking = msg.role === "user";
          const isAssistantSpeaking = msg.role === "assistant";

          // ✅ CRITICAL: Ignore user speech when muted
          if (isUserSpeaking && isMutedRef.current) {
            console.log("🔇 IGNORING user speech - microphone is MUTED");
            console.log("   Ignored text:", msg.transcript);
            return; // Don't process or add to transcript
          }

          console.log(
            `🎤 ${isUserSpeaking ? "User" : "AI"} speaking:`,
            msg.transcript,
          );

          // Add to transcript
          const transcriptEntry = {
            role: msg.role,
            content: msg.transcript,
            timestamp: new Date().toISOString(),
          };

          setFullTranscript((prev) => [...prev, transcriptEntry]);

          // Update conversation
          if (isUserSpeaking) {
            setConversation((prev) => [
              ...prev,
              {
                role: "user",
                message: msg.transcript,
                time: new Date().toISOString(),
              },
            ]);
          } else if (isAssistantSpeaking) {
            setCurrentQuestion(msg.transcript);
            setConversation((prev) => [
              ...prev,
              {
                role: "assistant",
                message: msg.transcript,
                time: new Date().toISOString(),
              },
            ]);
          }
        }

        // ✅ KEEP: Handle legacy message format (if your VAPI version uses it)
        if (msg.messages && Array.isArray(msg.messages)) {
          // Filter out user messages if muted
          const filteredMessages = msg.messages.filter((m) => {
            if (m.role === "user" && isMutedRef.current) {
              console.log("🔇 FILTERING muted user message from conversation");
              return false;
            }
            return true;
          });

          finalMessages = filteredMessages;
          setConversation([...filteredMessages]);

          const transcript = filteredMessages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({
              role: m.role,
              content: m.message || m.content,
              timestamp: m.time || new Date().toISOString(),
            }));
          setFullTranscript(transcript);

          const lastAssistantMessage = filteredMessages
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

      // 🔴 NEW: Listen for audio device changes (e.g., when HR joins or speaker changes)
      if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
        navigator.mediaDevices.addEventListener("devicechange", async () => {
          console.warn(
            "🔧 Audio device change detected (HR joined or speaker changed)",
          );
          // Try to restore audio output
          const restored = await ensureAudioOutput();
          if (restored) {
            console.log("✅ Audio routing restored after device change");
          } else {
            console.warn("⚠️ Could not restore audio routing");
          }
        });
      }

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
  }, [
    resumeText,
    interviewAlreadyCompleted,
    isHR,
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
  ]);

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

      // 🔴 CRITICAL: Ensure audio output is active before starting
      const audioOk = await ensureAudioOutput();
      if (!audioOk) {
        console.warn("⚠️ Audio output check had issues, but continuing...");
      }

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
        // 🔴 REMOVED: Remove invalid audio device parameters that cause 400 error
      });

      console.log("✅ Vapi interview started");

      // 🔴 DEBUG: Log audio state after start
      setTimeout(() => {
        console.log("📊 Audio state check after Vapi start:", {
          audioContextState: audioContextRef.current?.state,
          clientState: client.status || "unknown",
        });
      }, 1000);
    } catch (error) {
      console.error("❌ Failed to start interview:", error);

      // 🔴 AUDIO-SPECIFIC ERROR LOGGING
      if (error.message && error.message.includes("audio")) {
        console.error("🔊 Audio-specific error:", error.message);
        setConnectionError(`Audio error: Check speaker/microphone permissions`);
      } else {
        setConnectionError(`Failed to start: ${error.message}`);
      }

      setIsConnecting(false);
    }
  }, [
    resumeText,
    prompt,
    setIsConnecting,
    setConnectionError,
    ensureAudioOutput,
  ]);

  // ✅ NEW: Function to update mute state from InterviewPage
  const updateMuteState = useCallback((muted) => {
    console.log("🔇 Updating VAPI mute state:", muted ? "MUTED" : "UNMUTED");
    isMutedRef.current = muted;

    // ✅ OPTIONAL: If VAPI client has a mute property, update it too
    const client = vapiClientRef.current;
    if (client) {
      // Some VAPI versions support this
      if (typeof client.setMuted === "function") {
        client.setMuted(muted);
        console.log("✅ VAPI client.setMuted() called");
      }
      // Store mute state on client object for reference
      client.isMuted = muted;
      console.log("✅ VAPI mute state updated");
    }
  }, []);

  // 🔴 NEW: Function to restore audio when remote participant joins
  const restoreAudioAfterRemoteJoin = useCallback(async () => {
    console.warn("⏰ HR joined - attempting to restore audio output...");
    const restored = await ensureAudioOutput();
    if (restored) {
      console.log("✅ Audio restored after HR join");
    }
    return restored;
  }, [ensureAudioOutput]);

  const captureAndPublishVapiAudio = useCallback(async () => {
    try {
      console.log(
        "🎙️ Starting to capture and publish Vapi audio to LiveKit...",
      );

      if (!livekitRoomRef?.current) {
        console.warn(
          "⚠️ LiveKit room not available yet, audio capture will be attempted later",
        );
        // Will be retried when call starts
        return false;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }

      const audioContext = audioContextRef.current;
      const room = livekitRoomRef.current;

      // 🎙️ CRITICAL: Get the destination audio node (where Vapi outputs audio)
      // This captures the Vapi voice output
      const destination = audioContext.createMediaStreamAudioDestination();

      // Get the Vapi audio element (usually created by Vapi SDK)
      const vapiAudioElements = document.querySelectorAll("audio");
      let vapiAudioElement = null;

      // Find the Vapi audio element (usually has no src but auto-plays)
      for (const element of vapiAudioElements) {
        if (element.autoplay && !element.src) {
          vapiAudioElement = element;
          console.log("✅ Found Vapi audio element");
          break;
        }
      }

      // 🔴 IMPROVED: Also check for audio elements with specific VAPI characteristics
      if (!vapiAudioElement) {
        for (const element of vapiAudioElements) {
          // Check if element might be VAPI audio based on other properties
          if (element.paused === false && element.volume > 0) {
            vapiAudioElement = element;
            console.log("✅ Found likely Vapi audio element (playing)");
            break;
          }
        }
      }

      if (!vapiAudioElement) {
        console.warn(
          "⚠️ Vapi audio element not found, will retry on call start",
        );
        return false;
      }

      // 🎙️ Create audio source from the Vapi audio element
      try {
        const source =
          audioContext.createMediaElementAudioSource(vapiAudioElement);
        console.log("✅ Created audio source from Vapi element");

        // Store processors and sources
        vapiAudioSourceRef.current = source;
        vapiAudioStreamRef.current = destination.stream;

        // Connect Vapi audio to destination
        source.connect(destination);
        console.log("✅ Connected Vapi audio source to destination");

        // 🔊 CRITICAL: Publish the Vapi audio stream to LiveKit
        // This allows HR/panels to hear the AI voice
        const audioTrack = destination.stream.getAudioTracks()[0];
        if (audioTrack) {
          console.log("📡 Publishing Vapi audio track to LiveKit...");

          // Create custom audio track and publish
          const { LocalAudioTrack } = await import("livekit-client");
          const customAudioTrack = new LocalAudioTrack(destination.stream, {
            name: "vapi-ai-voice", // 🔴 NEW: Give it a descriptive name
            source: Track.Source.Microphone, // 🔴 NEW: Mark as microphone source
            encodingParameters: {
              maxBitrate: 64000, // 64 kbps for voice
              maxFramerate: 24,
            },
          });

          // Add track to room
          await room.localParticipant.publishTrack(customAudioTrack);
          console.log("✅ Vapi audio track published to LiveKit!");
          console.log("🎤 HR/Panels can now hear: Candidate voice + AI voice");

          // 🔴 NEW: Store reference for cleanup
          vapiAudioProcessorRef.current = customAudioTrack;

          return true;
        } else {
          console.warn("⚠️ No audio track found in destination stream");
          return false;
        }
      } catch (error) {
        console.error("❌ Error creating audio source:", error);
        return false;
      }
    } catch (error) {
      console.error("❌ Error capturing/publishing Vapi audio:", error);
      return false;
    }
  }, [livekitRoomRef]);

  // 🔴 NEW: Capture Vapi audio and publish to LiveKit
  useEffect(() => {
    if (interviewStarted && !isHR && vapiClientRef.current) {
      console.log(
        "📡 Attempting to capture and publish Vapi audio to LiveKit...",
      );

      // Try immediately
      captureAndPublishVapiAudio();

      // 🔴 IMPROVED: Try multiple times with different intervals
      const retryIntervals = [1000, 2000, 3000, 5000]; // Multiple retry attempts

      const timers = retryIntervals.map((interval) =>
        setTimeout(() => {
          console.log(`🔄 Retrying Vapi audio capture (${interval}ms)...`);
          captureAndPublishVapiAudio();
        }, interval),
      );

      return () => {
        timers.forEach((timer) => clearTimeout(timer));
      };
    }
  }, [interviewStarted, isHR, captureAndPublishVapiAudio]);

  return {
    vapiClientRef,
    initializeVapi,
    handleStartInterview,
    updateMuteState, // ✅ NEW: Export the mute state updater
    restoreAudioAfterRemoteJoin, // 🔴 NEW: Export audio restoration function
    captureAndPublishVapiAudio, // 🔴 NEW: Export Vapi audio capture/publish function
  };
};
