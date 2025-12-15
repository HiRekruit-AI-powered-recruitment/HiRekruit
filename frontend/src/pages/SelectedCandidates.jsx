import React, { useState, useMemo } from "react";
import { Search, FileText, Download, Trophy } from "lucide-react";
import { toast } from "react-hot-toast";
import Loader from "../components/Loader";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SelectedCandidates = () => {
  const [searchJobId, setSearchJobId] = useState("");
  const [searchingByJob, setSearchingByJob] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const candidatesPerPage = 5;

  const fetchSelectedByJob = async (jobId) => {
    if (!jobId) {
      toast.error("Please enter a Job ID to search");
      return;
    }

    setSearchingByJob(true);
    setError(null);
    try {
      const res = await fetch(
        `${BASE_URL}/api/drive/job/selected?job_id=${encodeURIComponent(jobId)}`
      );
      if (!res.ok) throw new Error("Failed to fetch selected candidates");
      const data = await res.json();
      const items = data.candidates || [];
      const normalized = items.map((c, i) => ({
        id: c._id || c.id || i,
        name: c.name || "N/A",
        email: c.email || "",
        resume_url: c.resume_url || c.resumeUrl || "",
        raw: c,
      }));
      setCandidates(normalized);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setCandidates([]);
      toast.error("Could not load selected candidates");
    } finally {
      setSearchingByJob(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    if (!candidates.length) return [];
    const q = (searchTerm || "").toLowerCase();
    return candidates.filter((c) => {
      const name = (c.name || "").toString().toLowerCase();
      const email = (c.email || "").toString().toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [candidates, searchTerm]);

  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);
  const startIndex = (currentPage - 1) * candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(
    startIndex,
    startIndex + candidatesPerPage
  );

  const getInitials = (name) => {
    if (!name || name === "N/A") return "NA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleResumeDownload = async (resumeUrl, candidateName) => {
    try {
      const loadingToast = toast.loading("Downloading resume...");
      let blob;
      if (resumeUrl.startsWith("data:")) {
        const base64Data = resumeUrl.split(",")[1];
        const mimeType =
          resumeUrl.match(/data:([^;]+)/)?.[1] || "application/pdf";
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++)
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: mimeType });
      } else {
        const response = await fetch(resumeUrl);
        if (!response.ok) throw new Error("Failed to fetch resume");
        blob = await response.blob();
      }
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
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Selected Candidates
          </h1>
          <p className="text-sm text-gray-600">
            View selected candidates by Job ID
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Enter Job ID..."
            value={searchJobId}
            onChange={(e) => setSearchJobId(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") fetchSelectedByJob(searchJobId);
            }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchSelectedByJob(searchJobId)}
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

      {candidates.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <p className="text-sm text-gray-600">
            Showing {candidates.length} candidate
            {candidates.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {error && (
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        </div>
      )}

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
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm flex-shrink-0">
                      {getInitials(candidate.name)}
                    </div>
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
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCandidates.length === 0 && (
              <div className="text-center py-16">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No candidates found
                </h3>
                <p className="text-gray-500">
                  Enter a job ID to search for selected candidates.
                </p>
              </div>
            )}

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

export default SelectedCandidates;
