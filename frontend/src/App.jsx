import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Outlet,
} from "react-router-dom";

import Dashboard from "./components/Dashboard";
import Layout from "./components/Layout";
import ResumeLibrary from "./pages/ResumeLibrary";
import Shortlisted from "./pages/Shortlisted";
import Analytics from "./pages/Analytics";
import Home from "./pages/Home";
import JobCreation from "./components/JobCreation";
import Drives from "./components/Drives";
// Interview pages
import InterviewLayout from "./pages/InterviewPages/InterviewLayout";
import InterviewPage from "./pages/InterviewPages/InterviewPage";
import InterviewStartPage from "./pages/InterviewPages/InterviewStartPage";
import InterviewCompletionPage from "./pages/InterviewPages/InterviewCompletionPage";
import HRJoinInterviewPage from "./pages/InterviewPages/HRJoinInterviewPage";

import About from "./pages/About";
import Services from "./pages/Services";
import Clients from "./pages/Clients";
import Contact from "./pages/Contact";
import LayoutWithNavbar from "./pages/LayoutWithNavbar";
import Chatbot from "./components/Chatbot";
import Process from "./pages/Process";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Calendar from "./components/Calender";
import ProtectedRoute from "./components/ProtectedRoute";
import useGTMPageView from "./pages/useGTMPageView";
import Loader from "./components/Loader";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/Profile";
import CandidateDetails from "./pages/CandidateDetails";
import DashboardHome from "./components/DashboardHome";
import AccessibilityPage from "./components/Footer/Accessibility";
import CookiePolicy from "./components/Footer/CookiePolicy";

// assessment pages
import Assessment from "./pages/Assessment";
import Instructions from "./pages/Instructions";
import AssessmentSubmission from "./components/CodingAssessment/AssessmentSubmission";

// admin pages
import AdminCompanies from "./components/AdminDashboard/AdminCompanies";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import AdminLayout from "./components/AdminDashboard/AdminLayout";

import SelectedCandidates from "./pages/SelectedCandidates";

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
    location.pathname.startsWith(path)
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
            element={<InterviewStartPage />}
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
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="companies" element={<AdminCompanies />} />
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

  return <Router>{showLoader ? <Loader /> : <AppContent />}</Router>;
}

export default App;
