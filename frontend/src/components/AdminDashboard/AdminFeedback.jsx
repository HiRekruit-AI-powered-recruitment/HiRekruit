import React, { useState, useEffect } from "react";
import { MessageSquare, Search, CheckCircle, Clock } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Loader from "../Loader";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const requestsPerPage = 10;
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/settings/feedback/all`);
      setFeedbacks(response.data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error("Failed to fetch feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleUpdateStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "pending" ? "resolved" : "pending";
      await axios.put(`${BASE_URL}/api/settings/feedback/${id}/status`, { status: newStatus });
      toast.success(`Feedback marked as ${newStatus}`);
      
      // Update local state
      setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, status: newStatus } : f));
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const filtered = feedbacks.filter((f) => {
    const matchSearch =
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.message?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / requestsPerPage);
  const startIndex = (currentPage - 1) * requestsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + requestsPerPage);

  const counts = {
    all: feedbacks.length,
    resolved: feedbacks.filter((f) => f.status === "resolved").length,
    pending: feedbacks.filter((f) => f.status === "pending").length,
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <MessageSquare className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">
              User Feedback
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Review and manage user feedback and bug reports
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total Feedback</p>
            <p className="text-2xl font-bold text-gray-900">{counts.all}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-amber-500">
              {counts.pending}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Resolved</p>
            <p className="text-2xl font-bold text-green-500">{counts.resolved}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              type="text"
              placeholder="Search by name, email, company, or message..."
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
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-1/3">
                    Message
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
                {paginated.map((feedback) => (
                  <tr
                    key={feedback._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div>{feedback.name}</div>
                      <div className="text-xs text-gray-500 font-normal">{feedback.email}</div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {feedback.company_name}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs break-words">
                      {feedback.message}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${feedback.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {feedback.status === 'resolved' ? 'Resolved' : 'Pending'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {feedback.status === 'pending' ? (
                          <button
                            onClick={() => handleUpdateStatus(feedback._id, feedback.status)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Mark Resolved
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(feedback._id, feedback.status)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            Mark Pending
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-14">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-base font-medium text-gray-900 mb-1">
                No feedback found
              </h3>
              <p className="text-sm text-gray-500">
                You're all caught up!
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

export default AdminFeedback;
