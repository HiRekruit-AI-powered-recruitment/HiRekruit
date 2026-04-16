import React, { useState, useEffect } from "react";
import {
  Clock,
  Search,
  CheckCircle,
  XCircle,
  Building2,
  Users,
  MapPin,
  Mail,
  Phone,
  Eye,
  MoreVertical,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../Loader";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AVATAR_COLORS = [
  { bg: "#E6F1FB", txt: "#185FA5" },
  { bg: "#E1F5EE", txt: "#0F6E56" },
  { bg: "#EEEDFE", txt: "#534AB7" },
  { bg: "#FAEEDA", txt: "#854F0B" },
  { bg: "#FAECE7", txt: "#993C1D" },
  { bg: "#EAF3DE", txt: "#3B6D11" },
  { bg: "#FBEAF0", txt: "#993556" },
];

const getInitials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const Avatar = ({ name, index, size = "md" }) => {
  const c = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const sz = size === "lg" ? "w-12 h-12 text-sm" : "w-9 h-9 text-xs";
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}
      style={{ background: c.bg, color: c.txt }}
    >
      {getInitials(name)}
    </div>
  );
};

const MOCK_REQUESTS = [
  {
    _id: "r1",
    name: "GreenRoot Energy",
    email: "hr@greenroot.io",
    phone: "+1 (415) 234-5678",
    industry: "Clean Energy",
    size: "50–100",
    location: "Austin, TX",
    requestedAt: "Apr 5, 2026",
    contact: "Priya Nair",
    contactRole: "Head of HR",
    message: "Looking to streamline our campus hiring process for 2026.",
    status: "pending",
  },
  {
    _id: "r2",
    name: "CyberShield Inc.",
    email: "hr@cybershield.io",
    phone: "+1 (212) 987-6543",
    industry: "Cybersecurity",
    size: "50–100",
    location: "New York, NY",
    requestedAt: "Apr 3, 2026",
    contact: "Anya Petrov",
    contactRole: "Talent Acquisition Lead",
    message: "We need a platform to manage technical hiring drives at scale.",
    status: "pending",
  },
  {
    _id: "r3",
    name: "FreshCart Grocery",
    email: "people@freshcart.co",
    phone: "+1 (312) 456-7890",
    industry: "E-Commerce",
    size: "200–500",
    location: "Chicago, IL",
    requestedAt: "Apr 1, 2026",
    contact: "David Kim",
    contactRole: "VP People",
    message: "Rapid expansion requires bulk hiring across 12 cities.",
    status: "pending",
  },
  {
    _id: "r4",
    name: "AeroSpace Dynamics",
    email: "cto@aerodyn.com",
    phone: "+1 (310) 321-0987",
    industry: "Aerospace",
    size: "200–500",
    location: "Los Angeles, CA",
    requestedAt: "Mar 30, 2026",
    contact: "James Okafor",
    contactRole: "CTO",
    message: "Seeking specialised engineering recruitment support.",
    status: "pending",
  },
  {
    _id: "r5",
    name: "UrbanNest Realty",
    email: "ops@urbannest.com",
    phone: "+1 (646) 789-0123",
    industry: "Real Estate",
    size: "10–50",
    location: "Miami, FL",
    requestedAt: "Mar 28, 2026",
    contact: "Mohammed Al-Rashid",
    contactRole: "Operations Manager",
    message: "Small team, need a lightweight hiring solution.",
    status: "pending",
  },
];

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

const ClientRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showMenu, setShowMenu] = useState(null);

  const requestsPerPage = 10;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch(`${BASE_URL}/api/admin/client-requests`);
      // const data = await response.json();
      // setRequests(data.requests);

      setTimeout(() => {
        setRequests(MOCK_REQUESTS);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error fetching requests:", err);
      toast.error("Failed to load client requests");
      setLoading(false);
    }
  };

  const handleApprove = (req) => {
    setRequests((prev) =>
      prev.map((r) => (r._id === req._id ? { ...r, status: "approved" } : r)),
    );
    if (selectedRequest?._id === req._id)
      setSelectedRequest({ ...req, status: "approved" });
    toast.success(`${req.name} has been approved`);
  };

  const handleReject = (req) => {
    setRequests((prev) =>
      prev.map((r) => (r._id === req._id ? { ...r, status: "rejected" } : r)),
    );
    if (selectedRequest?._id === req._id)
      setSelectedRequest({ ...req, status: "rejected" });
    toast.error(`${req.name}'s request has been rejected`);
  };

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / requestsPerPage);
  const startIndex = (currentPage - 1) * requestsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + requestsPerPage);

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <Clock className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">
              Client Requests
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Review and manage incoming client registration requests
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total requests</p>
            <p className="text-2xl font-bold text-gray-900">{counts.all}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-amber-500">
              {counts.pending}
            </p>
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

        {/* Search + Filter */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company, email, industry or contact..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {["all", "pending", "approved", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setFilterStatus(s);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filterStatus === s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s}
                <span
                  className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    filterStatus === s
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {counts[s]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Table */}
          <div
            className={`flex-1 min-w-0 ${selectedRequest ? "hidden lg:block" : ""}`}
          >
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Industry
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Requested
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.map((req, i) => (
                      <tr
                        key={req._id}
                        onClick={() => setSelectedRequest(req)}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                          selectedRequest?._id === req._id ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={req.name} index={i} />
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {req.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {req.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            {req.industry}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {req.size}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{req.contact}</p>
                          <p className="text-xs text-gray-400">
                            {req.contactRole}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {req.requestedAt}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[req.status]}`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className="flex items-center justify-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {req.status === "pending" ? (
                              <>
                                <button
                                  onClick={() => handleApprove(req)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(req)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Reject
                                </button>
                              </>
                            ) : (
                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setShowMenu(
                                      showMenu === req._id ? null : req._id,
                                    )
                                  }
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                  <MoreVertical className="w-4 h-4 text-gray-500" />
                                </button>
                                {showMenu === req._id && (
                                  <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                    {req.status === "rejected" && (
                                      <button
                                        onClick={() => {
                                          handleApprove(req);
                                          setShowMenu(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                      >
                                        <CheckCircle className="w-4 h-4" />{" "}
                                        Approve
                                      </button>
                                    )}
                                    {req.status === "approved" && (
                                      <button
                                        onClick={() => {
                                          handleReject(req);
                                          setShowMenu(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                      >
                                        <XCircle className="w-4 h-4" /> Reject
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        setSelectedRequest(req);
                                        setShowMenu(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <Eye className="w-4 h-4" /> View details
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty state */}
              {filtered.length === 0 && (
                <div className="text-center py-14">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    No requests found
                  </h3>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search or filter
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-200">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          {selectedRequest && (
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-6">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Request details
                  </h2>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Company identity */}
                  <div className="flex items-center gap-3">
                    <Avatar name={selectedRequest.name} index={0} size="lg" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedRequest.name}
                      </p>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[selectedRequest.status]}`}
                      >
                        {selectedRequest.status}
                      </span>
                    </div>
                  </div>

                  {/* Info rows */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Email</p>
                        <p className="text-sm text-gray-700">
                          {selectedRequest.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                        <p className="text-sm text-gray-700">
                          {selectedRequest.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Industry</p>
                        <p className="text-sm text-gray-700">
                          {selectedRequest.industry}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">
                          Company size
                        </p>
                        <p className="text-sm text-gray-700">
                          {selectedRequest.size} employees
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Location</p>
                        <p className="text-sm text-gray-700">
                          {selectedRequest.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">
                          Requested on
                        </p>
                        <p className="text-sm text-gray-700">
                          {selectedRequest.requestedAt}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact person */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">
                      Contact person
                    </p>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedRequest.contact}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedRequest.contactRole}
                    </p>
                  </div>

                  {/* Message */}
                  {selectedRequest.message && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">
                        Message
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3 italic">
                        "{selectedRequest.message}"
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {selectedRequest.status === "pending" && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleApprove(selectedRequest)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(selectedRequest)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                  {selectedRequest.status === "approved" && (
                    <button
                      onClick={() => handleReject(selectedRequest)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Revoke approval
                    </button>
                  )}
                  {selectedRequest.status === "rejected" && (
                    <button
                      onClick={() => handleApprove(selectedRequest)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve anyway
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientRequests;
