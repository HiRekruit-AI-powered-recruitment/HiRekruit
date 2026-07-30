import { useCallback, useRef, useEffect } from "react";
import { io } from "socket.io-client";

export const useSarvam = ({
  resumeText,
  interviewAlreadyCompleted,
  isHR,
  prompt,
  initialConversation,
  setIsConnecting,
  setConnectionError,
  setIsSarvamReady,
  setConversation,
  setFullTranscript,
  setCurrentQuestion,
  setIsSpeaking,
  setInterviewStarted,
  setIsRecording,
  interviewStarted,
}) => {

  const wsRef = useRef(null);

  const isMutedRef = useRef(false);

  const audioContextRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Restore previous conversation

  useEffect(() => {

    if (!initialConversation) return;

    if (!Array.isArray(initialConversation)) return;

    if (initialConversation.length === 0) return;

    if (isHR) return;

    setConversation(initialConversation);

    const transcript = initialConversation.map((m) => ({
      role: m.role,
      content: m.message || m.content,
      timestamp: m.time || new Date().toISOString(),
    }));

    setFullTranscript(transcript);

    const lastAssistant = initialConversation
      .filter((m) => m.role === "assistant")
      .pop();

    if (lastAssistant) {
      setCurrentQuestion(lastAssistant.message || lastAssistant.content);
    }

  }, [
    initialConversation,
    isHR,
    setConversation,
    setCurrentQuestion,
    setFullTranscript,
  ]);

  // Browser Audio Test

  const ensureAudioOutput = useCallback(async () => {

    try {

      if (!audioContextRef.current) {

        audioContextRef.current =
          new (window.AudioContext || window.webkitAudioContext)();

      }

      if (audioContextRef.current.state === "suspended") {

        await audioContextRef.current.resume();

      }

      return true;

    } catch (err) {

      console.error(err);

      return false;

    }

  }, []);

  const initializeSarvam = useCallback(() => {

    if (interviewAlreadyCompleted || isHR) {
      console.log("Skipping Sarvam initialization");
      return;
    }

    if (!resumeText) {
      setConnectionError("Resume not found");
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {

      const socket = io(import.meta.env.VITE_BASE_URL, {
        transports: ["websocket"],
        withCredentials: true,
      });

      wsRef.current = socket;

      socket.on("connect", async () => {
        console.log("Connected to Sarvam backend");

        try {
          mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          mediaRecorderRef.current = new MediaRecorder(mediaStreamRef.current, {
            mimeType: "audio/webm",
          });

          mediaRecorderRef.current.ondataavailable = async (event) => {
            if (event.data.size === 0 || !socket.connected) return;

            const arrayBuffer = await event.data.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);

            let binary = "";
            bytes.forEach((b) => {
              binary += String.fromCharCode(b);
            });

            const base64 = btoa(binary);

            socket.emit("audio", {
              audio: base64,
            });
          };

          mediaRecorderRef.current.start(250);

          console.log("🎤 Microphone streaming started");
        } catch (err) {
          console.error("Microphone access failed", err);
        }

        setIsSarvamReady(true);

        setIsConnecting(false);
      });

      socket.onAny((event, message) => {

        console.log(event, message);

        switch (event) {

          case "assistant_response":

            setConversation(prev => [
              ...prev,
              {
                role: "assistant",
                message: message.text,
                time: new Date().toISOString(),
              },
            ]);

            setFullTranscript(prev => [
              ...prev,
              {
                role: "assistant",
                content: message.text,
                timestamp: new Date().toISOString(),
              },
            ]);

            setCurrentQuestion(message.text);

            setIsSpeaking(true);

            break;

          case "transcript":

            if (isMutedRef.current) return;

            setConversation(prev => [
              ...prev,
              {
                role: "user",
                message: message.text,
                time: new Date().toISOString(),
              },
            ]);

            setFullTranscript(prev => [
              ...prev,
              {
                role: "user",
                content: message.text,
                timestamp: new Date().toISOString(),
              },
            ]);

            break;

          case "audio":

            handleSarvamAudio(message.audio);

            break;

          case "interview_started":

            setInterviewStarted(true);

            setIsRecording(true);

            break;

          case "interview_completed":

            setInterviewStarted(false);

            setIsRecording(false);

            break;

          default:

            console.log(message);

        }

      });

      socket.on("connect_error", (err) => {

        console.error(err);

        setConnectionError("Failed to connect");

        setIsConnecting(false);

      });

      socket.on("disconnect", () => {

        console.log("Sarvam socket closed");

        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.requestData();
          mediaRecorderRef.current.stop();
        }

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        }


        setInterviewStarted(false);

        setIsRecording(false);

        setIsSarvamReady(false);

        setIsSpeaking(false);


      });

    } catch (err) {

      console.error(err);

      setConnectionError("Unable to initialize Sarvam");

      setIsConnecting(false);

    }

  }, [
    resumeText,
    interviewAlreadyCompleted,
    isHR,
    setIsConnecting,
    setConnectionError,
    setIsSarvamReady,
    setConversation,
    setCurrentQuestion,
    setInterviewStarted,
    setIsRecording,
    setIsSpeaking,

  ]);

  const handleStartInterview = useCallback(async () => {

    if (!wsRef.current) {

      setConnectionError("Sarvam is not connected");

      return;

    }

    if (!wsRef.current.connected) {

      setConnectionError("Sarvam websocket not ready");

      return;

    }

    await ensureAudioOutput();

    setIsConnecting(true);

    setConnectionError(null);

    const history =
      Array.isArray(initialConversation)
        ? initialConversation.map((m) => ({
          role: m.role,
          content: m.message || m.content,
        }))
        : [];

    wsRef.current.emit("start_interview", {
      resumeText,
      prompt,
      interviewType: "general",
      history,
    });

  }, [
    resumeText,
    prompt,
    initialConversation,
    ensureAudioOutput,
    setConnectionError,
    setIsConnecting,
  ]);

  const updateMuteState = useCallback((muted) => {

    isMutedRef.current = muted;

    if (wsRef.current && wsRef.current.connected) {

      wsRef.current.emit("mute", {
        muted,
      });

    }

  }, []);

  const restoreAudioAfterRemoteJoin = useCallback(async () => {

    console.log("Restoring browser audio");

    return await ensureAudioOutput();

  }, [ensureAudioOutput]);

  const handleSarvamAudio = useCallback(async (audioBase64) => {

    try {

      if (!audioBase64) return;

      const audio = new Audio(
        `data:audio/mp3;base64,${audioBase64}`
      );


      audio.onended = () => {
        setIsSpeaking(false);
      };

      await audio.play();

    } catch (err) {

      console.error("Audio playback failed", err);

    }

  }, []);

  // Initialize audio handling once interview starts
  useEffect(() => {
    if (
      interviewStarted &&
      !isHR &&
      wsRef.current &&
      wsRef.current.connected
    ) {
      console.log("🎙️ Sarvam interview audio initialized");
    }
  }, [interviewStarted, isHR]);
  // NEW: Send written answer updates to the AI mid-conversation
  const sendWrittenAnswerUpdate = useCallback((answers) => {

    if (!wsRef.current || !wsRef.current.connected) {
      return;
    }

    wsRef.current.emit("written_answer_update", {
      answers,
    });

  }, []);

  return {
    wsRef,
    initializeSarvam,
    handleStartInterview,
    updateMuteState,
    restoreAudioAfterRemoteJoin,
    handleSarvamAudio,
    sendWrittenAnswerUpdate,
  };
};
