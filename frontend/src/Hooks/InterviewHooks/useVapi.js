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

  return {
    vapiClientRef,
    initializeVapi,
    handleStartInterview,
  };
};
