import { useState, useEffect, useRef } from "react";

/**
 * useAudioProctoring — Modular browser-side audio monitoring.
 *
 * Uses the Web Audio API to detect voice/sound activity via microphone
 * volume levels. Completely independent from face detection (useAIProctoring).
 *
 * Fires a "talking_detected" violation when sustained audio above threshold
 * is detected for ~3 seconds.
 *
 * To replace with a different audio analysis system (e.g., speaker ID),
 * swap this file — the interface (props in, state out) stays the same.
 *
 * @param {object}   opts
 * @param {boolean}  opts.enabled           - false to skip everything
 * @param {boolean}  opts.assessmentStarted - true once the coding assessment begins
 * @param {function} opts.onViolation       - (type, message) => void
 * @param {number}   opts.gracePeriodMs     - ignore violations for this long (default 10000)
 * @param {number}   opts.volumeThreshold   - 0-255, volume to consider "talking" (default 30)
 * @param {number}   opts.sustainedChecks   - consecutive checks above threshold to fire (default 6)
 * @param {number}   opts.checkIntervalMs   - how often to sample volume (default 500)
 */
const useAudioProctoring = ({
  enabled = true,
  assessmentStarted = false,
  onViolation,
  gracePeriodMs = 10000,
  volumeThreshold = 45,
  sustainedChecks = 6,
  checkIntervalMs = 500,
}) => {
  // ── Public state ──
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [isTalkingDetected, setIsTalkingDetected] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);

  // ── Internal refs ──
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const intervalRef = useRef(null);
  const graceActiveRef = useRef(true);
  const sustainedCountRef = useRef(0);
  const onViolationRef = useRef(onViolation);
  const loopStartedRef = useRef(false);

  // Keep callback ref in sync
  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  // ─────────────────────────────────────────────────────────────
  // STEP 1: Request microphone access + create AudioContext
  // Runs on mount, independent of assessmentStarted
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const initialize = async () => {
      try {
        console.log("🎤 Audio Proctoring: Requesting microphone access...");

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        // Create Web Audio API pipeline: Source → Analyser
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256; // 128 frequency bins
        analyser.smoothingTimeConstant = 0.3;
        source.connect(analyser);
        // NOTE: We do NOT connect analyser to audioContext.destination
        // (no audio playback — just analysis)

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        setIsAudioReady(true);

        console.log("🎤 Audio Proctoring: Microphone ready ✓");
      } catch (err) {
        if (cancelled) return;

        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          console.error("🎤 Audio Proctoring: Microphone access DENIED");
          setAudioBlocked(true);
        } else {
          console.error("🎤 Audio Proctoring: Init error:", err.message);
        }
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  // ─────────────────────────────────────────────────────────────
  // STEP 2: Start volume monitoring when assessment starts
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!assessmentStarted || !isAudioReady) return;
    if (loopStartedRef.current) return;

    const analyser = analyserRef.current;
    if (!analyser) return;

    loopStartedRef.current = true;
    graceActiveRef.current = true;

    console.log(
      `🎤 Audio Proctoring: Monitoring started. ${gracePeriodMs / 1000}s grace period...`
    );

    const graceTimer = setTimeout(() => {
      graceActiveRef.current = false;
      console.log(
        "🎤 Audio Proctoring: Grace period ended — voice detection ACTIVE 🔴"
      );
    }, gracePeriodMs);

    // Frequency data buffer (reused each check)
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    intervalRef.current = setInterval(() => {
      // Resume AudioContext if suspended (browser autoplay policy)
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume();
      }

      analyser.getByteFrequencyData(dataArray);

      // Calculate average volume across all frequency bins
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avgVolume = Math.round(sum / dataArray.length);
      setCurrentVolume(avgVolume);

      // Grace period active — track volume but don't fire violations
      if (graceActiveRef.current) return;

      if (avgVolume > volumeThreshold) {
        sustainedCountRef.current += 1;
        setIsTalkingDetected(true);

        if (sustainedCountRef.current >= sustainedChecks) {
          console.warn(
            `🎤 Audio Proctoring: Voice detected! (avg=${avgVolume}, sustained=${sustainedCountRef.current})`
          );
          onViolationRef.current?.(
            "talking_detected",
            "Voice or audio detected. Please remain silent during the assessment."
          );
          sustainedCountRef.current = 0;
        }
      } else {
        sustainedCountRef.current = 0;
        setIsTalkingDetected(false);
      }
    }, checkIntervalMs);

    return () => {
      clearTimeout(graceTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [assessmentStarted, isAudioReady, gracePeriodMs, volumeThreshold, sustainedChecks, checkIntervalMs]);

  // ─────────────────────────────────────────────────────────────
  // Cleanup on unmount
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      console.log("🎤 Audio Proctoring: Cleaned up ✓");
    };
  }, []);

  return {
    isAudioReady,
    currentVolume,       // 0-255 average volume level
    isTalkingDetected,   // true when volume sustained above threshold
    audioBlocked,        // true if mic permission denied
  };
};

export default useAudioProctoring;
