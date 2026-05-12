import { useGetDrivesByCompany } from "../Hooks/drives hooks/useGetDrivesByCompany";

const CompanyDrivesRow = ({ company }) => {
  const { drives: companyDrives, loading: companyDrivesLoading } =
    useGetDrivesByCompany(company._id);

  return (
    <tr>
      <td colSpan={5} className="px-6 py-0 bg-blue-50 border-b border-blue-100">
        <div className="py-4">
          <p className="text-xs font-semibold text-blue-600 uppercase mb-3 tracking-wide">
            Drives for {company.name}
          </p>

          {companyDrivesLoading ? (
            <p className="text-sm text-gray-500">Loading drives...</p>
          ) : companyDrives.length === 0 ? (
            <p className="text-sm text-gray-500">
              No drives found for this company.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {companyDrives.map((drive) => (
                <div
                  key={drive._id}
                  className="bg-white border border-blue-100 rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {drive.role}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {drive.location}
                    </p>
                  </div>
                  <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                    {drive.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default CompanyDrivesRow;
