import React, { useState, useEffect } from "react";
import { Clock, Search, CheckCircle, XCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../Loader";
import { useUsers } from "../../Hooks/userHooks/useGetAllUsers";

const ClientRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { users, loading: isGettingAllUsers } = useUsers();

  const requestsPerPage = 10;

  useEffect(() => {
    if (!isGettingAllUsers) {
      const pendingUsers = (users || []).filter(
        (user) => user.is_approved === "pending",
      );

      setRequests(pendingUsers);
      setLoading(false);
    }
  }, [users, isGettingAllUsers]);

  const handleApprove = async (req) => {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await fetch(`${baseUrl}/api/auth/approve-user/${req._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_approved: "approved" }),
      });

      if (response.ok) {
        setRequests((prev) => prev.filter((r) => r._id !== req._id));
        toast.success(`${req.name} approved`);
      } else {
        toast.error(`Failed to approve ${req.name}`);
      }
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error(`An error occurred while approving ${req.name}`);
    }
  };

  const handleReject = async (req) => {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await fetch(`${baseUrl}/api/auth/approve-user/${req._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_approved: "rejected" }),
      });

      if (response.ok) {
        setRequests((prev) => prev.filter((r) => r._id !== req._id));
        toast.success(`${req.name} rejected`);
      } else {
        toast.error(`Failed to reject ${req.name}`);
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error(`An error occurred while rejecting ${req.name}`);
    }
  };

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.role?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / requestsPerPage);
  const startIndex = (currentPage - 1) * requestsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + requestsPerPage);

  const counts = {
    all: users.filter((u) => u.is_approved === "pending").length,
    approved: users.filter((u) => u.is_approved === "approved").length,
    rejected: users.filter((u) => u.is_approved === "rejected").length,
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <Clock className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">
              Client Requests
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Review and manage user approval requests
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{counts.all}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-600">
              {counts.approved}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-500">{counts.rejected}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              type="text"
              placeholder="Search by user name, email or role..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginated.map((req) => (
                  <tr
                    key={req._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {req.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {req.email}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {req.role || "-"}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        Pending
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApprove(req)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>

                        <button
                          onClick={() => handleReject(req)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-14">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-base font-medium text-gray-900 mb-1">
                No requests found
              </h3>
              <p className="text-sm text-gray-500">
                No pending approvals available
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-200">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded text-sm ${
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
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientRequests;
