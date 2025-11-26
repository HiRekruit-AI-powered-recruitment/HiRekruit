import React, { useState, useMemo, useEffect } from "react";
import { Search, FileText, ChevronDown, Download } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";
import Loader from "../components/Loader";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ResumeLibrary = () => {
  const { user } = useUser();
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // New states for drives
  const [companyId, setCompanyId] = useState("");
  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState("");

  const candidatesPerPage = 5;

  // Fetch HR info and company ID
  useEffect(() => {
    const fetchHRInfo = async () => {
      try {
        const email = user?.emailAddresses[0]?.emailAddress;
        if (!email) return;

        const response = await fetch(
          `${BASE_URL}/api/drive/hr-info?email=${encodeURIComponent(email)}`
        );

        if (!response.ok) throw new Error("Failed to fetch HR info");

        const hrData = await response.json();
        if (hrData.company_id) {
          setCompanyId(hrData.company_id);
        }
      } catch (err) {
        console.error("Error fetching HR info:", err.message);
        toast.error("Could not load HR information.");
      }
    };

    if (user) {
      fetchHRInfo();
    }
  }, [user]);

  // Fetch all drives for the company
  useEffect(() => {
    const fetchDrives = async () => {
      try {
        if (!companyId) return;

        const response = await fetch(
          `${BASE_URL}/api/drive/company/${companyId}`
        );

        if (!response.ok) throw new Error("Failed to fetch drives");

        const data = await response.json();
        setDrives(data.drives || []);

        // Auto-select first drive if available
        if (data.drives && data.drives.length > 0) {
          setSelectedDriveId(data.drives[0]._id);
        }
      } catch (err) {
        console.error("Error fetching drives:", err.message);
        toast.error("Could not load drives.");
      }
    };

    if (companyId) {
      fetchDrives();
    }
  }, [companyId]);

  // Fetch candidates when drive is selected
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!selectedDriveId) {
        setCandidates([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${BASE_URL}/api/resume/${selectedDriveId}/candidates`
        );

        if (!response.ok) throw new Error("Failed to fetch candidates");

        const data = await response.json();
        console.log("all candidates", data);
        setCandidates(data.candidates || []);
        setCurrentPage(1);
      } catch (err) {
        setError(err.message);
        setCandidates([]);
        toast.error("Could not load candidates.");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [selectedDriveId]);

  // Handle resume download
  const handleResumeDownload = async (resumeUrl, candidateName) => {
    try {
      const loadingToast = toast.loading("Downloading resume...");
      
      let blob;
      
      // Check if it's a base64 data URL
      if (resumeUrl.startsWith('data:')) {
        // Extract base64 data
        const base64Data = resumeUrl.split(',')[1];
        const mimeType = resumeUrl.match(/data:([^;]+)/)?.[1] || 'application/pdf';
        
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
      const link = document.createElement('a');
      link.href = url;
      link.download = `${candidateName.replace(/\s+/g, '_')}_Resume.pdf`;
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

  // Filter candidates based on search term
  const filteredCandidates = useMemo(() => {
    if (!candidates.length) return [];

    return candidates.filter((c) => {
      return (
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
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

  if (loading && !drives.length) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Resume Library
          </h1>
          <p className="text-gray-600">Browse and manage candidate resumes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Drive Selector */}
        <div className="relative flex-1 max-w-md">
          <select
            value={selectedDriveId}
            onChange={(e) => setSelectedDriveId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm transition-colors appearance-none"
          >
            <option value="">Select a drive...</option>
            {drives.map((drive) => (
              <option key={drive._id} value={drive._id}>
                {drive.title || drive.name || `Drive ${drive._id}`}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Search */}
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
      {selectedDriveId && !loading && (
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
        {loading ? (
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
                      {candidate.resume_url && (
                        <button
                          onClick={() => handleResumeDownload(candidate.resume_url, candidate.name)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download Resume
                        </button>
                      )}
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
                  {selectedDriveId
                    ? "No candidates found"
                    : "Select a drive to view candidates"}
                </h3>
                <p className="text-gray-500">
                  {selectedDriveId
                    ? "Try adjusting your search or select a different drive."
                    : "Choose a drive from the dropdown above to see its candidates."}
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