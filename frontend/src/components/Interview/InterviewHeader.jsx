import React from "react";
import { Shield, Users, AlertCircle } from "lucide-react";
import ConnectionStatus from "./ConnectionStatus";

const InterviewHeader = ({
  isHR,
  hrName,
  userData,
  interviewType,
  remoteParticipants,
  interviewStarted,
  connectionError,
  // Connection status props
  isCheckingCompletion,
  interviewAlreadyCompleted,
  isLoadingLiveKit,
  isConnecting,
  isVapiReady,
  livekitConnected,
}) => {
  return (
    <div className="bg-white border-3 border-gray-900 rounded-2xl p-6 mb-6 shadow-xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 ${
              isHR
                ? "bg-gradient-to-br from-purple-500 to-pink-600"
                : "bg-gradient-to-br from-indigo-500 to-purple-600"
            } rounded-xl flex items-center justify-center shadow-lg`}
          >
            {isHR ? (
              <Shield className="w-6 h-6 text-white" />
            ) : (
              <Users className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isHR ? "HR Interview Panel" : "Live Interview Session"}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-600 font-medium">
                {isHR ? hrName : userData?.name || "Candidate"}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600 capitalize">
                {interviewType} Interview
              </span>
              {remoteParticipants.length > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-indigo-600 font-semibold">
                    {remoteParticipants.length + 1} participants
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionStatus
            isCheckingCompletion={isCheckingCompletion}
            interviewAlreadyCompleted={interviewAlreadyCompleted}
            isHR={isHR}
            isLoadingLiveKit={isLoadingLiveKit}
            isConnecting={isConnecting}
            connectionError={connectionError}
            interviewStarted={interviewStarted}
            isVapiReady={isVapiReady}
            livekitConnected={livekitConnected}
          />
          {interviewStarted && (
            <div className="flex items-center gap-2 px-4 py-2 border-3 border-red-500 bg-red-50 rounded-full shadow-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-red-700 uppercase tracking-wide">
                Live
              </span>
            </div>
          )}
        </div>
      </div>

      {connectionError && (
        <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">
                Connection Error
              </h3>
              <p className="text-sm text-red-700">{connectionError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewHeader;
