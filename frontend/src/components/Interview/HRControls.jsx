import React from "react";
import { Hand, Mic, MicOff, Play } from "lucide-react";

const HRControls = ({
  livekitConnected,
  interviewStarted,
  aiPaused,
  hrHandRaised,
  hrSpeaking,
  hrName,
  handleHrHandRaise,
  handleHrStartSpeaking,
  handleHrStopSpeaking,
  handleResumeAI,
}) => {
  if (!livekitConnected || !interviewStarted) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-3 border-yellow-400 rounded-2xl p-6 mb-6 shadow-xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
            <Hand className="w-6 h-6 text-yellow-900" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              HR Manager Controls
            </h3>
            <p className="text-sm text-gray-600">
              {aiPaused
                ? "AI is paused. You can speak now."
                : hrHandRaised
                ? "Waiting for AI to finish..."
                : "Raise hand to pause AI and ask questions"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!aiPaused && !hrHandRaised && (
            <button
              onClick={handleHrHandRaise}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <Hand className="w-5 h-5" />
              Raise Hand
            </button>
          )}
          {aiPaused && !hrSpeaking && (
            <button
              onClick={handleHrStartSpeaking}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <Mic className="w-5 h-5" />
              Start Speaking
            </button>
          )}
          {hrSpeaking && (
            <button
              onClick={handleHrStopSpeaking}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <MicOff className="w-5 h-5" />
              Stop Speaking
            </button>
          )}
          {aiPaused && (
            <button
              onClick={handleResumeAI}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Resume AI
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRControls;
