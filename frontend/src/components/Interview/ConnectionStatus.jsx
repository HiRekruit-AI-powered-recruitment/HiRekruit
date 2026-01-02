import React from "react";
import { AlertCircle } from "lucide-react";
import Loader from "../../components/Loader";

const ConnectionStatus = ({
  isCheckingCompletion,
  interviewAlreadyCompleted,
  isHR,
  isLoadingLiveKit,
  isConnecting,
  connectionError,
  interviewStarted,
  isVapiReady,
  livekitConnected,
}) => {
  if (isCheckingCompletion) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-700 px-4 py-2 border-2 border-gray-300 rounded-full bg-white">
        <Loader className="w-4 h-4 animate-spin" />
        <span className="font-medium">Checking status...</span>
      </div>
    );
  }

  if (interviewAlreadyCompleted && !isHR) {
    return (
      <div className="flex items-center gap-2 text-sm text-orange-700 px-4 py-2 border-2 border-orange-500 bg-orange-50 rounded-full">
        <AlertCircle className="w-4 h-4" />
        <span className="font-semibold">Already completed</span>
      </div>
    );
  }

  if (isLoadingLiveKit) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-700 px-4 py-2 border-2 border-blue-500 bg-blue-50 rounded-full">
        <Loader className="w-4 h-4 animate-spin" />
        <span className="font-medium">Connecting video...</span>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="flex items-center gap-2 text-sm text-indigo-700 px-4 py-2 border-2 border-indigo-500 bg-indigo-50 rounded-full">
        <Loader className="w-4 h-4 animate-spin" />
        <span className="font-medium">Starting AI...</span>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-700 px-4 py-2 border-2 border-red-500 bg-red-50 rounded-full">
        <AlertCircle className="w-4 h-4" />
        <span className="font-medium">Error</span>
      </div>
    );
  }

  if (interviewStarted) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 px-4 py-2 border-2 border-green-500 bg-green-50 rounded-full">
        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
        <span className="font-semibold">Interview Active</span>
      </div>
    );
  }

  if (isVapiReady || (isHR && livekitConnected)) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-700 px-4 py-2 border-2 border-gray-300 rounded-full bg-white">
        <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
        <span className="font-medium">Ready</span>
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-500 px-4 py-2 border-2 border-gray-300 rounded-full bg-gray-50">
      <span className="font-medium">Initializing...</span>
    </div>
  );
};

export default ConnectionStatus;
