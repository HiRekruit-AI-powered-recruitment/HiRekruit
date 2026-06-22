import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Outlet,
} from "react-router-dom";

// Helper components
import Loader from "./components/Helper/Loader";
import ProtectedRoute from "./components/Helper/ProtectedRoute";

// Interview pages
import InterviewLayout from "./pages/InterviewPages/InterviewLayout";
import InterviewPage from "./pages/InterviewPages/InterviewPage";
import InterviewStartRoute from "./pages/InterviewPages/InterviewStartRoute";
import InterviewCompletionPage from "./pages/InterviewPages/InterviewCompletionPage";
import HRJoinInterviewPage from "./pages/InterviewPages/HRJoinInterviewPage";

// navbar pages
import About from "./components/Navbar/About";
import Services from "./components/Navbar/Services";
import Clients from "./components/Navbar/Clients";
import Contact from "./components/Navbar/Contact";
import SignIn from "./components/Navbar/SignIn";
import SignUp from "./components/Navbar/SignUp";

//home pages
import LayoutWithNavbar from "./components/Home/LayoutWithNavbar";
import Home from "./components/Home/Home";
import Chatbot from "./components/Home/Chatbot";

// footer pages
import Documentation from "./components/Footer/Documentation";
import PrivacyPolicy from "./components/Footer/PrivacyPolicy";
import CookiePolicy from "./components/Footer/CookiePolicy";
import AccessibilityPage from "./components/Footer/Accessibility";
import HelpCenter from "./components/Footer/HelpCenter";
import TermsOfService from "./components/Footer/TermsOfService";

// Google Tag Manager
import useGTMPageView from "./components/GoogleTagManager/useGTMPageView";


// Hr dashboard pages
import Process from "./components/HRDashboard/Process";
import SelectedCandidates from "./components/HRDashboard/SelectedCandidates";
import Calendar from "./components/HRDashboard/Calender";
import ForgotPassword from "./components/Navbar/ForgotPassword";
import VerifyEmail from "./components/Navbar/VerifyEmail";
import Profile from "./components/HRDashboard/Profile";
import CandidateDetails from "./components/HRDashboard/CandidateDetails";
import DashboardHome from "./components/HRDashboard/DashboardHome";
import Notifications from "./components/HRDashboard/Notifications";
import Settings from "./components/Navbar/Settings";
import { NotificationProvider } from "./Context/NotificationContext";
import Dashboard from "./components/HRDashboard/Dashboard";
import Layout from "./components/HRDashboard/Layout";
import ResumeLibrary from "./components/HRDashboard/ResumeLibrary";
import Shortlisted from "./components/HRDashboard/Shortlisted";
import Analytics from "./components/HRDashboard/Analytics";
import JobCreation from "./components/HRDashboard/JobCreation";
import Drives from "./components/HRDashboard/Drives";


// assessment pages
import Assessment from "./components/CodingAssessment/Assessment";
import Instructions from "./components/CodingAssessment/Instructions";
import AssessmentSubmission from "./components/CodingAssessment/AssessmentSubmission";

// admin pages
import AdminCompanies from "./components/AdminDashboard/AdminCompanies";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import AdminLayout from "./components/AdminDashboard/AdminLayout";

import Overview from "./components/AdminDashboard/Overview";
import ClientRequests from "./components/AdminDashboard/ClientRequests";
import Currentclients from "./components/AdminDashboard/Currentclients";
import AdminFeedback from "./components/AdminDashboard/AdminFeedback";


// resources pages
import API from "./components/Footer/API";

// Analytical Dashboard Page
import AnalyticsDashboard from "./components/AnalyticalPage/AnalyticsDashboard";

// All Candidates Page
import TotalCandidates from "./components/TotalCandidates/TotalCandidates";


function AppContent() {
  const location = useLocation();

  // Routes where Chatbot should be hidden
  const hideChatbotRoutes = [
    "/mockinterview",
    "/start-interview",
    "/interview-completion",
    "/panel",
    "/assessment",
    "/start-assessment",
    "/assessment-submission",
  ];

  // Check if current route starts with any of the hidden paths
  const showChatbot = !hideChatbotRoutes.some((path) =>
    location.pathname.startsWith(path),
  );

  useGTMPageView();

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route element={<LayoutWithNavbar />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/accessibility" element={<AccessibilityPage />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/api" element={<API />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Route>

        {/* <Route path="/signup" element={<CustomSignUp />} /> */}
        {/* <Route path="/signin" element={<CustomSignIn />} /> */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected Routes */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard landing page */}
          <Route index element={<DashboardHome />} />

          {/* Dashboard pages */}
          <Route path="drive-creation" element={<JobCreation />} />
          <Route path="drives/edit/:driveId" element={<JobCreation />} />
          <Route path="drives" element={<Drives />} />
          <Route path="process/:driveId" element={<Process />} />
          <Route path="resumes" element={<ResumeLibrary />} />
          <Route path="shortlisted" element={<Shortlisted />} />
          <Route path="candidate/:candidateId" element={<CandidateDetails />} />
          <Route path="selected-candidates" element={<SelectedCandidates />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="creating-drive/:drive_id" element={<Dashboard />} />
          {/* Single drive dashboard */}
          {/* <Route path=":drive_id" element={<Dashboard />} /> */}
        </Route>

        {/* Interview Routes */}
        <Route element={<InterviewLayout />}>
          <Route
            path="/mockinterview/:driveCandidateId"
            element={<InterviewPage />}
          />
          <Route
            path="/start-interview/:driveCandidateId/:typeOfInterview"
            element={<InterviewStartRoute />}
          />
          <Route
            path="/interview-completion"
            element={<InterviewCompletionPage />}
          />

          <Route
            path="/panel/:driveCandidateId/:interviewType"
            element={<HRJoinInterviewPage />}
          />
        </Route>

        {/* Assessment Routes */}
        <Route
          path="/assessment/:driveId/:candidateId"
          element={<Assessment />}
        />

        <Route path="/assessment/:driveId" element={<Assessment />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/start-assessment" element={<Instructions />} />
        <Route
          path="/assessment-submission"
          element={<AssessmentSubmission />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <Outlet />
            </AdminLayout>
          }
        >

          {/* Analytical Dashbopard Page Routes  */}
          <Route
            path="analytics-dashboard"
            element={<AnalyticsDashboard />}
          />

          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="candidates" element={<TotalCandidates />} />
          <Route path="overview" element={<Overview />} />
          <Route path="clientrequests" element={<ClientRequests />} />
          <Route path="currentclients" element={<Currentclients />} />
          <Route path="feedback" element={<AdminFeedback />} />
        </Route>
      </Routes>

      {showChatbot && <Chatbot />}
    </>
  );
}

function App() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <NotificationProvider>
        {showLoader ? <Loader /> : <AppContent />}
      </NotificationProvider>
    </Router>
  );
}

export default App;
