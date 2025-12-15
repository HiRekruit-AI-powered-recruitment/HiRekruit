import React, { useState, useEffect } from "react";
import {
  Search,
  Building2,
  Users,
  Briefcase,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../Loader";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showMenu, setShowMenu] = useState(null);

  const companiesPerPage = 10;

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch(`${BASE_URL}/api/admin/companies`);
      // const data = await response.json();
      // setCompanies(data.companies);

      // Mock data for now
      setTimeout(() => {
        const mockCompanies = [
          {
            _id: "1",
            name: "Tech Corp",
            email: "hr@techcorp.com",
            industry: "Technology",
            size: "500-1000",
            location: "San Francisco, CA",
            activeDrives: 5,
            totalHRUsers: 8,
            totalCandidates: 234,
            createdAt: "2025-01-15",
            status: "active",
          },
          {
            _id: "2",
            name: "StartupXYZ",
            email: "contact@startupxyz.com",
            industry: "FinTech",
            size: "50-100",
            location: "New York, NY",
            activeDrives: 3,
            totalHRUsers: 4,
            totalCandidates: 87,
            createdAt: "2025-02-20",
            status: "active",
          },
          {
            _id: "3",
            name: "Global Solutions",
            email: "hr@globalsolutions.com",
            industry: "Consulting",
            size: "1000+",
            location: "London, UK",
            activeDrives: 12,
            totalHRUsers: 15,
            totalCandidates: 567,
            createdAt: "2023-11-10",
            status: "active",
          },
        ];
        setCompanies(mockCompanies);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error fetching companies:", err);
      toast.error("Failed to load companies");
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);
  const startIndex = (currentPage - 1) * companiesPerPage;
  const currentCompanies = filteredCompanies.slice(
    startIndex,
    startIndex + companiesPerPage
  );

  const handleViewCompany = (company) => {
    setSelectedCompany(company);
    toast.info(`Viewing details for ${company.name}`);
  };

  const handleEditCompany = (company) => {
    toast.info(`Edit functionality for ${company.name}`);
  };

  const handleDeleteCompany = (company) => {
    if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
      toast.success(`${company.name} deleted successfully`);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">
              All Companies
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            Manage and monitor all registered companies
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Companies</p>
            <p className="text-2xl font-bold text-gray-900">
              {companies.length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Active Drives</p>
            <p className="text-2xl font-bold text-blue-600">
              {companies.reduce((sum, c) => sum + c.activeDrives, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total HR Users</p>
            <p className="text-2xl font-bold text-green-600">
              {companies.reduce((sum, c) => sum + c.totalHRUsers, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Candidates</p>
            <p className="text-2xl font-bold text-purple-600">
              {companies.reduce((sum, c) => sum + c.totalCandidates, 0)}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company name, email, or industry..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Active Drives
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    HR Users
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Candidates
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentCompanies.map((company) => (
                  <tr
                    key={company._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {company.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {company.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {company.industry}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {company.location}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        <Briefcase className="w-3 h-3" />
                        {company.activeDrives}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <Users className="w-3 h-3" />
                        {company.totalHRUsers}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                      {company.totalCandidates}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium capitalize">
                        {company.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setShowMenu(
                              showMenu === company._id ? null : company._id
                            )
                          }
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {showMenu === company._id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <button
                              onClick={() => {
                                handleViewCompany(company);
                                setShowMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                handleEditCompany(company);
                                setShowMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteCompany(company);
                                setShowMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-200">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white border-blue-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No companies found
            </h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCompanies;
