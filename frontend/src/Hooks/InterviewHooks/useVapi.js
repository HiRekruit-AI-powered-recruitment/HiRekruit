import { useCallback, useRef } from "react";
import Vapi from "@vapi-ai/web";

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
  vapiListeningRef,
}) => {
  const vapiClientRef = useRef(null);
  const isMutedRef = useRef(false); // ✅ NEW: Track mute state

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
  }, [resumeText, prompt, setIsConnecting, setConnectionError]);

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

  return {
    vapiClientRef,
    initializeVapi,
    handleStartInterview,
    updateMuteState, // ✅ NEW: Export the mute state updater
  };
};
