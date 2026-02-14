import React, { useCallback, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UploadDropzone from "./UploadDropzone";
import FileList from "./FileList";
import SkillFilter from "./SkillFilter";
import StatsCards from "./StatsCards";
import Sidebar from "./Sidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Added Globe icon for the portal button
import { Globe, RefreshCw } from "lucide-react"; 

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const { drive_id } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [importing, setImporting] = useState(false); // New state for portal import
  const [jobData, setJobData] = useState(null);

  useEffect(() => {
    const savedJobData = localStorage.getItem("currentJobData");
    if (savedJobData) {
      try {
        setJobData(JSON.parse(savedJobData));
      } catch (error) {
        console.error("Error parsing job data:", error);
        toast.error("Error loading job data");
      }
    }
  }, []);

  // --- New Function: Import from Career Portal ---
  const handleImportFromPortal = async () => {
    setImporting(true);
    try {
      toast.info("Connecting to career portal...");
      // Replace this with your actual API call to fetch candidates 
      // who applied through the public portal for this specific drive_id
      const response = await fetch(`${BASE_URL}/api/resume/import-portal/${drive_id}`, {
        method: "POST"
      });
      
      if (response.ok) {
        toast.success("Applications imported from portal successfully!");
        navigate("/dashboard/drives");
      } else {
        throw new Error("Portal import failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to import from career portal");
    } finally {
      setImporting(false);
    }
  };

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

  return (
    <div className="flex-1 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {jobData ? "Resume Processing Dashboard" : "Dashboard"}
          </h1>
        </div>
        
        <div className="flex gap-3">
          {jobData ? (
            <>
              {/* --- New Import Button --- */}
              <button
                onClick={handleImportFromPortal}
                disabled={importing || processing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {importing ? <RefreshCw className="animate-spin" size={16} /> : <Globe size={16} />}
                Import from Career Portal
              </button>

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
            </>
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

          {/* Rounds & Questions Summary */}
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