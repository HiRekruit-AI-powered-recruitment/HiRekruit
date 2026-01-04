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
  return (
    <div className="bg-white border-3 border-gray-900 rounded-2xl overflow-hidden shadow-xl">
      <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative overflow-hidden">
        {cameraPermission === "granted" && !isVideoOff ? (
          <div
            ref={localVideoRef}
            className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
          />
        ) : cameraPermission === "denied" ? (
          <div className="text-center p-6">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CameraOff className="w-10 h-10 text-red-400" />
            </div>
            <p className="text-red-300 font-semibold mb-2">
              Camera Access Denied
            </p>
            <p className="text-gray-400 text-sm">
              You can still join audio-only
            </p>
          </div>
        ) : isVideoOff ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <VideoOff className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-300 font-semibold">Video is Off</p>
          </div>
        ) : livekitConnected ? (
          <div
            ref={localVideoRef}
            className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
          />
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Camera className="w-10 h-10 text-indigo-400" />
            </div>
            <p className="text-gray-300 font-semibold">
              Requesting Camera Access...
            </p>
          </div>
        )}

        {isRecording && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 font-bold border-2 border-red-700 shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            RECORDING
          </div>
        )}

        {isMuted && (
          <div className="absolute top-4 right-4 bg-red-600 text-white p-3 rounded-xl border-2 border-red-700 shadow-lg">
            <MicOff className="w-5 h-5" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${
                  isHR
                    ? "bg-gradient-to-br from-purple-500 to-pink-600"
                    : "bg-gradient-to-br from-blue-500 to-indigo-600"
                } rounded-full flex items-center justify-center border-2 border-white shadow-lg`}
              >
                <span className="text-white font-bold text-sm">
                  {isHR
                    ? hrName.charAt(0).toUpperCase()
                    : userData?.name?.charAt(0).toUpperCase() || "C"}
                </span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  {isHR ? hrName : userData?.name || "Candidate"}
                </p>
                <p className="text-white/80 text-xs">
                  {isHR ? "HR Manager" : "You"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full border border-white/20">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  livekitConnected
                    ? "bg-green-500 animate-pulse"
                    : "bg-yellow-500"
                }`}
              ></div>
              <span className="text-xs text-white font-medium">
                {livekitConnected ? "Connected" : "Connecting"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 border-t-3 border-gray-900 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700">
              Your Feed
            </span>
          </div>
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            {showTranscript ? "Hide" : "View"} Transcript
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocalVideoPanel;
