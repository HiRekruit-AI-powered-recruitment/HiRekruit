import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Loader from "../../components/Helper/Loader";
import TechnicalInterviewStartCard from "../../components/Technical rounds/TechnicalInterviewStartCard";
import { getTechnicalInterviewPrompt } from "../../Prompts/TechnicalInterviewPrompt";
import InterviewStartPage from "./InterviewStartPage";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function InterviewStartRoute() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useState(null);
  const [driveCandidateData, setDriveCandidateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [technicalQuestions, setTechnicalQuestions] = useState([]);

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
          setDriveCandidateData({
            drive_id: "preview-drive",
            candidate_id: "preview-candidate",
          });
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
        setDriveCandidateData(data);
        setUserData(data.candidate_info);

        // 📝 Fetch technical questions so the AI prompt can include them
        const driveId = data.drive_id;
        if (driveId) {
          try {
            const driveRes = await fetch(`${BASE_URL}/api/drive/${driveId}`);
            let drive = {};
            if (driveRes.ok) {
              const driveResult = await driveRes.json();
              drive = driveResult.drive || {};
            }

            const hasTechQuestions =
              Array.isArray(drive.technical_question_ids) &&
              drive.technical_question_ids.length > 0;

            if (hasTechQuestions) {
              const questionsRes = await fetch(
                `${BASE_URL}/api/coding-assessment/problem/technical?drive_id=${encodeURIComponent(driveId)}`,
              );
              if (questionsRes.ok) {
                const questions = await questionsRes.json();
                setTechnicalQuestions(Array.isArray(questions) ? questions : []);
                console.log(`✅ Fetched ${questions.length} technical questions for AI prompt`);
              }
            }
          } catch (questionsError) {
            console.warn("⚠️ Could not fetch technical questions for AI prompt (non-blocking):", questionsError);
            // Non-blocking: interview can still start without questions in the prompt
          }
        }
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

      // 🛡️ Step 1: Check camera/mic permission state WITHOUT grabbing devices.
      // We avoid getUserMedia here because stopping and re-acquiring tracks
      // interferes with VAPI's internal audio setup later.
      try {
        const [camPerm, micPerm] = await Promise.all([
          navigator.permissions.query({ name: "camera" }),
          navigator.permissions.query({ name: "microphone" }),
        ]);
        if (camPerm.state === "denied" || micPerm.state === "denied") {
          alert("Camera and microphone access is required to start the interview. Please allow access in your browser settings and try again.");
          setIsStarting(false);
          return;
        }
      } catch (permErr) {
        // Permissions API not supported — continue anyway, useLiveKit will handle it
        console.warn("🛡️ Permissions API not available:", permErr.message);
      }

      // 🛡️ Step 1.5: Pre-warm AudioContext while we have user gesture.
      // VAPI needs a running AudioContext to start a voice call. Chrome blocks
      // AudioContext resume without a gesture, so we create it now.
      try {
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        if (ac.state === "suspended") await ac.resume();
        window.__prewarmedAudioContext = ac;
        console.log("🛡️ AudioContext pre-warmed, state:", ac.state);
      } catch (acErr) {
        console.warn("🛡️ AudioContext pre-warm failed:", acErr.message);
      }

      // 🛡️ Step 2: Enter fullscreen on the user's click gesture
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) await elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
      } catch (fsErr) {
        console.warn("🛡️ Could not enter fullscreen:", fsErr.message);
      }

      const identity = `candidate_${userData.name?.replace(/\s+/g, "_").toLowerCase() || "user"
        }`;
      const prompt = getTechnicalInterviewPrompt(
        userData.resume_content,
        interviewType,
        userData.job_role || userData.job_title || "",
        userData.job_location || "",
        userData.company_name || "",
        technicalQuestions,
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
          driveId: driveCandidateData?.drive_id,
          candidateId: driveCandidateData?.candidate_id,
          technicalQuestions,
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
