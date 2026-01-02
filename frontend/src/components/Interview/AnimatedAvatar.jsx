import React from "react";
import { Pause, Volume2 } from "lucide-react";

const AnimatedAvatar = ({
  blinkState,
  mouthOpen,
  isSpeaking,
  aiPaused,
  audioLevel,
}) => {
  const eyeHeight = blinkState ? 2 : 12;
  const mouthHeight = mouthOpen * 20;

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {aiPaused && (
        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg animate-pulse">
          <Pause className="w-3 h-3" />
          AI Paused
        </div>
      )}

      <svg
        width="220"
        height="220"
        viewBox="0 0 200 200"
        className="drop-shadow-2xl"
      >
        <defs>
          <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="80" fill="url(#headGradient)" />
        <ellipse cx="75" cy="85" rx="12" ry={eyeHeight} fill="white" />
        <ellipse cx="125" cy="85" rx="12" ry={eyeHeight} fill="white" />
        {!blinkState && (
          <>
            <circle cx="75" cy="85" r="6" fill="#1e293b" />
            <circle cx="125" cy="85" r="6" fill="#1e293b" />
            <circle cx="77" cy="83" r="2" fill="white" />
            <circle cx="127" cy="83" r="2" fill="white" />
          </>
        )}
        <ellipse
          cx="100"
          cy="120"
          rx="25"
          ry={Math.max(3, mouthHeight)}
          fill="#ec4899"
          className="transition-all duration-100"
        />
        {isSpeaking && !aiPaused && (
          <>
            <circle
              cx="100"
              cy="100"
              r={80 + audioLevel * 20}
              fill="none"
              stroke="#a78bfa"
              strokeWidth="3"
              opacity={audioLevel * 0.6}
              className="transition-all duration-100"
            />
            <circle
              cx="100"
              cy="100"
              r={80 + audioLevel * 35}
              fill="none"
              stroke="#c4b5fd"
              strokeWidth="2"
              opacity={audioLevel * 0.4}
              className="transition-all duration-100"
            />
          </>
        )}
      </svg>

      {isSpeaking && !aiPaused && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1.5">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-full transition-all duration-100 shadow-lg"
              style={{
                height: `${
                  (Math.sin(Date.now() / 80 + i * 0.5) * 0.5 + 0.5) * 24 + 12
                }px`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnimatedAvatar;
