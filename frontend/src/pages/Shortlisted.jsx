import React, { useState, useMemo } from "react";
import { Search, FileText, Award } from "lucide-react";

import Loader from "../components/Loader";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ShortlistedResumes = () => {
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobId, setJobId] = useState("");

  const candidatesPerPage = 5;

  // Fetch shortlisted candidates for a given Job ID
  const fetchShortlistedCandidates = async (jobIdValue) => {
    console.log("🔍 fetchShortlistedCandidates called with:", jobIdValue);
    if (!jobIdValue.trim()) {
      setCandidates([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Fetch shortlisted candidate IDs with scores
      const response = await fetch(
        `${BASE_URL}/api/drive/job/shortlisted?job_id=${jobIdValue}`
      );
      if (!response.ok)
        throw new Error("Failed to fetch shortlisted candidates");

      const data = await response.json();
      console.log("Full API Response:", data);
      console.log("Candidates array:", data.candidates);

      // Extract candidate info including resume_score
      const candidateInfo =
        data.candidates?.map((c) => {
          console.log("Processing candidate:", c);
          console.log("Resume score:", c.resume_score);
          return {
            candidate_id: c.candidate_id,
            resume_score: c.resume_score !== undefined ? c.resume_score : null,
          };
        }) || [];

      console.log("Extracted candidate info:", candidateInfo);

      if (candidateInfo.length === 0) {
        setCandidates([]);
        setCurrentPage(1);
        return;
      }

      // Step 2: Fetch candidate details for each candidate_id
      const candidateDetailsPromises = candidateInfo.map(async (info) => {
        try {
          const res = await fetch(
            `${BASE_URL}/api/user/candidate?candidate_id=${info.candidate_id}`
          );
          if (!res.ok)
            throw new Error(`Failed to fetch candidate ${info.candidate_id}`);
          const candidateData = await res.json();
          const candidateDetails =
            candidateData.candidate || candidateData.data || candidateData;

          const result = {
            id: info.candidate_id,
            name: candidateDetails?.name || "N/A",
            email: candidateDetails?.email || "N/A",
            resume_score: info.resume_score,
          };

          console.log("Final candidate object:", result);
          return result;
        } catch (err) {
          console.error(err);
          return {
            id: info.candidate_id,
            name: "Error loading",
            email: "Error loading",
            resume_score: info.resume_score,
          };
        }
      });

      const candidateDetails = await Promise.all(candidateDetailsPromises);
      console.log("All candidate details:", candidateDetails);
      setCandidates(candidateDetails);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter candidates based on search
  const filteredCandidates = useMemo(() => {
    return candidates.filter(
      (c) =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [candidates, searchTerm]);

  // Pagination
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

  const getScoreColor = (score) => {
    if (score === null || score === undefined)
      return "text-gray-600 bg-gray-50 border-gray-200";
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Shortlisted Resumes
          </h1>
          <p className="text-gray-600">View shortlisted candidates by Job ID</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="flex gap-2 flex-1 max-w-md">
          <input
            type="text"
            placeholder="Enter Job ID..."
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") fetchShortlistedCandidates(jobId);
            }}
            className="flex-1 px-3 py-3 rounded-lg border border-gray-300 bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm transition-colors"
          />
          <button
            onClick={() => fetchShortlistedCandidates(jobId)}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Candidate Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid gap-4">
          {currentCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm flex-shrink-0">
                    {getInitials(candidate.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {candidate.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{candidate.email}</p>
                  </div>
                </div>

                {/* Resume Score Badge */}
                {candidate.resume_score !== null &&
                  candidate.resume_score !== undefined && (
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getScoreColor(
                        candidate.resume_score
                      )}`}
                    >
                      <Award className="w-4 h-4" />
                      <div className="text-right">
                        <div className="text-xs font-medium opacity-75">
                          Resume Score
                        </div>
                        <div className="text-2xl font-bold">
                          {candidate.resume_score}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCandidates.length === 0 && !loading && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {jobId
                ? "No shortlisted candidates found"
                : "Enter a Job ID to view candidates"}
            </h3>
            <p className="text-gray-500">
              {jobId
                ? "Try adjusting your search."
                : "Search for candidates by entering a Job ID above."}
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredCandidates.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1 ? "bg-gray-200 font-medium" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortlistedResumes;
