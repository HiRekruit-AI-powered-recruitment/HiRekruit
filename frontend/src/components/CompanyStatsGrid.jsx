const CompanyStatsGrid = ({
  totalCompanies,
  activeDrives,
  totalUsers,
  totalCandidates,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-600 mb-1">Total Companies</p>
        <p className="text-2xl font-bold text-gray-900">{totalCompanies}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-600 mb-1">Active Drives</p>
        <p className="text-2xl font-bold text-blue-600">{activeDrives}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-600 mb-1">Total HR Users</p>
        <p className="text-2xl font-bold text-green-600">{totalUsers}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-600 mb-1">Total Candidates</p>
        <p className="text-2xl font-bold text-purple-600">{totalCandidates}</p>
      </div>
    </div>
  );
};

export default CompanyStatsGrid;
