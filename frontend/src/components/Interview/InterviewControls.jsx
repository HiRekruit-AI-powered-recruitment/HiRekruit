import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
} from "lucide-react";

const InterviewControls = ({
  livekitConnected,
  isMuted,
  isVideoOff,
  interviewStarted,
  isHR,
  showTranscript,
  hrPresent,
  isVapiReady,
  cameraPermission,
  toggleAudio,
  toggleVideo,
  handleEndInterview,
  setShowTranscript,
}) => {
  return (
    <div className="bg-white border-3 border-gray-900 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {/* MUTE/UNMUTE BUTTON */}
        <button
          onClick={toggleAudio}
          disabled={!livekitConnected}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all transform hover:scale-105 border-3 shadow-lg ${
            !livekitConnected
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
              : isMuted
                ? "bg-red-500 hover:bg-red-600 text-white border-red-700"
                : "bg-white hover:bg-gray-50 text-gray-900 border-gray-900"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>

        {/* VIDEO ON/OFF BUTTON */}
        <button
          onClick={toggleVideo}
          disabled={!livekitConnected}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all transform hover:scale-105 border-3 shadow-lg ${
            !livekitConnected
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
              : isVideoOff
                ? "bg-red-500 hover:bg-red-600 text-white border-red-700"
                : "bg-white hover:bg-gray-50 text-gray-900 border-gray-900"
          }`}
          title={isVideoOff ? "Turn on camera" : "Turn off camera"}
        >
          {isVideoOff ? (
            <VideoOff className="w-6 h-6" />
          ) : (
            <Video className="w-6 h-6" />
          )}
        </button>

        {/* END/LEAVE INTERVIEW BUTTON */}
        <button
          onClick={handleEndInterview}
          disabled={!livekitConnected}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all transform hover:scale-105 border-3 shadow-lg ${
            livekitConnected
              ? "bg-red-500 hover:bg-red-600 text-white border-red-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
          }`}
          title={isHR ? "Leave Interview" : "End Interview"}
        >
          <PhoneOff className="w-6 h-6" />
        </button>

        {/* TRANSCRIPT TOGGLE BUTTON */}
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          disabled={!interviewStarted && !isHR}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all transform hover:scale-105 border-3 shadow-lg ${
            !interviewStarted && !isHR
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
              : showTranscript
                ? "bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-700"
                : "bg-white hover:bg-gray-50 text-gray-900 border-gray-900"
          }`}
          title={showTranscript ? "Hide Transcript" : "Show Transcript"}
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>

      {/* STATUS MESSAGE */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 font-medium">
          {isHR
            ? interviewStarted
              ? "🎙️ Interview in progress - You can raise your hand to intervene"
              : livekitConnected
                ? "⏳ Waiting for interview to start..."
                : "🔌 Connecting..."
            : !interviewStarted &&
                isVapiReady &&
                (cameraPermission === "granted" ||
                  cameraPermission === "denied")
              ? "✅ Ready to start (HR can join anytime)"
              : !interviewStarted &&
                  cameraPermission !== "granted" &&
                  cameraPermission !== "denied"
                ? "⚠️ Requesting camera and microphone access..."
                : interviewStarted
                  ? hrPresent
                    ? "🎙️ Interview in progress - HR is observing"
                    : "🎙️ Interview in progress - HR can join anytime"
                  : "⏳ Preparing interview session..."}
        </p>
      </div>
    </div>
  );
};

export default InterviewControls;
