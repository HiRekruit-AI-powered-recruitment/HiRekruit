import React, { useCallback, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UploadDropzone from "./UploadDropzone";
import FileList from "./FileList";
import Sidebar from "./Sidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Icons
import { Share2, Globe, Lock, Calendar, Save, CheckCircle, ExternalLink, Copy, X } from "lucide-react"; 
import { createJobInHiKareers } from "../api/hikareersApi";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const CAREER_PORTAL_URL = import.meta.env.VITE_CAREER_PORTAL_URL || "http://localhost:5174/careers";

const Dashboard = () => {
  const { drive_id } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [jobData, setJobData] = useState(null);

  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // New State for Posting Configuration
  const [postingConfig, setPostingConfig] = useState({
    isPosted: false
  });
  const [visibility, setVisibility] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [applyLink, setApplyLink] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Compute form validity
  const isSettingsValid =
    visibility !== "" &&
    deadline !== "" &&
    deadline !== null;

  useEffect(() => {
    const savedJobData = localStorage.getItem("currentJobData");
    if (savedJobData) {
      try {
        const parsedData = JSON.parse(savedJobData);
        setJobData(parsedData);

        // Pre-fill configuration if data exists
        setDeadline(parsedData.end_date || "");
        setVisibility(parsedData.visibility || "");
      } catch (error) {
        console.error("Error parsing job data:", error);
        toast.error("Error loading job data");
      }
    }
  }, []);





 const fetchApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      // Ensure this endpoint matches your route in application.routes.js
      const response = await fetch(`${BASE_URL}/v1/application`);
      const result = await response.json();
      
      if (response.ok) {
        // Based on your controller, the data is inside result.data.applications
        setApplications(result.data.applications || []);
      } else {
        toast.error("Failed to load applications");
      }
    } catch (error) {
      console.error("Error fetching apps:", error);
    } finally {
      setLoadingApps(false);
    }
  }, []);

  // ADDED: Call fetch on mount
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const onAddFiles = useCallback(
    (newFiles) => {
      const existing = new Set(
        files.map((f) => `${f.webkitRelativePath || f.name}|${f.size}`)
      );
      const toAdd = newFiles.filter(
        (f) => !existing.has(`${f.webkitRelativePath || f.name}|${f.size}`)
      );
      if (toAdd.length) {
        setFiles((prev) => [...prev, ...toAdd]);
        // Team Note: Showing notification when resume is selected
        toast.success("Resume selected successfully");
      }
    },
    [files]
  );

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
      files.forEach((file) => {
        formData.append("resumes", file);
      });

      // Ensure BASE_URL is valid
      const apiBaseUrl = BASE_URL || "";
      if (!apiBaseUrl) {
        console.warn("VITE_BASE_URL is not defined in environment variables. Falling back to relative path.");
      }

      // Add job data and driveid to formData
      // Backend expects 'skills' and 'job_role' individually as per resume_controllers.py
      formData.append("skills", jobData.skills || "");
      formData.append("job_role", jobData.role || "");
      formData.append("drive_id", drive_id);

      console.log("Uploading resumes to:", `${apiBaseUrl}/api/resume/upload-resumes`);

      const response = await fetch(`${apiBaseUrl}/api/resume/upload-resumes`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Resumes processed successfully!");
        navigate("/dashboard/drives");
      } else {
        toast.error("Failed to process resumes");
      }

      const result = await response.json();
      // Team Note: Showing notification after resume processing completes
      toast.success("Resume processed successfully");
      console.log("Result:", result);
      navigate("/dashboard/drives");
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

  const handleCloseModal = () => {
    setShowLinkModal(false);
    navigate("/dashboard/drives");
  };

  const handlePostJobToCareerPortal = async () => {
    if (!deadline) {
      toast.warn("Please set an application deadline first.");
      return;
    }
   
    
    setIsPosting(true);
    try {
      const jobPayload = {
        jobId: jobData.job_id,
        title: jobData.role,
        role: jobData.role,
        company: "HiRekruit",
        location: jobData.location || "Office",
        description: jobData.description || `Hiring for ${jobData.role} role.`,
        skills: Array.isArray(jobData.skills) 
          ? jobData.skills 
          : (typeof jobData.skills === 'string' ? jobData.skills.split(",").map(s => s.trim()) : []),
        numberOfPositions: parseInt(jobData.candidates_to_hire) || 1,
        hiringType: jobData.experience_type === "experienced" ? "Experienced" : "Fresher",
        experienceLevel: jobData.experience_type === "experienced" ? "Experienced" : "Fresher",
        jobType: jobData.job_type === "internship" ? "Internship" : "Full-time",
        startDate: (jobData.start_date && !isNaN(new Date(jobData.start_date).getTime())) 
          ? new Date(jobData.start_date).toISOString() 
          : new Date().toISOString(),
        endDate: (jobData.end_date && !isNaN(new Date(jobData.end_date).getTime())) 
          ? new Date(jobData.end_date).toISOString() 
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        driveVisibility: visibility || "public",
        interviewRounds: Array.isArray(jobData.rounds) ? jobData.rounds.map(r => ({
          type: r.type || "Interview",
          description: r.description || ""
        })) : [],
      };

      console.log("Submitting job to HiKareers:", jobPayload);

      const response = await createJobInHiKareers(jobPayload);
      const link = response?.data?.data?.applyLink;
      
      if (link) {
        setApplyLink(link);
        setShowLinkModal(true);
        toast.success("Job posted to HiKareers successfully!");

        // Save applyLink in drive (HiRekruit Backend)
        try {
          await fetch(`${BASE_URL}/api/drive/${drive_id}/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ applyLink: link }),
          });
        } catch (updateError) {
          console.error("Failed to update drive with applyLink:", updateError);
        }
      } else {
        toast.error("Failed to get apply link from HiKareers");
      }
    } catch (error) {
      console.error("HiKareers API Error:", error);
      toast.error(error.response?.data?.message || "Failed to post job to HiKareers");
    } finally {
      setIsPosting(true); 
      // use a separate loading state or reuse isPosting.
      setIsPosting(false);
    }
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
            <>
              <button
                onClick={handleProcessResumes}
                disabled={
                  !isSettingsValid || !jobData?.role?.trim() || files.length === 0 || processing
                }
                className={`px-4 py-2 text-sm rounded-md transition-all ${!isSettingsValid || !jobData?.role?.trim() || files.length === 0 || processing
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                  : "bg-gray-900 text-white hover:bg-black"
                  }`}
              >
                {processing ? "Processing..." : "Process Resumes"}
              </button>
              <button
                onClick={handlePostJobToCareerPortal}
                disabled={!isSettingsValid || isPosting}
                className={`px-4 py-2 text-sm text-white rounded-md shadow-sm transition-all active:scale-95 flex items-center gap-2 ${
                  !isSettingsValid || isPosting 
                    ? "bg-indigo-300 cursor-not-allowed opacity-70" 
                    : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md"
                }`}
              >
                {isPosting ? "Posting..." : "Post this Job"}
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
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full appearance-none bg-white border border-indigo-200 text-gray-700 py-2.5 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500"
                >
                  <option value="">Select Visibility</option>
                  <option value="public">Public (Visible to All)</option>
                  <option value="private">Private (Invite Only)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-600">
                  {visibility === 'public' ? <Globe size={16} /> : <Lock size={16} />}
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
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-white border border-indigo-200 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:border-indigo-500"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-indigo-400">
                  <Calendar size={16} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {postingConfig.isPosted && visibility === "public" && (
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
            {!deadline ? (
              <span>* Please set a deadline to enable posting.</span>
            ) : (
              <span className="flex items-center gap-1">
                <CheckCircle size={12} /> Ready to publish. Candidates will be able to apply until {deadline}.
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
            <GetApplicationOnline baseUrl={BASE_URL} />

        </div>


     

      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* Apply Link Modal */}
      {showLinkModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={handleCloseModal}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300"
               onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white text-center relative">
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold">Job Posted Successfully!</h3>
              <p className="text-indigo-100 mt-1">Your job is now live on the Career Portal.</p>
            </div>
            
            <div className="p-6">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Shareable Apply Link
              </label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3 mb-6">
                <div className="truncate text-sm text-gray-600 flex-1 font-medium">
                  {applyLink}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(applyLink);
                    toast.success("Link copied!");
                  }}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Copy Link"
                >
                  <Copy size={18} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => window.open(applyLink, '_blank')}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  <ExternalLink size={18} />
                  View Job
                </button>
                <button
                  onClick={handleCloseModal}
                  className="py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const GetApplicationOnline = ({ baseUrl }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await fetch(`${baseUrl}/v1/application`);
        const result = await response.json();
        // Assuming your backend response is { data: { applications: [] } }
        if (response.ok) {
          setApplications(result.data?.applications || []);
        }
      } catch (err) {
        console.error("Error fetching apps:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, [baseUrl]);

  if (loading) return <p className="p-4 text-sm text-gray-500">Loading applications...</p>;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Live Applications</h3>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applications.map((app) => (
              <tr key={app._id}>
                <td className="px-4 py-2">{app.fullName}</td>
                <td className="px-4 py-2">{app.email}</td>
                <td className="px-4 py-2 text-xs font-bold text-blue-600">{app.currentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;