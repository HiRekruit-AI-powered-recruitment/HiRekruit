// AIInterviewerPanel.jsx
import React from "react";
import { Hand, MessageSquare, Volume2 } from "lucide-react";
import AnimatedAvatar from "./AnimatedAvatar";

const AIInterviewerPanel = ({
  blinkState,
  mouthOpen,
  isSpeaking,
  aiPaused,
  audioLevel,
  hrHandRaised,
  interviewStarted,
  connectionError,
  currentQuestion,
  isConnecting,
  isHR,
}) => {
  return (
    <div className="bg-white border-3 border-gray-900 rounded-2xl overflow-hidden shadow-xl">
      <div className="aspect-video relative bg-gradient-to-br from-indigo-100 to-purple-100">
        <AnimatedAvatar
          blinkState={blinkState}
          mouthOpen={mouthOpen}
          isSpeaking={isSpeaking}
          aiPaused={aiPaused}
          audioLevel={audioLevel}
        />

        {hrHandRaised && (
          <div className="absolute top-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg animate-pulse">
            <Hand className="w-4 h-4" />
            HR Wants to Speak
          </div>
        )}

        {interviewStarted && isSpeaking && !aiPaused && (
          <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold border-2 border-green-700 flex items-center gap-2 shadow-lg">
            <Volume2 className="w-4 h-4" />
            AI Speaking
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                AI Interview Assistant
              </p>
              <p className="text-white/80 text-xs">Powered by GPT-4</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 border-t-3 border-gray-900 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
          <p className="text-gray-800 text-sm leading-relaxed min-h-[60px] font-medium">
            {connectionError ? (
              <span className="text-red-600 font-semibold">
                ⚠️ {connectionError}
              </span>
            ) : currentQuestion ? (
              currentQuestion
            ) : isConnecting ? (
              <span className="text-indigo-600">
                Connecting to AI interviewer...
              </span>
            ) : (
              <span className="text-gray-500">
                {isHR
                  ? "Waiting for interview to start..."
                  : "Waiting to start interview..."}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewerPanel;
