import { Search } from "lucide-react";

const CompanySearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by company name, email, or industry..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>
    </div>
  );
};

export default CompanySearchBar;
