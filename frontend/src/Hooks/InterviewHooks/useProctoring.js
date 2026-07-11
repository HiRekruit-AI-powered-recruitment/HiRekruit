import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useProctoring — lightweight interview proctoring hook.
 *
 * Behaviour:
 *  1. When `interviewStarted` becomes true, detect if already in fullscreen
 *     (entered by InterviewStartRoute on the Start button click).
 *  2. Listen for fullscreen-exit, tab-switch (visibilitychange), and window blur.
 *  3. First violation  → show a warning; candidate must click to re-enter fullscreen.
 *  4. Second violation → fire `onAutoSubmit` callback (auto-ends the interview).
 *
 * A 3-second cooldown after each violation prevents multiple browser events
 * (blur + visibilitychange) from double-firing in the same tick.
 *
 * @param {object}   opts
 * @param {boolean}  opts.enabled           – false for HR observers
 * @param {boolean}  opts.interviewStarted  – true once the AI interview begins
 * @param {function} opts.onAutoSubmit      – called on the 2nd violation
 */
const useProctoring = ({ enabled = true, interviewStarted = false, onAutoSubmit }) => {
  // "idle" → "warned" → "submitted"
  const [warningStage, setWarningStage] = useState("idle");
  const [activeWarning, setActiveWarning] = useState(null); // { type, message } | null
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs to avoid stale closures in event listeners
  const warningStageRef = useRef("idle");
  const enabledRef = useRef(enabled);
  const interviewStartedRef = useRef(interviewStarted);
  const onAutoSubmitRef = useRef(onAutoSubmit);
  const hasRequestedFullscreen = useRef(false);
  const cooldownUntilRef = useRef(0); // timestamp: ignore violations until this time
  const monitoringActiveRef = useRef(false); // true after grace period expires

  // Keep refs in sync
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);
  useEffect(() => { interviewStartedRef.current = interviewStarted; }, [interviewStarted]);
  useEffect(() => { onAutoSubmitRef.current = onAutoSubmit; }, [onAutoSubmit]);

  // ─── Handle a violation ────────────────────────────────────────────
  const handleViolation = useCallback((type, message) => {
    if (!enabledRef.current || !interviewStartedRef.current) return;
    // Grace period: don't fire during VAPI/WebRTC initialization
    if (!monitoringActiveRef.current) return;

    // Cooldown: ignore violations that happen within 3s of the last one
    const now = Date.now();
    if (now < cooldownUntilRef.current) {
      console.log(`🛡️ Proctoring: Ignoring "${type}" (cooldown active)`);
      return;
    }

    const stage = warningStageRef.current;

    if (stage === "idle") {
      // First violation → warn
      console.warn(`🛡️ Proctoring [WARNING]: ${type} — ${message}`);
      warningStageRef.current = "warned";
      cooldownUntilRef.current = now + 3000; // 3s cooldown
      setWarningStage("warned");
      setActiveWarning({ type, message });
    } else if (stage === "warned") {
      // Second violation → auto-submit
      console.error(`🛡️ Proctoring [AUTO-SUBMIT]: ${type} — ${message}`);
      warningStageRef.current = "submitted";
      setWarningStage("submitted");
      setActiveWarning(null);
      if (typeof onAutoSubmitRef.current === "function") {
        onAutoSubmitRef.current();
      }
    }
    // If already "submitted", ignore further violations
  }, []);

  // ─── Fullscreen helpers ────────────────────────────────────────────
  const requestFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
      console.log("🛡️ Proctoring: Entered fullscreen");
    } catch (err) {
      console.warn("🛡️ Proctoring: Could not enter fullscreen:", err.message);
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn("🛡️ Proctoring: Could not exit fullscreen:", err.message);
    }
  }, []);

  // ─── Dismiss warning (candidate clicks re-enter fullscreen) ────────
  const dismissWarning = useCallback(() => {
    setActiveWarning(null);
    // Reset cooldown so the next real violation is caught
    cooldownUntilRef.current = Date.now() + 2000; // 2s grace after dismissing
    requestFullscreen();
  }, [requestFullscreen]);

  // ─── Detect existing fullscreen when interview starts ──────────────
  useEffect(() => {
    if (!enabled || !interviewStarted) return;

    // InterviewStartRoute already requested fullscreen on the Start click.
    // Detect that and set the flag so exit-detection works.
    const alreadyFullscreen = Boolean(
      document.fullscreenElement || document.webkitFullscreenElement,
    );

    if (alreadyFullscreen) {
      hasRequestedFullscreen.current = true;
      setIsFullscreen(true);
      console.log("🛡️ Proctoring: Detected existing fullscreen");
    } else {
      // Fallback: try to request fullscreen (may fail without gesture)
      hasRequestedFullscreen.current = true;
      requestFullscreen();
    }

    // 🛡️ Grace period: wait 10 seconds after interview starts before
    // monitoring violations. This lets VAPI/WebRTC fully initialize
    // without triggering false blur/visibility events.
    console.log("🛡️ Proctoring: 10s grace period started (monitoring paused)");
    const graceTimer = setTimeout(() => {
      monitoringActiveRef.current = true;
      console.log("🛡️ Proctoring: Grace period ended — monitoring active");
    }, 10000);

    return () => clearTimeout(graceTimer);
  }, [enabled, interviewStarted, requestFullscreen]);

  // ─── Event listeners ──────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    // 1. Fullscreen change
    const onFullscreenChange = () => {
      const isFull = Boolean(
        document.fullscreenElement || document.webkitFullscreenElement,
      );
      setIsFullscreen(isFull);

      if (!isFull && interviewStartedRef.current && hasRequestedFullscreen.current) {
        handleViolation(
          "fullscreen_exit",
          "You exited fullscreen mode. Please stay in fullscreen during the interview.",
        );
      }
    };

    // 2. Tab switch / minimize (visibility API)
    const onVisibilityChange = () => {
      if (document.hidden && interviewStartedRef.current) {
        handleViolation(
          "tab_switch",
          "You switched away from the interview tab. Please stay on the interview page.",
        );
      }
    };

    // 3. Window blur (alt-tab, clicking outside browser)
    const onWindowBlur = () => {
      if (interviewStartedRef.current) {
        handleViolation(
          "window_blur",
          "You moved away from the interview window. Please stay focused on the interview.",
        );
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [enabled, handleViolation]);

  return {
    warningStage,       // "idle" | "warned" | "submitted"
    activeWarning,      // { type, message } | null
    isFullscreen,       // boolean
    requestFullscreen,
    exitFullscreen,
    dismissWarning,     // clears warning + re-enters fullscreen
  };
};

export default useProctoring;
