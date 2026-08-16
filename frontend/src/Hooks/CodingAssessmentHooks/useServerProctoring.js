import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

/**
 * useServerProctoring — Guard 2: Server-side Groq Vision + Whisper proctoring.
 *
 * Every 30 seconds, captures a webcam snapshot + short audio clip,
 * sends them to the Flask backend via Socket.IO for analysis.
 *
 * Server checks for:
 *   📱 Phone in view
 *   📝 Notes/books visible
 *   🏠 Suspicious environment
 *   🗣️ Suspicious speech (via Whisper transcription)
 *
 * Uses the SAME videoRef as Guard 1 — no duplicate camera streams.
 *
 * @param {object}   opts
 * @param {boolean}  opts.enabled            - false to skip everything
 * @param {boolean}  opts.assessmentStarted  - true once assessment begins
 * @param {function} opts.onViolation        - (type, message) => void
 * @param {object}   opts.videoRef           - React ref to the <video> element
 * @param {number}   opts.snapshotIntervalMs - how often to send snapshots (default 30000)
 * @param {number}   opts.gracePeriodMs      - ignore violations for this long (default 15000)
 * @param {string}   opts.candidateId        - candidate identifier
 * @param {string}   opts.driveId            - drive identifier
 */
const useServerProctoring = ({
  enabled = true,
  assessmentStarted = false,
  onViolation,
  videoRef,
  snapshotIntervalMs = 30000,
  gracePeriodMs = 15000,
  candidateId = "",
  driveId = "",
}) => {
  // ── Public state ──
  const [serverActive, setServerActive] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // ── Internal refs ──
  const socketRef = useRef(null);
  const intervalRef = useRef(null);
  const graceActiveRef = useRef(true);
  const loopStartedRef = useRef(false);
  const onViolationRef = useRef(onViolation);

  // Keep callback ref in sync
  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  // ─────────────────────────────────────────────────────────────
  // STEP 1: Connect Socket.IO on mount
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("🧠 Guard 2: Socket.IO connected ✓");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("🧠 Guard 2: Socket.IO disconnected");
      setIsConnected(false);
    });

    // Listen for analysis results from server
    socket.on("proctor_result", (result) => {
      console.log("🧠 Guard 2: Server result:", result);
      setLastAnalysis(result);

      if (result.is_violation && !graceActiveRef.current) {
        const violations = result.violations || [];
        const messages = [];

        if (violations.includes("phone_in_view"))
          messages.push("Phone detected in your view");
        if (violations.includes("notes_visible"))
          messages.push("Notes or reference material detected");
        if (violations.includes("suspicious_environment"))
          messages.push("Suspicious environment detected");
        if (violations.includes("other_person"))
          messages.push("Another person visible in frame");
        if (violations.includes("suspicious_speech"))
          messages.push("Suspicious speech detected");
        if (violations.includes("other_voice_detected"))
          messages.push("Another voice detected");

        const message =
          messages.length > 0
            ? messages.join(". ") + "."
            : "Suspicious activity detected by server analysis.";

        onViolationRef.current?.("server_violation", message);
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled]);

  // ─────────────────────────────────────────────────────────────
  // Capture a JPEG snapshot from the video element
  // ─────────────────────────────────────────────────────────────
  const captureSnapshot = useCallback(() => {
    const video = videoRef?.current;
    if (!video || video.readyState < 2) return null;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, 640, 480);

      // Low quality JPEG to reduce payload (~30-50KB)
      return canvas.toDataURL("image/jpeg", 0.5);
    } catch (err) {
      console.warn("🧠 Guard 2: Snapshot capture failed:", err.message);
      return null;
    }
  }, [videoRef]);

  // ─────────────────────────────────────────────────────────────
  // Record a short audio clip (5 seconds) from the microphone
  // ─────────────────────────────────────────────────────────────
  const recordAudioClip = useCallback(() => {
    return new Promise((resolve) => {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          // Pick a supported mime type
          const mimeType = MediaRecorder.isTypeSupported(
            "audio/webm;codecs=opus"
          )
            ? "audio/webm;codecs=opus"
            : "audio/webm";

          const recorder = new MediaRecorder(stream, { mimeType });
          const chunks = [];

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
          };

          recorder.onstop = () => {
            // Release this temporary stream (Guard 1's stream is separate)
            stream.getTracks().forEach((t) => t.stop());

            if (chunks.length === 0) {
              resolve(null);
              return;
            }

            const blob = new Blob(chunks, { type: mimeType });
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          };

          recorder.start();

          // Stop after 5 seconds
          setTimeout(() => {
            if (recorder.state === "recording") {
              recorder.stop();
            }
          }, 5000);
        })
        .catch((err) => {
          console.warn("🧠 Guard 2: Audio recording failed:", err.message);
          resolve(null);
        });
    });
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Send snapshot + audio to server
  // ─────────────────────────────────────────────────────────────
  const sendSnapshot = useCallback(async () => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      console.warn("🧠 Guard 2: Socket not connected, skipping snapshot");
      return;
    }

    // 1. Capture image instantly
    const imageData = captureSnapshot();
    if (!imageData) {
      console.warn("🧠 Guard 2: No image captured, skipping");
      return;
    }

    // 2. Record 5-second audio clip
    const audioData = await recordAudioClip();

    // 3. Send to server
    socket.emit("proctor_snapshot", {
      image: imageData,
      audio: audioData,
      candidateId,
      driveId,
    });

    console.log(
      `🧠 Guard 2: Snapshot sent (image: ✓, audio: ${audioData ? "✓" : "✗"})`
    );
  }, [captureSnapshot, recordAudioClip, candidateId, driveId]);

  // ─────────────────────────────────────────────────────────────
  // STEP 2: Start the proctoring loop when assessment starts
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!assessmentStarted || !isConnected || !enabled) return;
    if (loopStartedRef.current) return;

    loopStartedRef.current = true;
    graceActiveRef.current = true;
    setServerActive(true);

    // Notify server
    socketRef.current?.emit("proctor_start", { candidateId, driveId });

    console.log(
      `🧠 Guard 2: Server proctoring started. Grace: ${gracePeriodMs / 1000}s, Interval: ${snapshotIntervalMs / 1000}s`
    );

    // Grace period — don't fire violations during this time
    const graceTimer = setTimeout(() => {
      graceActiveRef.current = false;
      console.log("🧠 Guard 2: Grace period ended — server analysis ACTIVE 🔴");
    }, gracePeriodMs);

    // Start sending snapshots after grace period + small buffer
    const startTimer = setTimeout(() => {
      // Send first snapshot immediately
      sendSnapshot();

      // Then every snapshotIntervalMs
      intervalRef.current = setInterval(sendSnapshot, snapshotIntervalMs);
    }, gracePeriodMs + 2000);

    return () => {
      clearTimeout(graceTimer);
      clearTimeout(startTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    assessmentStarted,
    isConnected,
    enabled,
    candidateId,
    driveId,
    gracePeriodMs,
    snapshotIntervalMs,
    sendSnapshot,
  ]);

  // ─────────────────────────────────────────────────────────────
  // Cleanup on unmount
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (socketRef.current?.connected) {
        socketRef.current.emit("proctor_end", { candidateId, driveId });
        socketRef.current.disconnect();
      }
      console.log("🧠 Guard 2: Cleaned up ✓");
    };
  }, []);

  return {
    serverActive,
    lastAnalysis,
    isConnected,
  };
};

export default useServerProctoring;
