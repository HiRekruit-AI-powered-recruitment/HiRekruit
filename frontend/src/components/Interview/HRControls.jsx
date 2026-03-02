import React from "react";
import { Hand, Mic, MicOff, Play, Pause as PauseIcon } from "lucide-react";

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
                ? "🎤 AI Paused - Have a real conversation with the candidate"
                : hrHandRaised
                  ? "⏳ Waiting for AI to finish speaking..."
                  : "🎯 Pause AI anytime to ask questions or have a conversation"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* 🔴 NEW: Direct Pause/Resume AI Button */}
          {!aiPaused && (
            <button
              onClick={handleHrHandRaise}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 border-2 border-red-700"
              title="Click to pause AI immediately"
            >
              <PauseIcon className="w-5 h-5" />
              Pause AI
            </button>
          )}

          {/* Start Speaking Button - Available when AI is paused and HR is not speaking */}
          {aiPaused && !hrSpeaking && (
            <button
              onClick={handleHrStartSpeaking}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 border-2 border-green-800"
              title="Start speaking to the candidate"
            >
              <Mic className="w-5 h-5" />
              Start Speaking
            </button>
          )}

          {/* Stop Speaking Button - Available when HR is speaking */}
          {hrSpeaking && (
            <button
              onClick={handleHrStopSpeaking}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 border-2 border-orange-800"
              title="Stop speaking and resume AI"
            >
              <MicOff className="w-5 h-5" />
              Stop Speaking & Resume AI
            </button>
          )}

          {/* Resume AI Button - Available when AI is paused and HR is not speaking */}
          {aiPaused && !hrSpeaking && (
            <button
              onClick={handleResumeAI}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 border-2 border-indigo-800"
              title="Resume AI interviewer"
            >
              <Play className="w-5 h-5" />
              Resume AI
            </button>
          )}
        </div>
      </div>

      {/* 🔴 NEW: Helpful Tips Section */}
      {aiPaused && (
        <div className="mt-4 pt-4 border-t-2 border-yellow-400">
          <div className="bg-white rounded-lg p-4 border-2 border-yellow-300">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              💡 Conversation Tips:
            </p>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>
                ✓ Ask follow-up questions about their experience or projects
              </li>
              <li>✓ Let the candidate explain their thought process</li>
              <li>✓ Listen to their answers before clicking "Stop Speaking"</li>
              <li>✓ Click "Resume AI" when done to continue the interview</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRControls;
