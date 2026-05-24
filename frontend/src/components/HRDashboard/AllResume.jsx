import React from "react";
import { Plus, Search, Filter, Eye, Download } from "lucide-react";

const AllResume = () => {
  // Sample candidate data matching the image
  const candidates = [
    { id: 1, name: "Sarah Johnson", role: "Frontend Developer" },
    { id: 2, name: "Michael Chen", role: "Backend Developer" },
    { id: 3, name: "Emily Rodriguez", role: "UX Designer" },
    { id: 4, name: "David Thompson", role: "Data Scientist" },
    { id: 5, name: "Lisa Park", role: "Product Manager" },
    { id: 6, name: "James Wilson", role: "Full Stack Developer" },
    { id: 7, name: "Maria Garcia", role: "UI/UX Designer" },
    { id: 8, name: "Robert Lee", role: "DevOps Engineer" },
    { id: 9, name: "Jennifer Brown", role: "Marketing Manager" },
    { id: 10, name: "Kevin Davis", role: "Software Engineer" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            All Resumes
          </h1>
          <p className="text-gray-600 text-sm">
            Browse through all candidate applications
          </p>
        </div>
        <button className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors">
          <Plus size={16} />
          Add Resume
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search resumes..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <select className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Sort by Name</option>
            <option>Sort by Date</option>
            <option>Sort by Role</option>
          </select>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Candidates Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">Candidates (247)</p>
      </div>

      {/* Candidates List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {candidates.map((candidate, index) => (
          <div
            key={candidate.id}
            className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
              index !== candidates.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            {/* Candidate Info */}
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">
                  {candidate.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              {/* Name and Role */}
              <div>
                <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                <p className="text-sm text-gray-500">{candidate.role}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Eye size={16} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Download size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-gray-600">Showing 1 to 5 of 247 results</p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors">
            Previous
          </button>
          <button className="px-3 py-2 bg-gray-800 text-white rounded-lg">
            1
          </button>
          <button className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            2
          </button>
          <button className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            3
          </button>
          <span className="px-2 text-gray-400">...</span>
          <button className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            50
          </button>
          <button className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllResume;
