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
import { useGetCompanies } from "../../Hooks/company hooks/useGetCompanies";
import { useUsers } from "../../Hooks/userHooks/useGetAllUsers";
import { useGetAllDrives } from "../../Hooks/drives hooks/useGetAllDrives";
import { useGetAllCandidates } from "../../Hooks/candidate hooks/useGetAllCandidates";

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showMenu, setShowMenu] = useState(null);

  const { companies: com, loading: isGettingCompanies } = useGetCompanies();
  const { users, loading: isGettingAllUsers } = useUsers();
  const { drives, loading: isGettingDrives } = useGetAllDrives();
  const { candidates, loading: isGettingCandidates } = useGetAllCandidates();

  const companiesPerPage = 10;
  const activeDrives = drives.filter((drive) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(drive.start_date);
    const endDate = new Date(drive.end_date);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return startDate <= today && endDate >= today;
  });

  useEffect(() => {
    if (
      !isGettingCompanies &&
      !isGettingAllUsers &&
      !isGettingDrives &&
      !isGettingCandidates
    ) {
      setCompanies(com || []);
      setLoading(false);
    }
  }, [
    com,
    users,
    drives,
    candidates,
    isGettingCompanies,
    isGettingAllUsers,
    isGettingDrives,
    isGettingCandidates,
  ]);

  const filteredCompanies = companies.filter(
    (company) =>
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);
  const startIndex = (currentPage - 1) * companiesPerPage;
  const currentCompanies = filteredCompanies.slice(
    startIndex,
    startIndex + companiesPerPage,
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

  if (
    loading ||
    isGettingCompanies ||
    isGettingAllUsers ||
    isGettingCandidates ||
    isGettingDrives
  )
    return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />

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
              {activeDrives.length}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total HR Users</p>
            <p className="text-2xl font-bold text-green-600">{users.length}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Candidates</p>
            <p className="text-2xl font-bold text-purple-600">
              {candidates.length}
            </p>
          </div>
        </div>

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

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentCompanies.map((company) => (
                  <tr key={company._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {company.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {company.email || "-"}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {company.industry || "-"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {company.location || "-"}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium capitalize">
                        Active
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setShowMenu(
                              showMenu === company._id ? null : company._id,
                            )
                          }
                          className="p-1 hover:bg-gray-100 rounded"
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
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>

                            <button
                              onClick={() => {
                                handleEditCompany(company);
                                setShowMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
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

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-200">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
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
                      : ""
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
