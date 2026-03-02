import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    FileText,
    Award,
    ExternalLink,
    Download,
    Calendar,
    Clock,
    User,
    CheckCircle2
} from "lucide-react";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CandidateDetails = () => {
    const { candidateId } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCandidateDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${BASE_URL}/api/auth/candidate?candidate_id=${candidateId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch candidate details");
                }
                const data = await response.json();
                setCandidate(data.candidate);
            } catch (error) {
                console.error("Error fetching candidate details:", error);
                toast.error("Could not load candidate information.");
            } finally {
                setLoading(false);
            }
        };

        if (candidateId) {
            fetchCandidateDetails();
        }
    }, [candidateId]);

    // Team Note: View Resume should preview PDF in new tab (not download)
    const handleViewResume = () => {
        window.open(
            `${BASE_URL}/api/resume/view/${candidateId}`,
            "_blank"
        );
    };

    // ✅ Fix: Download PDF should force download
    const handleDownloadResume = () => {
        if (!candidate?.resume_url) return;

        // Feature: Force resume download instead of preview
        const link = document.createElement("a");
        link.href = candidate.resume_url;
        link.download = `${candidate.name || 'Candidate'}_Resume.pdf`;
        link.click();
    };

    if (loading) return <Loader />;

    if (!candidate) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
                <User className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Candidate not found</h2>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Go back to list
                </button>
            </div>
        );
    }

    const getInitials = (name) => {
        if (!name) return "NA";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    // Feature: Show hiring progress only if backend provides round data
    const showRounds = candidate.total_rounds !== undefined && candidate.completed_rounds !== undefined;
    const roundsRemaining = showRounds ? (candidate.total_rounds - candidate.completed_rounds) : 0;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header / Navigation */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Shortlist
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-400">Candidate ID: {candidateId.slice(-8).toUpperCase()}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Candidate Profile Card */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* profile header card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="h-32 bg-gray-900 relative">
                                <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-2xl bg-white p-1 border-4 border-gray-50 shadow-sm">
                                    <div className="w-full h-full rounded-xl bg-gray-900 flex items-center justify-center text-white text-2xl font-bold">
                                        {getInitials(candidate.name)}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-16 pb-8 px-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">{candidate.name}</h1>
                                        {candidate.role && (
                                            <p className="text-lg text-gray-600 mt-1 flex items-center gap-2">
                                                <Briefcase size={18} className="text-gray-400" />
                                                {candidate.role}
                                            </p>
                                        )}
                                    </div>
                                    {candidate.resume_score && (
                                        <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-3 text-center">
                                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">ATS Score</p>
                                            <p className="text-3xl font-bold text-green-700">{candidate.resume_score}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <Mail size={18} className="text-gray-400" />
                                        <span className="text-sm font-medium">{candidate.email}</span>
                                    </div>
                                    {candidate.phone && (
                                        <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <Phone size={18} className="text-gray-400" />
                                            <span className="text-sm font-medium">{candidate.phone}</span>
                                        </div>
                                    )}
                                    {candidate.location && (
                                        <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <MapPin size={18} className="text-gray-400" />
                                            <span className="text-sm font-medium">{candidate.location}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <Calendar size={18} className="text-gray-400" />
                                        <span className="text-sm font-medium">Applied on {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Note: Skills only show if provided by backend */}
                        {candidate.skills && candidate.skills.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <FileText className="text-blue-500" />
                                    Candidate Skills
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {candidate.skills.map((skill, index) => (
                                        <span key={index} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-sm font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Action Center & Progress */}
                    <div className="space-y-6">
                        {/* Action Center */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Action Center</h2>
                            <div className="space-y-3">
                                {candidate.resume_url && (
                                    <button
                                        onClick={handleViewResume}
                                        className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-xl font-medium hover:bg-black transition-colors"
                                    >
                                        <ExternalLink size={18} />
                                        View Resume
                                    </button>
                                )}
                                <button
                                    onClick={handleDownloadResume}
                                    className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-200 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                >
                                    <Download size={18} />
                                    Download PDF
                                </button>
                            </div>
                        </div>

                        {/* Recruitment Stage & Rounds Remaining (backend-driven) */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Current Status</h2>
                            <div className="flex items-center gap-4 text-sm mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Award size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 capitalize">{candidate.status || 'Shortlisted'}</p>
                                    <p className="text-gray-500">Recruitment Stage</p>
                                </div>
                            </div>

                            {/* Feature: Show hiring progress only if backend provides round data */}
                            {showRounds && (
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-3 text-sm text-gray-700">
                                        <Clock size={16} className="text-gray-400" />
                                        <span>Rounds Remaining: <strong>{roundsRemaining} / {candidate.total_rounds}</strong></span>
                                    </div>
                                    <div className="mt-2 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full transition-all duration-500"
                                            style={{ width: `${(candidate.completed_rounds / candidate.total_rounds) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CandidateDetails;
