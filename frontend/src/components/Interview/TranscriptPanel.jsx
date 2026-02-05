import React from "react";
import { MessageSquare } from "lucide-react";

const TranscriptPanel = ({ fullTranscript, userData, isHR }) => {
  if (!fullTranscript || fullTranscript.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-3 border-gray-900 rounded-2xl p-6 mb-6 shadow-xl max-h-96 overflow-y-auto">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 sticky top-0 bg-white pb-2 border-b-2 border-gray-200">
        <MessageSquare className="w-5 h-5 text-indigo-600" />
        Live Transcript
      </h3>
      <div className="space-y-4">
        {fullTranscript.map((entry, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl ${
              entry.role === "assistant"
                ? "bg-indigo-50 border-2 border-indigo-200"
                : entry.role === "user"
                  ? "bg-blue-50 border-2 border-blue-200"
                  : "bg-yellow-50 border-2 border-yellow-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  entry.role === "assistant"
                    ? "bg-indigo-600 text-white"
                    : entry.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-yellow-600 text-white"
                }`}
              >
                <span className="text-xs font-bold">
                  {entry.role === "assistant"
                    ? "AI"
                    : entry.role === "user"
                      ? isHR
                        ? "C"
                        : "You"
                      : "SYS"}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-600">
                    {entry.role === "assistant"
                      ? "AI Interviewer"
                      : entry.role === "user"
                        ? userData?.name || "Candidate"
                        : "System"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {entry.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranscriptPanel;
