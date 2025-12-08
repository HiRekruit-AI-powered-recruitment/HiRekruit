import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Outlet,
} from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

import Dashboard from "./components/Dashboard";
import InterviewPage from "./pages/InterviewPage";
import Layout from "./components/Layout";
import ResumeLibrary from "./pages/ResumeLibrary";
import Shortlisted from "./pages/Shortlisted";
import Analytics from "./pages/Analytics";
import Home from "./pages/Home";
import JobCreation from "./components/JobCreation";
import Drives from "./components/Drives";
import VapiInterviewPage from "./pages/VapiInterviewPage";
import InterviewStartPage from "./pages/InterviewStartPage";
import InterviewCompletionPage from "./pages/InterviewCompletionPage";
import About from "./pages/About";
import Services from "./pages/Services";
import Clients from "./pages/Clients";
import Contact from "./pages/Contact";
import LayoutWithNavbar from "./pages/LayoutWithNavbar";
import Chatbot from "./components/Chatbot";
import Process from "./pages/Process";
import CustomSignUp from "./pages/CustomSignUp";
import CustomSignIn from "./pages/CustomSignIn";
import { UserProfile } from "@clerk/clerk-react";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Calendar from "./components/Calender";
import ProtectedRoute from "./components/ProtectedRoute";
import useGTMPageView from "./pages/useGTMPageView";
import Loader from "./components/Loader";

import Assessment from "./pages/Assessment";
import Instructions from "./pages/Instructions";
import AssessmentSubmission from "./components/CodingAssessment/AssessmentSubmission";

// admin pages
import AdminCompanies from "./components/AdminDashboard/AdminCompanies";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import AdminLayout from "./components/AdminDashboard/AdminLayout";

function AppContent() {
  const location = useLocation();

  // Routes where Chatbot should be hidden
  const hideChatbotRoutes = [
    "/mockinterview",
    "/start-interview",
    "/interview-completion",
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
        </Route>

        <Route path="/signup" element={<CustomSignUp />} />
        <Route path="/signin" element={<CustomSignIn />} />

        {/* Protected Routes */}
        <Route
          path="/drive-creation"
          element={
            <ProtectedRoute>
              <Layout>
                <JobCreation />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/process/:driveId"
          element={
            <ProtectedRoute>
              <Layout>
                <Process />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/:drive_id"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/drives"
          element={
            <ProtectedRoute>
              <Layout>
                <Drives />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/resumes"
          element={
            <ProtectedRoute>
              <Layout>
                <ResumeLibrary />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/shortlisted"
          element={
            <ProtectedRoute>
              <Layout>
                <Shortlisted />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calender"
          element={
            <ProtectedRoute>
              <Layout>
                <Calendar />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Interview Routes */}
        <Route path="/mockinterview/:driveId" element={<InterviewPage />} />
        <Route path="/mockinterview/test" element={<VapiInterviewPage />} />
        <Route
          path="/start-interview/:driveId"
          element={<InterviewStartPage />}
        />
        <Route
          path="/interview-completion"
          element={<InterviewCompletionPage />}
        />

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
