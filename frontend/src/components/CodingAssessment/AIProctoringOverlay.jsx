import { useEffect, useRef } from "react";
import { CameraOff, Loader, Mic, MicOff, Wifi, WifiOff } from "lucide-react";

/**
 * AIProctoringOverlay — Floating proctoring status bar at top-center.
 *
 * Shows:
 *  - Camera preview thumbnail
 *  - Face detection status (green/yellow/red dot)
 *  - Audio monitoring status (mic icon + volume bar)
 */
const AIProctoringOverlay = ({
  videoRef,
  detectionStatus,
  faceCount,
  isLookingAway,
  isModelLoading,
  firstDetectionDone,
  // Audio props
  isAudioReady = false,
  isTalkingDetected = false,
  currentVolume = 0,
  audioBlocked = false,
  // Guard 2 (Server) props
  serverActive = false,
  isServerConnected = false,
  lastAnalysis = null,
}) => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Draw camera preview thumbnail
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef?.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    let running = true;

    const drawFrame = () => {
      if (!running) return;
      // Re-check video ref in case it changed
      const v = videoRef?.current;
      if (v && v.readyState >= 2) {
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      }
      animFrameRef.current = requestAnimationFrame(drawFrame);
    };

    // Always start the loop — it checks readyState each frame,
    // so it'll draw as soon as video is ready. No event listener needed.
    drawFrame();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [videoRef, detectionStatus]);

  // ── Face status ──
  let faceDotColor = "#22c55e";
  let faceStatusText = "Face OK";

  if (isModelLoading || detectionStatus === "loading") {
    faceDotColor = "#eab308";
    faceStatusText = "Loading...";
  } else if (detectionStatus === "error" || detectionStatus === "blocked") {
    faceDotColor = "#ef4444";
    faceStatusText = "Error";
  } else if (detectionStatus === "ready") {
    faceDotColor = "#3b82f6";
    faceStatusText = "Ready";
  } else if (detectionStatus === "running") {
    if (!firstDetectionDone) {
      faceDotColor = "#3b82f6";
      faceStatusText = "Starting...";
    } else if (faceCount === 0) {
      faceDotColor = "#ef4444";
      faceStatusText = "No face";
    } else if (faceCount > 1) {
      faceDotColor = "#ef4444";
      faceStatusText = `${faceCount} faces`;
    } else if (isLookingAway) {
      faceDotColor = "#f97316";
      faceStatusText = "Look here";
    } else {
      faceDotColor = "#22c55e";
      faceStatusText = "Face OK";
    }
  }

  // ── Audio status ──
  let audioDotColor = "#22c55e";
  let audioStatusText = "Audio OK";

  if (audioBlocked) {
    audioDotColor = "#ef4444";
    audioStatusText = "Mic blocked";
  } else if (!isAudioReady) {
    audioDotColor = "#eab308";
    audioStatusText = "Mic loading";
  } else if (isTalkingDetected) {
    audioDotColor = "#ef4444";
    audioStatusText = "Voice!";
  } else {
    audioDotColor = "#22c55e";
    audioStatusText = "Audio OK";
  }

  // ── Guard 2 (Server) status ──
  let serverDotColor = "#6b7280";
  let serverStatusText = "Server";

  if (!isServerConnected) {
    serverDotColor = "#6b7280";
    serverStatusText = "Offline";
  } else if (!serverActive) {
    serverDotColor = "#eab308";
    serverStatusText = "Connecting";
  } else if (lastAnalysis?.is_violation) {
    serverDotColor = "#ef4444";
    serverStatusText = "Alert!";
  } else {
    serverDotColor = "#22c55e";
    serverStatusText = "Server OK";
  }

  if (detectionStatus === "disabled") return null;

  // Volume bar width (0-100%)
  const volumePercent = Math.min(100, Math.round((currentVolume / 80) * 100));

  return (
    <div
      style={{
        position: "fixed",
        top: "12px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "6px 14px 6px 6px",
        borderRadius: "16px",
        backgroundColor: "rgba(0, 0, 0, 0.72)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Camera preview */}
      <div
        style={{
          position: "relative",
          width: "64px",
          height: "48px",
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: "#1a1a1a",
          flexShrink: 0,
        }}
      >
        <canvas
          ref={canvasRef}
          width={128}
          height={96}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {(detectionStatus === "loading" || detectionStatus === "blocked") && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
            }}
          >
            {detectionStatus === "blocked" ? (
              <CameraOff size={18} color="#ef4444" />
            ) : (
              <Loader size={18} color="#eab308" style={{ animation: "proctor-spin 1.5s linear infinite" }} />
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ width: "1px", height: "28px", backgroundColor: "rgba(255,255,255,0.12)" }} />

      {/* Face status */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: faceDotColor,
            boxShadow: `0 0 6px ${faceDotColor}80`,
            transition: "background-color 0.3s",
          }}
        />
        <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap" }}>
          {faceStatusText}
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: "1px", height: "28px", backgroundColor: "rgba(255,255,255,0.12)" }} />

      {/* Audio status */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {audioBlocked ? (
          <MicOff size={13} color="#ef4444" />
        ) : (
          <Mic size={13} color={isTalkingDetected ? "#ef4444" : "rgba(255,255,255,0.6)"} />
        )}

        {/* Volume bar */}
        {isAudioReady && !audioBlocked && (
          <div
            style={{
              width: "36px",
              height: "4px",
              borderRadius: "2px",
              backgroundColor: "rgba(255,255,255,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${volumePercent}%`,
                height: "100%",
                borderRadius: "2px",
                backgroundColor: isTalkingDetected ? "#ef4444" : "#22c55e",
                transition: "width 0.15s ease, background-color 0.3s",
              }}
            />
          </div>
        )}

        <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap" }}>
          {audioStatusText}
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: "1px", height: "28px", backgroundColor: "rgba(255,255,255,0.12)" }} />

      {/* Guard 2 — Server status */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {isServerConnected ? (
          <Wifi size={13} color={serverActive ? "rgba(255,255,255,0.6)" : "#eab308"} />
        ) : (
          <WifiOff size={13} color="#6b7280" />
        )}
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: serverDotColor,
            boxShadow: `0 0 6px ${serverDotColor}80`,
            transition: "background-color 0.3s",
          }}
        />
        <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap" }}>
          {serverStatusText}
        </span>
      </div>

      {/* Animations */}
      <style>
        {`@keyframes proctor-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
};

export default AIProctoringOverlay;
