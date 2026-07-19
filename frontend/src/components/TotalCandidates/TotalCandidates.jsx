import ActiveCandidateStats from "./ActiveCandidateStats";
import AvgCandidateStats from "./AvgCandidateStats";
import Header from "./Header";
import NewCandidateStats from "./NewCandidateStats";
import TotalCandidateStats from "./TotalCandidateStats";
import { DataTable } from "./Data/data-table";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";

const TotalCandidates = () => {

    // STATE (real data)
    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");

    // Deletion function 
    const handleDelete = async (candidateId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this candidate?"
        );

        if (!confirmDelete) return;

        try {
            // temporary frontend delete
            setData((prev) =>
                prev.filter((candidate) => candidate.id !== candidateId)
            );

            console.log("Deleted candidate:", candidateId);

        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    // FETCH REAL CANDIDATES (INSIDE COMPONENT)
    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/auth/allCandidates");
                const json = await res.json();

                setData(
                    (json.candidates || []).map((c) => ({
                        id: c._id,
                        name: c.name,
                        email: c.email,
                        role: c.role,
                        status: c.status,
                    }))
                );
            } catch (err) {
                console.log("Error fetching candidates:", err);
            }
        };

        fetchCandidates();
    }, []);

    // FILTER LOGIC
    const filteredData = data.filter((item) =>
        (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.role || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">

            {/* Header */}
            <section>
                <Header />
            </section>

            {/* Stats Cards */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

                {/* Total Candidates */}
                <TotalCandidateStats
                    count={data.length}
                />

                {/* Interviewed Candidates */}
                <ActiveCandidateStats
                    count={
                        data.filter(
                            c =>
                                c.status === "Interview In Progress" ||
                                c.status === "Interview Completed" ||
                                c.status === "Rejected"
                        ).length
                    }
                />

                {/* Shortlisted Candidates */}
                <NewCandidateStats
                    count={
                        data.filter(
                            c =>
                                c.status === "Shortlisted" ||
                                c.status === "Interview Scheduled" ||
                                c.status === "Interview In Progress" ||
                                c.status === "Interview Completed" ||
                                c.status === "Selected"
                        ).length
                    }
                />

                {/* Selected Candidates */}
                <AvgCandidateStats
                    value={
                        data.filter(
                            c => c.status === "Selected"
                        ).length
                    }
                />

            </section>

            {/* Search */}
            <section>
                <SearchBar
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, or role..."
                />
            </section>

            {/* Table */}
            <section>
                <DataTable
                    data={filteredData}
                    onDelete={handleDelete} />
            </section>

        </div>
    );
};

export default TotalCandidates;