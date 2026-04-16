import React, { useState, useEffect } from "react";
import {
  Building2,
  Search,
  Users,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
  Star,
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

const MOCK_CLIENTS = [
  {
    _id: "1",
    name: "Tech Corp",
    email: "hr@techcorp.com",
    phone: "+1 (415) 123-4567",
    industry: "Technology",
    plan: "Enterprise",
    size: "500–1000",
    location: "San Francisco, CA",
    activeDrives: 8,
    totalDrives: 24,
    hrUsers: 12,
    totalCandidates: 1340,
    joined: "Jan 15, 2025",
    status: "active",
    contactName: "Sarah Mitchell",
    contactRole: "HR Director",
  },
  {
    _id: "2",
    name: "StartupXYZ",
    email: "contact@startupxyz.com",
    phone: "+1 (212) 987-6543",
    industry: "FinTech",
    plan: "Growth",
    size: "50–100",
    location: "New York, NY",
    activeDrives: 3,
    totalDrives: 9,
    hrUsers: 4,
    totalCandidates: 287,
    joined: "Feb 20, 2025",
    status: "active",
    contactName: "Rahul Sharma",
    contactRole: "Talent Lead",
  },
  {
    _id: "3",
    name: "Global Solutions",
    email: "hr@globalsolutions.com",
    phone: "+44 20 7946 0912",
    industry: "Consulting",
    plan: "Enterprise",
    size: "1000+",
    location: "London, UK",
    activeDrives: 14,
    totalDrives: 52,
    hrUsers: 18,
    totalCandidates: 4210,
    joined: "Nov 10, 2023",
    status: "active",
    contactName: "Emily Clarke",
    contactRole: "VP People",
  },
  {
    _id: "4",
    name: "EduLearn",
    email: "people@edulearn.org",
    phone: "+1 (312) 456-7890",
    industry: "EdTech",
    plan: "Starter",
    size: "10–50",
    location: "Chicago, IL",
    activeDrives: 2,
    totalDrives: 5,
    hrUsers: 3,
    totalCandidates: 98,
    joined: "Mar 5, 2025",
    status: "trial",
    contactName: "Nina Patel",
    contactRole: "Operations Manager",
  },
  {
    _id: "5",
    name: "Nexus Logistics",
    email: "recruit@nexuslog.com",
    phone: "+1 (713) 321-0987",
    industry: "Logistics",
    plan: "Enterprise",
    size: "500–1000",
    location: "Houston, TX",
    activeDrives: 11,
    totalDrives: 38,
    hrUsers: 14,
    totalCandidates: 2870,
    joined: "Jun 1, 2023",
    status: "active",
    contactName: "Carlos Mendez",
    contactRole: "Head of Recruitment",
  },
];

const PLAN_STYLES = {
  Enterprise: "bg-blue-100 text-blue-700",
  Growth: "bg-teal-100 text-teal-700",
  Starter: "bg-gray-100 text-gray-600",
};

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  trial: "bg-amber-100 text-amber-700",
  inactive: "bg-red-100 text-red-600",
};

const CurrentClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showMenu, setShowMenu] = useState(null);

  const clientsPerPage = 10;

  useEffect(() => {
    fetchClients();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handle = () => setShowMenu(null);
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, []);

  const fetchClients = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch(`${BASE_URL}/api/admin/clients`);
      // const data = await response.json();
      // setClients(data.clients);

      setTimeout(() => {
        setClients(MOCK_CLIENTS);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error fetching clients:", err);
      toast.error("Failed to load clients");
      setLoading(false);
    }
  };

  const handleDelete = (client) => {
    if (window.confirm(`Are you sure you want to remove ${client.name}?`)) {
      setClients((prev) => prev.filter((c) => c._id !== client._id));
      if (selectedClient?._id === client._id) setSelectedClient(null);
      toast.success(`${client.name} has been removed`);
    }
  };

  const handleEdit = (client) => {
    toast.info(`Edit functionality for ${client.name} — coming soon`);
  };

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPlan = filterPlan === "all" || c.plan === filterPlan;
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / clientsPerPage);
  const startIndex = (currentPage - 1) * clientsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + clientsPerPage);

  const totalDrives = clients.reduce((s, c) => s + c.activeDrives, 0);
  const totalHR = clients.reduce((s, c) => s + c.hrUsers, 0);
  const totalCandidates = clients.reduce((s, c) => s + c.totalCandidates, 0);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <Building2 className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">
              Current Clients
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            View and manage all active client accounts
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total clients</p>
            <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Active drives</p>
            <p className="text-2xl font-bold text-blue-600">{totalDrives}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total HR users</p>
            <p className="text-2xl font-bold text-green-600">{totalHR}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total candidates</p>
            <p className="text-2xl font-bold text-purple-600">
              {totalCandidates.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, industry or location..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <select
            value={filterPlan}
            onChange={(e) => {
              setFilterPlan(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">All plans</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Growth">Growth</option>
            <option value="Starter">Starter</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex gap-6">
          {/* Table */}
          <div
            className={`flex-1 min-w-0 ${selectedClient ? "hidden lg:block" : ""}`}
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
                        Plan
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Active drives
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        HR users
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Candidates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Joined
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
                    {paginated.map((client, i) => (
                      <tr
                        key={client._id}
                        onClick={() => setSelectedClient(client)}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                          selectedClient?._id === client._id ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={client.name} index={i} />
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {client.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {client.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {client.industry}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${PLAN_STYLES[client.plan]}`}
                          >
                            {client.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            <Briefcase className="w-3 h-3" />
                            {client.activeDrives}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <Users className="w-3 h-3" />
                            {client.hrUsers}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-medium text-gray-700">
                          {client.totalCandidates.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {client.joined}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[client.status]}`}
                          >
                            {client.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div
                            className="relative inline-block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() =>
                                setShowMenu(
                                  showMenu === client._id ? null : client._id,
                                )
                              }
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>
                            {showMenu === client._id && (
                              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <button
                                  onClick={() => {
                                    setSelectedClient(client);
                                    setShowMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Eye className="w-4 h-4" />
                                  View details
                                </button>
                                <button
                                  onClick={() => {
                                    handleEdit(client);
                                    setShowMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    handleDelete(client);
                                    setShowMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove
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

              {/* Empty state */}
              {filtered.length === 0 && (
                <div className="text-center py-14">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    No clients found
                  </h3>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search or filters
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
          {selectedClient && (
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-6">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Client details
                  </h2>
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Identity */}
                  <div className="flex items-center gap-3">
                    <Avatar name={selectedClient.name} index={0} size="lg" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedClient.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${PLAN_STYLES[selectedClient.plan]}`}
                        >
                          {selectedClient.plan}
                        </span>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[selectedClient.status]}`}
                        >
                          {selectedClient.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-blue-700">
                        {selectedClient.activeDrives}
                      </p>
                      <p className="text-xs text-blue-500 mt-0.5">Active</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-green-700">
                        {selectedClient.hrUsers}
                      </p>
                      <p className="text-xs text-green-500 mt-0.5">HR users</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-purple-700">
                        {selectedClient.totalCandidates >= 1000
                          ? `${(selectedClient.totalCandidates / 1000).toFixed(1)}k`
                          : selectedClient.totalCandidates}
                      </p>
                      <p className="text-xs text-purple-500 mt-0.5">
                        Candidates
                      </p>
                    </div>
                  </div>

                  {/* Info rows */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Email</p>
                        <p className="text-sm text-gray-700">
                          {selectedClient.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                        <p className="text-sm text-gray-700">
                          {selectedClient.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Industry</p>
                        <p className="text-sm text-gray-700">
                          {selectedClient.industry}
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
                          {selectedClient.size} employees
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Location</p>
                        <p className="text-sm text-gray-700">
                          {selectedClient.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">
                          Total drives (all time)
                        </p>
                        <p className="text-sm text-gray-700">
                          {selectedClient.totalDrives}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">
                          Member since
                        </p>
                        <p className="text-sm text-gray-700">
                          {selectedClient.joined}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact person */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">
                      Primary contact
                    </p>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedClient.contactName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedClient.contactRole}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleEdit(selectedClient)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(selectedClient)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentClients;
