import React from "react";
import { Camera, CameraOff, VideoOff, MicOff } from "lucide-react";

const LocalVideoPanel = ({
  localVideoRef,
  cameraPermission,
  isVideoOff,
  livekitConnected,
  isRecording,
  isMuted,
  isHR,
  hrName,
  userData,
  showTranscript,
  setShowTranscript,
}) => {
  const displayName = isHR ? hrName : userData?.name || "Candidate";

  // 🔑 Show overlay ONLY in these specific cases
  const showOverlay =
    cameraPermission === "denied" ||
    cameraPermission === "prompt" ||
    isVideoOff ||
    !livekitConnected;

  // 🔴 DEBUG: Log state changes (with proper useEffect to prevent loops)
  React.useEffect(() => {
    console.log("📹 LocalVideoPanel state changed:", {
      cameraPermission,
      isVideoOff,
      livekitConnected,
      showOverlay,
    });
  }, [cameraPermission, isVideoOff, livekitConnected, showOverlay]);

  return (
    <div className="bg-white border-3 border-gray-900 rounded-2xl overflow-hidden shadow-xl">
      <div
        className="relative w-full"
        style={{
          aspectRatio: "16 / 9",
          backgroundColor: "#000000",
          minHeight: "300px", // 🔴 DEBUG: Ensure minimum height
        }}
      >
        {/* 🎥 VIDEO CONTAINER (ALWAYS MOUNTED) - Simple and direct */}
        <div
          ref={localVideoRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
            backgroundColor: "#000000",
            display: "block",
            overflow: "hidden",
            border: "2px solid #ff00ff", // 🔴 DEBUG: Magenta border to see the container
            visibility: "visible",
            opacity: 1,
          }}
          className="!block !visible" // Tailwind utility as fallback
        />

        {/* ⚠️ OVERLAY (ONLY WHEN NEEDED) */}
        {showOverlay && (
          <div
            className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center text-center"
            style={{ zIndex: 20 }}
          >
            {cameraPermission === "denied" && (
              <>
                <CameraOff className="w-12 h-12 text-red-400 mb-3" />
                <p className="text-red-300 font-semibold text-lg">
                  Camera Access Denied
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  You can still join with audio
                </p>
              </>
            )}

            {cameraPermission === "prompt" && (
              <>
                <Camera className="w-12 h-12 text-yellow-400 animate-pulse mb-3" />
                <p className="text-yellow-300 font-semibold text-lg">
                  Requesting Camera Access
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Please allow camera and microphone
                </p>
              </>
            )}

            {cameraPermission === "granted" && isVideoOff && (
              <>
                <VideoOff className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-300 font-semibold text-lg">
                  Camera is Off
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Click the camera button to turn it on
                </p>
              </>
            )}

            {!livekitConnected && cameraPermission !== "denied" && (
              <>
                <Camera className="w-12 h-12 text-indigo-400 animate-pulse mb-3" />
                <p className="text-indigo-300 font-semibold text-lg">
                  Connecting to Room…
                </p>
                <p className="text-gray-400 text-sm mt-1">Please wait...</p>
              </>
            )}
          </div>
        )}

        {/* 🔴 RECORDING INDICATOR */}
        {isRecording && (
          <div className="absolute top-4 left-4 z-30 bg-red-600 text-white px-3 py-1.5 rounded-xl text-sm flex items-center gap-2 font-bold shadow-lg">
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
            RECORDING
          </div>
        )}

        {/* 🔇 MUTED INDICATOR */}
        {isMuted && (
          <div className="absolute top-4 right-4 z-30 bg-red-600 text-white p-3 rounded-xl shadow-lg">
            <MicOff className="w-5 h-5" />
          </div>
        )}

        {/* 👤 USER INFO BAR */}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-lg ${
                  isHR
                    ? "bg-gradient-to-br from-purple-500 to-pink-600"
                    : "bg-gradient-to-br from-blue-500 to-indigo-600"
                }`}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="text-white font-semibold text-sm">
                  {displayName}
                </p>
                <p className="text-white/70 text-xs">
                  {isHR ? "HR Manager" : "You"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-black/50 rounded-full border border-white/20">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  livekitConnected
                    ? "bg-green-500 animate-pulse"
                    : "bg-yellow-500 animate-pulse"
                }`}
              />
              <span className="text-xs text-white font-medium">
                {livekitConnected ? "Connected" : "Connecting"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🔽 FOOTER */}
      <div className="p-4 border-t-3 border-gray-900 bg-gray-100 flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">Your Feed</span>
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          {showTranscript ? "Hide" : "View"} Transcript
        </button>
      </div>
    </div>
  );
};

export default LocalVideoPanel;
