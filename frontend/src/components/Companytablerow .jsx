import {
  Eye,
  Trash2,
  Briefcase,
  MoreVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import CompanyDrivesRow from "./Companydrivesrow";

const CompanyTableRow = ({
  company,
  expandedCompanyId,
  showMenu,
  onViewDetails,
  onViewDrives,
  onDelete,
  onToggleMenu,
}) => {
  const isExpanded = expandedCompanyId === company._id;
  const isMenuOpen = showMenu === company._id;

  return (
    <>
      <tr className={`hover:bg-gray-50 ${isExpanded ? "bg-blue-50/40" : ""}`}>
        {/* Company info */}
        <td className="px-6 py-4">
          <div>
            <div className="font-medium text-gray-900">{company.name}</div>
            <div className="text-sm text-gray-500">{company.email || "-"}</div>
          </div>
        </td>

        {/* Industry */}
        <td className="px-6 py-4 text-sm text-gray-600">
          {company.industry || "-"}
        </td>

        {/* Location */}
        <td className="px-6 py-4 text-sm text-gray-600">
          {company.location || "-"}
        </td>

        {/* Status */}
        <td className="px-6 py-4 text-center">
          <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            Active
          </span>
        </td>

        {/* Actions */}
        <td className="px-6 py-4 text-center">
          <div className="relative inline-block">
            <button
              onClick={() => onToggleMenu(company._id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => onViewDetails(company)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>

                <button
                  onClick={() => onViewDrives(company)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Drives
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      View Drives
                    </>
                  )}
                </button>

                <button
                  onClick={() => onDelete(company)}
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

      {/* Expandable drives row */}
      {isExpanded && <CompanyDrivesRow company={company} />}
    </>
  );
};

export default CompanyTableRow;
