import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Loader from "../../components/Loader";
import TechnicalInterviewStartCard from "../../components/Technical rounds/TechnicalInterviewStartCard";
import { getMockInterviewPrompt } from "../../Prompts/MockInterviewPrompt";
import InterviewStartPage from "./InterviewStartPage";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function InterviewStartRoute() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  const driveCandidateId = params.driveCandidateId;
  const interviewType = params.typeOfInterview;
  const isTechnicalInterview =
    interviewType?.toLowerCase().trim() === "technical";
  const isPreviewMode = searchParams.get("preview") === "true";

  useEffect(() => {
    if (!isTechnicalInterview) {
      setIsLoading(false);
      return;
    }

    const fetchCandidateData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (isPreviewMode) {
          setUserData({
            name: "Candidate",
            email: "candidate@example.com",
            resume_content:
              "Preview resume content for testing the technical interview start page.",
          });
          return;
        }

        const response = await fetch(
          `${BASE_URL}/api/interview/candidate/${driveCandidateId}`,
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch candidate data: ${response.status}`);
        }

        const data = await response.json();
        setUserData(data.candidate_info);
      } catch (fetchError) {
        console.error("Error fetching technical interview data:", fetchError);
        setError(fetchError.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidateData();
  }, [driveCandidateId, isPreviewMode, isTechnicalInterview]);

  const getLiveKitToken = async (identity) => {
    const response = await fetch(
      `${BASE_URL}/api/livekit/token?driveCandidateId=${driveCandidateId}&type=${interviewType}&role=candidate&identity=${identity}`,
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch LiveKit token");
    }

    return response.json();
  };

  const handleStartInterview = async () => {
    if (isPreviewMode) {
      alert("Preview mode only shows the instruction page.");
      return;
    }

    if (!userData?.resume_content) {
      alert("Resume data is required to start the interview");
      return;
    }

    try {
      setIsStarting(true);

      const identity = `candidate_${
        userData.name?.replace(/\s+/g, "_").toLowerCase() || "user"
      }`;
      const prompt = getMockInterviewPrompt(
        userData.resume_content,
        interviewType,
      );
      const livekitData = await getLiveKitToken(identity);

      navigate(`/mockinterview/${driveCandidateId}`, {
        state: {
          isHR: false,
          userData,
          prompt,
          livekitToken: livekitData.token,
          roomName: livekitData.roomName,
          livekitUrl: livekitData.livekitUrl,
          identity: livekitData.identity,
          interviewType,
          driveCandidateId,
        },
      });
    } catch (startError) {
      console.error("Error starting technical interview:", startError);
      alert(
        `Unable to start interview: ${startError.message}\n\nPlease try again or contact support.`,
      );
      setIsStarting(false);
    }
  };

  if (!isTechnicalInterview) {
    return <InterviewStartPage />;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full rounded-xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Unable to Load Technical Interview
          </h1>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <TechnicalInterviewStartCard
          candidate={userData}
          canStart={Boolean(userData?.resume_content)}
          isStarting={isStarting}
          onStartInterview={handleStartInterview}
        />
      </div>
    </div>
  );
}

export default InterviewStartRoute;
