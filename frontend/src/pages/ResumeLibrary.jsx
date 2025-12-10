import React, { useState, useMemo, useEffect } from "react";
import { Search, FileText, ChevronDown, Download } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";
import Loader from "../components/Loader";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ResumeLibrary = () => {
  const { user } = useUser();
  const [totalCandidates, SetTotalCandidates] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // States for job-based search
  const [searchJobId, setSearchJobId] = useState("");
  const [searchingByJob, setSearchingByJob] = useState(false);

  const candidatesPerPage = 5;

  // Fetch candidates by job ID
  const fetchCandidatesByJob = async (jobId) => {
    if (!jobId) {
      toast.error("Please enter a job ID to search");
      return;
    }

    setSearchingByJob(true);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/api/drive/job/${jobId}/candidates`
      );
      if (!response.ok) throw new Error("Failed to fetch candidates by job id");
      const data = await response.json();
      // backend may return either an array of candidates or an object { candidates, count }
      const items = Array.isArray(data) ? data : data.candidates || [];
      const count = Array.isArray(data)
        ? data.length
        : data.count || items.length;
      console.log("Total candidates", count);
      SetTotalCandidates(count);
      console.log("candidates by job", items);
      // Normalize candidate fields to a consistent shape for rendering
      const normalized = items.map((c, i) => ({
        id:
          c.id || c._id || c.drive_candidate_id || (c._doc && c._doc._id) || i,
        name:
          c.name ||
          c.full_name ||
          c.fullName ||
          c.candidate_name ||
          (c.user && (c.user.name || c.user.full_name)) ||
          "N/A",
        email:
          c.email ||
          c.email_id ||
          c.emailAddress ||
          (c.user && c.user.email) ||
          "",
        resume_url: c.resume_url || c.resumeUrl || c.resume || c.cv_url || "",
        raw: c,
      }));

      setCandidates(normalized);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
      setCandidates([]);
      toast.error("Could not load candidates for given job id.");
    } finally {
      setSearchingByJob(false);
      setLoading(false);
    }
  };

  // Handle resume download
  const handleResumeDownload = async (resumeUrl, candidateName) => {
    try {
      const loadingToast = toast.loading("Downloading resume...");

      let blob;

      // Check if it's a base64 data URL
      if (resumeUrl.startsWith("data:")) {
        // Extract base64 data
        const base64Data = resumeUrl.split(",")[1];
        const mimeType =
          resumeUrl.match(/data:([^;]+)/)?.[1] || "application/pdf";

        // Convert base64 to blob
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: mimeType });
      } else {
        // Regular URL - fetch it
        const response = await fetch(resumeUrl);
        if (!response.ok) throw new Error("Failed to fetch resume");
        blob = await response.blob();
      }

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${candidateName.replace(/\s+/g, "_")}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss(loadingToast);
      toast.success("Resume downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download resume");
      console.error("Download error:", error);
    }
  };

  // Remove application (delete drive_candidate for job_id + candidate_id)
  const removeApplication = async (candidateId) => {
    if (!searchJobId) {
      toast.error("Enter the Job ID first to remove an application");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove this application? This action cannot be undone."
    );
    if (!confirmed) return;

    setSearchingByJob(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/drive/job/${encodeURIComponent(
          searchJobId
        )}/candidate/${encodeURIComponent(candidateId)}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to remove application");
      }

      const data = await response.json();
      toast.success(data.message || "Application removed");
      // Remove locally
      setCandidates((prev) =>
        prev.filter(
          (c) =>
            c.id !== candidateId &&
            c._id !== candidateId &&
            c.id !== String(candidateId)
        )
      );
      SetTotalCandidates((n) => Math.max(0, n - (data.deleted_count || 1)));
    } catch (err) {
      console.error("Remove application error:", err);
      toast.error(err.message || "Could not remove application");
    } finally {
      setSearchingByJob(false);
    }
  };

  // Filter candidates based on search term
  const filteredCandidates = useMemo(() => {
    if (!candidates.length) return [];

    const q = (searchTerm || "").toLowerCase();
    return candidates.filter((c) => {
      const name = (c.name || "").toString().toLowerCase();
      const email = (c.email || "").toString().toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [candidates, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);
  const startIndex = (currentPage - 1) * candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(
    startIndex,
    startIndex + candidatesPerPage
  );

  const getInitials = (name) => {
    if (!name || name === "N/A" || name === "Error loading") return "NA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            All Applicants
          </h1>
          <p className="text-sm text-gray-600">View all applicants by Job ID</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
        {/* Job ID Search Input */}
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Enter Job ID..."
            value={searchJobId}
            onChange={(e) => setSearchJobId(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") fetchCandidatesByJob(searchJobId);
            }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm transition-colors"
          />
        </div>

        {/* Search and Clear Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchCandidatesByJob(searchJobId)}
            disabled={searchingByJob}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
              searchingByJob
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-black"
            }`}
          >
            {searchingByJob ? "Searching..." : "Search"}
          </button>
          <button
            onClick={() => {
              setSearchJobId("");
              setSearchingByJob(false);
              setCandidates([]);
            }}
            className="px-6 py-3 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-black transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Name/Email Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm transition-colors"
          />
        </div>
      </div>

      {/* Candidate Count */}
      {totalCandidates > 0 && (
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredCandidates.length} candidate
            {filteredCandidates.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Candidate Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {searchingByJob ? (
          <Loader />
        ) : (
          <>
            <div className="grid gap-4">
              {currentCandidates.map((candidate, idx) => (
                <div
                  key={candidate.id || idx}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm flex-shrink-0">
                      {getInitials(candidate.name)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {candidate.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {candidate.email}
                      </p>
                      <div className="flex items-center gap-2">
                        {candidate.resume_url && (
                          <button
                            onClick={() =>
                              handleResumeDownload(
                                candidate.resume_url,
                                candidate.name
                              )
                            }
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download Resume
                          </button>
                        )}

                        <button
                          onClick={() =>
                            removeApplication(candidate.id || candidate._id)
                          }
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                          Remove Application
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredCandidates.length === 0 && (
              <div className="text-center py-16">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No candidates found
                </h3>
                <p className="text-gray-500">
                  Enter a job ID to search for candidates.
                </p>
              </div>
            )}

            {/* Pagination */}
            {filteredCandidates.length > 0 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border rounded transition-colors ${
                      currentPage === i + 1
                        ? "bg-gray-900 text-white font-medium"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResumeLibrary;
