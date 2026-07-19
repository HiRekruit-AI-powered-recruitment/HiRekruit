import { useState, useEffect, useRef, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import * as faceDetection from "@tensorflow-models/face-detection";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

/**
 * useAIProctoring — Guard 1: Browser-side TensorFlow.js proctoring.
 *
 * Architecture:
 *   The <video> element is ALWAYS in the DOM (positioned off-screen).
 *   This means videoRef.current is available from mount onwards.
 *
 *   STEP 1 (on mount): Request camera + load TF models + attach stream to video
 *   STEP 2 (on assessmentStarted): Start the detection interval loop
 *
 *   The hook exposes `modelsReady` so the Instructions page can disable the
 *   Start button until everything is loaded.
 */
const useAIProctoring = ({
  enabled = true,
  assessmentStarted = false,
  onViolation,
  videoRef,
  detectionIntervalMs = 2500,
  gracePeriodMs = 10000,
}) => {
  // ── Public state ──
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState(null);
  const [faceCount, setFaceCount] = useState(0);
  const [isLookingAway, setIsLookingAway] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState("loading");
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const [firstDetectionDone, setFirstDetectionDone] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);

  // ── Internal refs ──
  const faceDetectorRef    = useRef(null);
  const faceMeshRef        = useRef(null);
  const streamRef          = useRef(null);
  const intervalRef        = useRef(null);
  const graceActiveRef     = useRef(true);
  const loopStartedRef     = useRef(false);
  const onViolationRef     = useRef(onViolation);
  const firstDetectionRef  = useRef(false); // tracks first detection without recreating runDetection

  // Consecutive-check counters — require 2 bad checks before firing
  const noFaceCountRef     = useRef(0);
  const multiFaceCountRef  = useRef(0);
  const lookAwayCountRef   = useRef(0);

  // Keep callback ref in sync
  useEffect(() => { onViolationRef.current = onViolation; }, [onViolation]);

  // ─────────────────────────────────────────────────────────────
  // Gaze analysis: iris position relative to eye corners
  // ─────────────────────────────────────────────────────────────
  const analyzeGaze = useCallback((keypoints) => {
    if (!keypoints || keypoints.length < 478) return false;

    const leftIris   = keypoints[468];
    const rightIris  = keypoints[473];
    const leftOuter  = keypoints[33];
    const leftInner  = keypoints[133];
    const rightInner = keypoints[362];
    const rightOuter = keypoints[263];

    const leftEyeWidth  = leftInner.x  - leftOuter.x;
    const rightEyeWidth = rightOuter.x - rightInner.x;
    if (leftEyeWidth < 1 || rightEyeWidth < 1) return false;

    const leftHRatio    = (leftIris.x  - leftOuter.x)  / leftEyeWidth;
    const rightHRatio   = (rightIris.x - rightInner.x) / rightEyeWidth;
    const avgHorizontal = (leftHRatio + rightHRatio) / 2;

    const leftTop       = keypoints[159];
    const leftBottom    = keypoints[145];
    const rightTop      = keypoints[386];
    const rightBottom   = keypoints[374];
    const leftEyeH      = leftBottom.y  - leftTop.y;
    const rightEyeH     = rightBottom.y - rightTop.y;
    if (leftEyeH < 1 || rightEyeH < 1) return false;

    const leftVRatio    = (leftIris.y  - leftTop.y)  / leftEyeH;
    const rightVRatio   = (rightIris.y - rightTop.y) / rightEyeH;
    const avgVertical   = (leftVRatio + rightVRatio) / 2;

    return (avgHorizontal < 0.22 || avgHorizontal > 0.78) ||
           (avgVertical   < 0.12 || avgVertical   > 0.88);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // One detection cycle (called every 2.5s by setInterval)
  // ─────────────────────────────────────────────────────────────
  const runDetection = useCallback(async () => {
    const video = videoRef?.current;
    if (!video || !faceDetectorRef.current) return;

    // Safety: re-attach stream if video lost its srcObject (e.g. DOM remount)
    if (!video.srcObject && streamRef.current) {
      video.srcObject = streamRef.current;
      video.play().catch(() => {});
      console.log("🤖 AI Proctoring: Re-attached stream to video");
      return; // wait for next cycle for readyState to catch up
    }

    if (video.readyState < 2) return;
    if (document.hidden) return;

    try {
      const faces = await faceDetectorRef.current.estimateFaces(video);
      const count = faces.length;
      setFaceCount(count);

      // Track first successful detection via ref (avoids recreating this callback)
      if (!firstDetectionRef.current) {
        firstDetectionRef.current = true;
        setFirstDetectionDone(true);
      }

      if (graceActiveRef.current) return;

      // No face
      if (count === 0) {
        multiFaceCountRef.current = 0;
        lookAwayCountRef.current  = 0;
        setIsLookingAway(false);
        noFaceCountRef.current += 1;
        if (noFaceCountRef.current >= 2) {
          onViolationRef.current?.("no_face", "No face detected. Please stay visible to the camera.");
          noFaceCountRef.current = 0;
        }
        return;
      }

      // Multiple faces
      if (count > 1) {
        noFaceCountRef.current    = 0;
        lookAwayCountRef.current  = 0;
        setIsLookingAway(false);
        multiFaceCountRef.current += 1;
        if (multiFaceCountRef.current >= 2) {
          onViolationRef.current?.("multiple_faces", "Multiple faces detected. Only the candidate should be visible.");
          multiFaceCountRef.current = 0;
        }
        return;
      }

      // Exactly 1 face — check gaze
      noFaceCountRef.current    = 0;
      multiFaceCountRef.current = 0;

      if (faceMeshRef.current) {
        const meshFaces = await faceMeshRef.current.estimateFaces(video);
        if (meshFaces.length > 0 && meshFaces[0].keypoints) {
          const lookingAway = analyzeGaze(meshFaces[0].keypoints);
          setIsLookingAway(lookingAway);
          if (lookingAway) {
            lookAwayCountRef.current += 1;
            if (lookAwayCountRef.current >= 2) {
              onViolationRef.current?.("looking_away", "You appear to be looking away from the screen. Please focus on the assessment.");
              lookAwayCountRef.current = 0;
            }
          } else {
            lookAwayCountRef.current = 0;
          }
        }
      }
    } catch (err) {
      console.error("🤖 AI Proctoring: Detection error:", err.message);
    }
  }, [videoRef, analyzeGaze]); // NO firstDetectionDone — uses ref to avoid callback recreation

  // ─────────────────────────────────────────────────────────────
  // STEP 1: Request camera + load TF models + attach to video
  //
  // The <video> element is always in the DOM (rendered unconditionally
  // in Assessment.jsx), so videoRef.current is available from mount.
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) {
      setIsModelLoading(false);
      setDetectionStatus("disabled");
      return;
    }

    let cancelled = false;

    const initialize = async () => {
      try {
        setDetectionStatus("loading");
        setIsModelLoading(true);
        console.log("🤖 AI Proctoring: Requesting camera access...");

        // 1. Request camera stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;

        // 2. Attach stream to video element and start playback
        //    (video element is always in DOM now)
        const video = videoRef?.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {});
          console.log(`🤖 AI Proctoring: Stream attached + playing ✓ (readyState=${video.readyState}, ${video.videoWidth}x${video.videoHeight})`);
        } else {
          console.warn("🤖 AI Proctoring: videoRef.current is null — stream stored for later");
        }

        // 3. Initialize TensorFlow.js
        console.log("🤖 AI Proctoring: Loading TF.js models...");
        await tf.setBackend("webgl");
        await tf.ready();
        if (cancelled) return;

        // 4. Load face detector
        const detector = await faceDetection.createDetector(
          faceDetection.SupportedModels.MediaPipeFaceDetector,
          { runtime: "tfjs" }
        );
        if (cancelled) return;
        faceDetectorRef.current = detector;
        console.log("🤖 AI Proctoring: Face detector loaded ✓");

        // 5. Load face mesh
        const mesh = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          { runtime: "tfjs", refineLandmarks: true }
        );
        if (cancelled) return;
        faceMeshRef.current = mesh;
        console.log("🤖 AI Proctoring: Face mesh loaded ✓");

        setIsModelLoading(false);
        setModelsReady(true);
        setDetectionStatus("ready");
        console.log("🤖 AI Proctoring: All models ready ✅");

      } catch (err) {
        if (cancelled) return;
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          console.error("🤖 AI Proctoring: Camera access DENIED");
          setCameraBlocked(true);
          setDetectionStatus("blocked");
          setModelError("Camera access denied");
        } else {
          console.error("🤖 AI Proctoring: Init error:", err.message);
          setModelError(err.message);
          setDetectionStatus("error");
        }
        setIsModelLoading(false);
      }
    };

    initialize();
    return () => { cancelled = true; };
  }, [enabled, videoRef]);

  // ─────────────────────────────────────────────────────────────
  // STEP 2: Start detection loop when assessment starts + models ready
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!assessmentStarted || !modelsReady) return;
    if (loopStartedRef.current) return;

    const video = videoRef?.current;
    if (!video) return;

    // Wait for video to have frame data
    const startLoop = () => {
      if (loopStartedRef.current) return;
      loopStartedRef.current = true;

      setDetectionStatus("running");
      graceActiveRef.current = true;

      console.log(`🤖 AI Proctoring: Detection loop STARTED. ${gracePeriodMs / 1000}s grace period...`);

      const graceTimer = setTimeout(() => {
        graceActiveRef.current = false;
        console.log("🤖 AI Proctoring: Grace period ended — violations ACTIVE 🔴");
      }, gracePeriodMs);

      intervalRef.current = setInterval(runDetection, detectionIntervalMs);

      // Store graceTimer for cleanup
      video._proctorGraceTimer = graceTimer;
    };

    if (video.readyState >= 2) {
      startLoop();
    } else {
      video.addEventListener("canplay", startLoop, { once: true });
    }

    return () => {
      video.removeEventListener("canplay", startLoop);
      if (video._proctorGraceTimer) clearTimeout(video._proctorGraceTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [assessmentStarted, modelsReady, videoRef, gracePeriodMs, detectionIntervalMs, runDetection]);

  // ─────────────────────────────────────────────────────────────
  // Cleanup on unmount
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      faceDetectorRef.current?.dispose?.();
      faceMeshRef.current?.dispose?.();
      console.log("🤖 AI Proctoring: Cleaned up ✓");
    };
  }, []);

  return {
    isModelLoading,
    modelError,
    faceCount,
    isLookingAway,
    detectionStatus,
    cameraBlocked,
    firstDetectionDone,
    modelsReady,
  };
};

export default useAIProctoring;
