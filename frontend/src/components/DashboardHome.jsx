import {
  PlusCircle,
  Briefcase,
  FileText,
  Users,
  BarChart3,
  CalendarDays,
} from "lucide-react";
import { Link } from "react-router-dom";

const dashboardItems = [
  {
    title: "Create Drive",
    description:
      "Create a new hiring drive and configure job roles, rounds, and assessments.",
    icon: <PlusCircle size={28} />,
    link: "/dashboard/drive-creation",
  },
  {
    title: "Drives",
    description: "View and manage all your ongoing and past hiring drives.",
    icon: <Briefcase size={28} />,
    link: "/dashboard/drives",
  },
  {
    title: "All Applicants",
    description: "Access and manage uploaded candidate resumes.",
    icon: <FileText size={28} />,
    link: "/dashboard/resumes",
  },
  {
    title: "Shortlisted",
    description:
      "Review candidates shortlisted after assessments and interviews.",
    icon: <Users size={28} />,
    link: "/dashboard/shortlisted",
  },
  {
    title: "Analytics",
    description:
      "Analyze hiring performance, candidate progress, and drive metrics.",
    icon: <BarChart3 size={28} />,
    link: "/dashboard/analytics",
  },
  {
    title: "Calendar",
    description: "Schedule interviews, assessments, and track important dates.",
    icon: <CalendarDays size={28} />,
    link: "/dashboard/calendar",
  },
];

const DashboardHome = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-6xl w-full text-center">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to HiRekruit Dashboard
        </h1>
        <p className="text-gray-600 mb-10">
          Manage your hiring drives, candidates, and analytics from one place.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="group bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-full bg-gray-100 group-hover:bg-black group-hover:text-white transition">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
