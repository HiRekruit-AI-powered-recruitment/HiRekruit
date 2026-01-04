import React from "react";
import ParticipantVideo from "./ParticipantVideo";

const RemoteParticipantPanel = ({ participant }) => {
  return (
    <div className="bg-white border-3 border-gray-900 rounded-2xl overflow-hidden shadow-xl">
      <div className="aspect-video">
        <ParticipantVideo participant={participant} />
      </div>
      <div className="p-5 border-t-3 border-gray-900 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-gray-700">
            {participant.identity.replace(/_/g, " ")}
          </span>
          {participant.identity.startsWith("hr_") && (
            <span className="ml-auto px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
              HR
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoteParticipantPanel;
