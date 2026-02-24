import React, { useCallback, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UploadDropzone from "./UploadDropzone";
import FileList from "./FileList";
import Sidebar from "./Sidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Icons
import { Share2, Globe, Lock, Calendar, Save, CheckCircle } from "lucide-react"; 

const BASE_URL = import.meta.env.VITE_BASE_URL;
const CAREER_PORTAL_URL = import.meta.env.VITE_CAREER_PORTAL_URL || "http://localhost:5173/careers";

const Dashboard = () => {
  const { drive_id } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [jobData, setJobData] = useState(null);

  // New State for Posting Configuration
  const [postingConfig, setPostingConfig] = useState({
    visibility: "public",
    deadline: "",
    isPosted: false
  });
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const savedJobData = localStorage.getItem("currentJobData");
    if (savedJobData) {
      try {
        const parsedData = JSON.parse(savedJobData);
        setJobData(parsedData);

        // Pre-fill configuration if data exists
        setPostingConfig(prev => ({
          ...prev,
          deadline: parsedData.end_date || "", // Pre-fill deadline
          visibility: parsedData.visibility || "public" // Default to public or existing
        }));
      } catch (error) {
        console.error("Error parsing job data:", error);
        toast.error("Error loading job data");
      }
    }
  }, []);

  const onAddFiles = useCallback((newFiles) => {
    const existing = new Set(files.map((f) => `${f.name}|${f.size}`));
    const toAdd = newFiles.filter((f) => !existing.has(`${f.name}|${f.size}`));
    if (toAdd.length) setFiles((prev) => [...prev, ...toAdd]);
  }, [files]);

  const onRemove = useCallback((idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleProcessResumes = async () => {
    if (!jobData?.role?.trim() || files.length === 0) {
      toast.warn("Please upload resumes first");
      return;
    }

    setProcessing(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("resumes", file));
      formData.append("jobData", JSON.stringify(jobData));
      formData.append("drive_id", drive_id);

      const response = await fetch(`${BASE_URL}/api/resume/upload-resumes`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Resumes processed successfully!");
        navigate("/dashboard/drives");
      } else {
        toast.error("Failed to process resumes");
      }
    } catch (error) {
      toast.error("Error uploading resumes");
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateNewJob = () => {
    localStorage.removeItem("currentJobData");
    navigate("/drive-creation");
  };

  // --- Handle Posting Job to Portal ---
  const handlePostJob = async () => {
    setIsPosting(true);
    try {
      // API call to update drive status/visibility
      const response = await fetch(`${BASE_URL}/api/drive/${drive_id}/publish`, {
        method: "PUT", // or POST depending on your backend
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visibility: postingConfig.visibility,
          deadline: postingConfig.deadline,
          status: "published" 
        })
      });

      if (response.ok) {
        toast.success(
          postingConfig.visibility === "public" 
            ? "Job successfully posted to Career Portal!" 
            : "Job updated to Private mode."
        );
        setPostingConfig(prev => ({ ...prev, isPosted: true }));
        
        // Optional: Update local jobData context if needed
      } else {
        throw new Error("Failed to publish job");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update job posting settings");
    } finally {
      setIsPosting(false);
    }
  };

  const handleCopyLink = () => {
    const jobUrl = `${CAREER_PORTAL_URL}/job/${jobData.job_id}`;
    navigator.clipboard.writeText(jobUrl);
    toast.success("Job Link copied to clipboard!");
  };

  return (
    <div className="flex-1 w-full pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {jobData ? "Resume Processing Dashboard" : "Dashboard"}
          </h1>
        </div>
        
        <div className="flex gap-3">
          {jobData ? (
            <button
              onClick={handleProcessResumes}
              disabled={!jobData?.role?.trim() || files.length === 0 || processing}
              className={`px-4 py-2 text-sm rounded-md font-medium shadow-sm transition-all ${
                !jobData?.role?.trim() || files.length === 0 || processing
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-black"
              }`}
            >
              {processing ? "Processing..." : "Process Uploaded Resumes"}
            </button>
          ) : (
            <button
              onClick={handleCreateNewJob}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create New Job
            </button>
          )}
        </div>
      </div>

      {/* Job Details Card */}
      {jobData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-5 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold text-gray-900">Active Drive: {jobData.role}</h2>
            <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded capitalize">
              {jobData.job_type}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm border-b pb-5 border-gray-100">
            <div>
              <span className="text-gray-500 block">Job ID</span>
              <p className="font-semibold text-gray-800">{jobData.job_id || "N/A"}</p>
            </div>
            <div>
              <span className="text-gray-500 block">Location</span>
              <p className="font-semibold text-gray-800">{jobData.location || "N/A"}</p>
            </div>
            <div>
              <span className="text-gray-500 block">Candidates Needed</span>
              <p className="font-semibold text-gray-800">{jobData.candidates_to_hire || "N/A"}</p>
            </div>
            <div>
              <span className="text-gray-500 block">Experience</span>
              <p className="font-semibold text-gray-800">
                {jobData.experience_type === "experienced" 
                  ? `${jobData.experience_min}-${jobData.experience_max} Yrs` 
                  : "Fresher"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-6 text-sm">
             <div className="flex items-center gap-2">
                <span className="text-gray-500">Interview Rounds:</span>
                <span className="font-bold text-blue-600">{jobData.rounds?.length || 0}</span>
             </div>
             {jobData.coding_questions?.length > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-gray-500">Coding Questions:</span>
                    <span className="font-bold text-orange-600">{jobData.coding_questions.length}</span>
                </div>
             )}
          </div>
        </div>
      )}

      {/* --- Job Posting Configuration Section --- */}
      {jobData && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Globe className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-indigo-900">Career Portal Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Visibility Toggle */}
            <div>
              <label className="block text-xs font-bold text-indigo-800 uppercase tracking-wide mb-2">
                Visibility
              </label>
              <div className="relative">
                <select
                  value={postingConfig.visibility}
                  onChange={(e) => setPostingConfig({ ...postingConfig, visibility: e.target.value })}
                  className="w-full appearance-none bg-white border border-indigo-200 text-gray-700 py-2.5 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500"
                >
                  <option value="public">Public (Visible to All)</option>
                  <option value="private">Private (Invite Only)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-600">
                  {postingConfig.visibility === 'public' ? <Globe size={16} /> : <Lock size={16} />}
                </div>
              </div>
            </div>

            {/* Deadline Input */}
            <div>
              <label className="block text-xs font-bold text-indigo-800 uppercase tracking-wide mb-2">
                Application Deadline
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={postingConfig.deadline}
                  onChange={(e) => setPostingConfig({ ...postingConfig, deadline: e.target.value })}
                  className="w-full bg-white border border-indigo-200 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:border-indigo-500"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-indigo-400">
                  <Calendar size={16} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handlePostJob}
                disabled={!postingConfig.deadline || isPosting}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-white transition-all ${
                  !postingConfig.deadline || isPosting
                    ? "bg-indigo-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transform active:scale-95"
                }`}
              >
                {isPosting ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={18} />
                    {postingConfig.isPosted ? "Update Settings" : "Post this Job"}
                  </>
                )}
              </button>

              {postingConfig.isPosted && postingConfig.visibility === "public" && (
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-indigo-200 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                  title="Copy Link"
                >
                  <Share2 size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Helper Text */}
          <div className="mt-3 flex items-start gap-2 text-xs text-indigo-500">
            {!postingConfig.deadline ? (
              <span>* Please set a deadline to enable posting.</span>
            ) : (
              <span className="flex items-center gap-1">
                <CheckCircle size={12} /> Ready to publish. Candidates will be able to apply until {postingConfig.deadline}.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Manual Upload Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Manual Resume Upload</h3>
        </div>
        <div className="p-4">
            <UploadDropzone onAddFiles={onAddFiles} />
            <FileList files={files} onRemove={onRemove} />
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default Dashboard;