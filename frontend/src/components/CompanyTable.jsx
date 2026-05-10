import React from "react";
import { Building2 } from "lucide-react";
import CompanyTableRow from "./Companytablerow ";

const CompanyTable = ({
  companies,
  currentPage,
  totalPages,
  expandedCompanyId,
  showMenu,
  onViewDetails,
  onViewDrives,
  onDelete,
  onToggleMenu,
  onPageChange,
}) => {
  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No companies found
        </h3>
        <p className="text-gray-500">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
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
            {companies.map((company) => (
              <React.Fragment key={company._id}>
                <CompanyTableRow
                  company={company}
                  expandedCompanyId={expandedCompanyId}
                  showMenu={showMenu}
                  onViewDetails={onViewDetails}
                  onViewDrives={onViewDrives}
                  onDelete={onDelete}
                  onToggleMenu={onToggleMenu}
                />
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-200">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
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
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanyTable;
