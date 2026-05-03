import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Loader from "../Loader";
import CompanyStatsGrid from "../CompanyStatsGrid";
import CompanySearchBar from "../CompanySearchBar";
import CompanyTable from "../CompanyTable";

import { useGetCompanies } from "../../Hooks/company hooks/useGetCompanies";
import { useUsers } from "../../Hooks/userHooks/useGetAllUsers";
import { useGetAllDrives } from "../../Hooks/drives hooks/useGetAllDrives";
import { useGetAllCandidates } from "../../Hooks/candidate hooks/useGetAllCandidates";

const COMPANIES_PER_PAGE = 10;

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMenu, setShowMenu] = useState(null);
  const [expandedCompanyId, setExpandedCompanyId] = useState(null);

  const { companies: com, loading: isGettingCompanies } = useGetCompanies();
  const { users, loading: isGettingAllUsers } = useUsers();
  const { drives, loading: isGettingDrives } = useGetAllDrives();
  const { candidates, loading: isGettingCandidates } = useGetAllCandidates();

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

  const activeDrives = drives.filter((drive) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(drive.start_date);
    const endDate = new Date(drive.end_date);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return startDate <= today && endDate >= today;
  });

  const filteredCompanies = companies.filter(
    (company) =>
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const acceptedUsers = users.filter((user) => user.is_approved === "accepted");

  const totalPages = Math.ceil(filteredCompanies.length / COMPANIES_PER_PAGE);
  const startIndex = (currentPage - 1) * COMPANIES_PER_PAGE;
  const currentCompanies = filteredCompanies.slice(
    startIndex,
    startIndex + COMPANIES_PER_PAGE,
  );

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleViewDetails = (company) => {
    toast.info(`Viewing details for ${company.name}`);
    setShowMenu(null);
  };

  const handleViewDrives = (company) => {
    setExpandedCompanyId((prev) => (prev === company._id ? null : company._id));
    setShowMenu(null);
  };

  const handleDelete = (company) => {
    if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
      toast.success(`${company.name} deleted successfully`);
    }
    setShowMenu(null);
  };

  const handleToggleMenu = (companyId) => {
    setShowMenu((prev) => (prev === companyId ? null : companyId));
  };

  if (
    loading ||
    isGettingCompanies ||
    isGettingAllUsers ||
    isGettingCandidates ||
    isGettingDrives
  ) {
    return <Loader />;
  }

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
        <CompanyStatsGrid
          totalCompanies={companies.length}
          activeDrives={activeDrives.length}
          totalUsers={acceptedUsers.length}
          totalCandidates={candidates.length}
        />

        <CompanySearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        <CompanyTable
          companies={currentCompanies}
          currentPage={currentPage}
          totalPages={totalPages}
          expandedCompanyId={expandedCompanyId}
          showMenu={showMenu}
          onViewDetails={handleViewDetails}
          onViewDrives={handleViewDrives}
          onDelete={handleDelete}
          onToggleMenu={handleToggleMenu}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default AdminCompanies;
