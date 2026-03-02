import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/HiRekruit.png";
import TagManager from "react-gtm-module";
import {
  Menu,
  X,
  Play,
  CheckCircle,
  Clock,
  CreditCard,
  BarChart3,
  Users,
  Target,
  Calendar,
  FileText,
  TrendingUp,
  Star,
  Code,
  Database,
  Zap,
  Upload,
  Filter,
  Shield,
} from "lucide-react";
import Testimonials from "../components/Testimonials";
import ClientLogos from "../components/ClientLogos";

const Home = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const [typewriterText, setTypewriterText] = useState("");
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [showDemoPopup, setShowDemoPopup] = useState(false);

  const typewriterWords = [
    "AI-Powered Recruiting",
    "Smart Candidate Screening",
    "Automated Interviews",
    "Data-Driven Hiring",
  ];

  const currentWord =
    typewriterWords[Math.floor(typewriterIndex / 50) % typewriterWords.length];

  const stats = [
    { value: "95%", label: "Faster Screening", color: "text-black" },
    { value: "5K+", label: "Candidates Processed", color: "text-gray-800" },
    { value: "95%", label: "Accuracy Rate", color: "text-gray-900" },
  ];

  const features = [
    {
      icon: FileText,
      title: "Resume Intelligence",
      description:
        "Automatically extract key candidate details from their resumes with high accuracy",
      benefits: [
        "Instant data extraction",
        "Structured candidate profiles",
        "Error-free parsing",
      ],
    },
    {
      icon: Upload,
      title: "Bulk Uploads",
      description:
        "Upload entire folders of resumes in a few clicks without worrying about structure",
      benefits: [
        "Mass resume processing",
        "Drag-and-drop interface",
        "Time-saving automation",
      ],
    },
    {
      icon: Filter,
      title: "Dynamic Filtering",
      description:
        "Easily filter candidates by skills, experience, and roles with intelligent matching algorithms",
      benefits: [
        "Advanced search filters",
        "Skill-based matching",
        "Experience weighting",
        "Role compatibility",
      ],
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description:
        "Visualize hiring trends, progress, and candidate data with comprehensive reporting tools",
      benefits: [
        "Real-time insights",
        "Hiring funnel tracking",
        "Performance metrics",
        "Custom reports",
      ],
    },
    {
      icon: Shield,
      title: "Data Privacy",
      description:
        "Process resumes locally without exposing sensitive candidate information to external servers",
      benefits: ["Local processing", "GDPR compliant", "Privacy protection"],
    },
    {
      icon: Users,
      title: "Collaborative Workflows",
      description:
        "Seamlessly integrate with existing HR tools and workflows for team collaboration",
      benefits: [
        "Team collaboration",
        "Workflow automation",
        "Multi-user access",
      ],
    },
  ];

  const handleGetStartedClick = () => {
    // Push event to GTM dataLayer
    TagManager.dataLayer({
      dataLayer: {
        event: "get_started_click",
        category: "Navigation",
        action: "click",
        label: "Get Started Button",
      },
    });

    // Navigate to the Job Creation page
    navigate("/dashboard");
  };
  // Typewriter effect
  useEffect(() => {
    const interval = setInterval(() => {
      const wordIndex =
        Math.floor(typewriterIndex / 50) % typewriterWords.length;
      const charIndex = typewriterIndex % 50;
      const word = typewriterWords[wordIndex];

      if (charIndex < word.length) {
        setTypewriterText(word.substring(0, charIndex + 1));
      } else if (charIndex < word.length + 20) {
        setTypewriterText(word);
      } else {
        setTypewriterText("");
      }

      setTypewriterIndex((prev) => prev + 1);
    }, 100);

    return () => clearInterval(interval);
  }, [typewriterIndex]);

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Floating elements data
  const floatingElements = [
    { icon: Code, delay: 0, x: 10, y: 20 },
    { icon: Database, delay: 1000, x: 80, y: 10 },
    { icon: Zap, delay: 2000, x: 15, y: 70 },
    { icon: Users, delay: 1500, x: 85, y: 60 },
    { icon: Target, delay: 500, x: 50, y: 15 },
    { icon: BarChart3, delay: 2500, x: 70, y: 80 },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @keyframes scroll-right {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }

        .animate-scroll-right {
          animation: scroll-right 45s linear infinite;
        }
      `}</style>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white via-gray-100 to-gray-200 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating Icons */}
          {floatingElements.map((element, index) => {
            const IconComponent = element.icon;
            return (
              <div
                key={index}
                className="absolute animate-bounce opacity-10"
                style={{
                  left: `${element.x}%`,
                  top: `${element.y}%`,
                  animationDelay: `${element.delay}ms`,
                  animationDuration: "3s",
                }}
              >
                <IconComponent size={24} className="text-black" />
              </div>
            );
          })}

          {/* Animated Gradient Orbs */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-gray-400/20 to-gray-600/20 rounded-full animate-pulse"></div>
          <div
            className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-gray-500/20 to-black/20 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-r from-gray-300/20 to-gray-500/20 rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>

          {/* Moving Background Lines */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-400/30 to-transparent animate-pulse"></div>
            <div
              className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-500/30 to-transparent animate-pulse"
              style={{ animationDelay: "1.5s" }}
            ></div>
            <div
              className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-600/30 to-transparent animate-pulse"
              style={{ animationDelay: "3s" }}
            ></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Typewriter Badge */}
              <div className="inline-flex items-center space-x-2 bg-gray-200 text-gray-800 px-3 py-2 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                <span className="min-w-44">
                  {typewriterText}
                  <span
                    className={`${showCursor ? "opacity-100" : "opacity-0"
                      } transition-opacity`}
                  >
                    |
                  </span>
                </span>
              </div>

              {/* Main Heading */}
              <div className="space-y-3">
                <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                  Transform Your{" "}
                  <span className="bg-gradient-to-r from-black via-gray-700 to-gray-900 bg-clip-text text-transparent">
                    Hiring Process
                  </span>{" "}
                  with AI
                </h1>
              </div>

              {/* Description */}
              <p className="text-base text-gray-600 leading-relaxed max-w-2xl">
                Streamline recruitment with our intelligent dashboard. Automate
                candidate screening, schedule interviews, and make data-driven
                hiring decisions faster than ever before.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 py-6">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="text-center transform hover:scale-105 transition-transform duration-300"
                  >
                    <div
                      className={`text-xl lg:text-2xl font-bold ${stat.color} mb-1`}
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGetStartedClick}
                  className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm transform hover:scale-105 duration-200"
                >
                  <span>Start Your Drive Now</span>
                </button>
                <button
                  onClick={() => setShowDemoPopup(true)}
                  className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-gray-600 hover:text-black transition-colors flex items-center justify-center space-x-2 text-sm transform hover:scale-105 duration-200"
                >
                  <Play size={16} />
                  <span>Watch Demo</span>
                </button>

                {showDemoPopup && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-80 text-center shadow-lg">
                      <h2 className="text-lg font-semibold mb-2">
                        Coming Soon 🎬
                      </h2>
                      <p className="text-gray-600 text-sm mb-4">
                        Demo video will be available shortly.
                      </p>
                      <button
                        onClick={() => setShowDemoPopup(false)}
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 ">
                <p className="text-base text-gray-400 mb-8 italic">
                  Upload resumes, define the role — and let AI handle the rest.
                </p>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative">
              {/* Main Dashboard */}
              <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
                {/* Browser Bar */}
                <div className="bg-gray-100 px-3 py-2 flex items-center space-x-2 border-b">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="flex-1 bg-white rounded px-2 py-1 text-xs text-gray-500 mx-3">
                    hirekruit.com
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Recruitment Dashboard
                      </h3>
                      <p className="text-xs text-gray-600">Today's Overview</p>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-md flex items-center justify-center">
                        <BarChart3 size={12} className="text-black" />
                      </div>
                      <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center">
                        <Users size={12} className="text-gray-600" />
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">
                          Active Jobs
                        </span>
                        <Target size={12} className="text-black" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">24</div>
                      <div className="text-xs text-gray-700 flex items-center">
                        <TrendingUp size={8} className="mr-1" />
                        +12% from last week
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">
                          Interviews
                        </span>
                        <Calendar size={12} className="text-gray-800" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">142</div>
                      <div className="text-xs text-gray-700 flex items-center">
                        <TrendingUp size={8} className="mr-1" />
                        +8% from last week
                      </div>
                    </div>
                  </div>

                  {/* Chart Area */}
                  <div className="bg-white rounded-lg p-3 mb-4 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-900 text-sm">
                        Hiring Pipeline
                      </span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                        <div
                          className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"
                          style={{ animationDelay: "0.5s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-800 rounded-full animate-pulse"
                          style={{ animationDelay: "1s" }}
                        ></div>
                      </div>
                    </div>
                    <div className="h-16 bg-gradient-to-r from-gray-400 via-gray-600 to-black rounded-md opacity-70 animate-pulse"></div>
                  </div>

                  {/* Recent Candidates */}
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-900 text-sm">
                        Recent Candidates
                      </span>
                      <FileText size={12} className="text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      {[
                        {
                          name: "Rahul Kumar",
                          role: "Frontend Dev",
                          avatar: "👩‍💻",
                        },
                        {
                          name: "Karthik Vijay",
                          role: "Backend Dev",
                          avatar: "👨‍🔬",
                        },
                        {
                          name: "Udit Jain",
                          role: "Backend Dev",
                          avatar: "👩‍🎨",
                        },
                        {
                          name: "Piyush Patel",
                          role: "UI Designer",
                          avatar: "👩‍💻",
                        },
                      ].map((candidate, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded transition-colors"
                        >
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                            {candidate.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-gray-900">
                              {candidate.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {candidate.role}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={8}
                                className="text-gray-400 fill-current"
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-3 -right-3 w-16 h-16 bg-gray-400 rounded-full opacity-20 animate-bounce"></div>
              <div
                className="absolute -bottom-4 -left-4 w-12 h-12 bg-black rounded-full opacity-20 animate-bounce"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute top-1/2 -right-6 w-8 h-8 bg-gray-600 rounded-full opacity-20 animate-bounce"
                style={{ animationDelay: "2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Problem & Solution */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Problem & Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Traditional hiring is broken. We've rebuilt it from the ground up.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Problem Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gray-900 rounded-3xl blur-xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
              <div
                className="relative bg-gradient-to-r from-white to-gray-300
 p-8 md:p-12 rounded-3xl border-2 border-gray-300 shadow-lg hover:shadow-2xl transition-all duration-500 hover:border-gray-400"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-gray-900 p-4 rounded-2xl shadow-lg">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
                    The Problem
                  </h3>
                </div>

                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  The typical hiring process is plagued by manual
                  inefficiencies, causing delays, burnout, and missed
                  opportunities.
                </p>

                <div className="space-y-5">
                  {[
                    "Manual screening of hundreds of resumes wastes countless hours",
                    "Communication delays create friction in shortlisting and scheduling",
                    "Inconsistent interview standards lead to unfair candidate evaluation",
                    "Fragmented pipeline management causes bottlenecks and lost talent",
                  ].map((problem, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300 group/item border border-gray-200"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <svg
                          className="w-6 h-6 text-gray-900 group-hover/item:scale-110 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-800 leading-relaxed font-medium">
                        {problem}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Solution Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gray-900 rounded-3xl blur-xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-to-r from-black to-gray-800 p-8 md:p-12 rounded-3xl border-2 border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-white p-4 rounded-2xl shadow-lg">
                    <svg
                      className="w-8 h-8 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white">
                    Our Solution
                  </h3>
                </div>

                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  <span className="font-bold text-white">HiRekruit</span> is an
                  AI-powered recruitment platform that automates your entire
                  hiring pipeline with a single click.
                </p>
                {/* <p className="text-base text-gray-400 mb-8 italic">
                  Upload resumes, define the role — and let AI handle the rest.
                </p> */}

                <div className="space-y-5">
                  {[
                    "One-click launch analyzes all resumes against role requirements instantly",
                    "Smart automation handles shortlisting, emails, and scheduling seamlessly",
                    "AI-agent interviews ensure consistent, unbiased candidate evaluation",
                    "End-to-end automation delivers results with zero manual intervention",
                  ].map((solution, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-xl bg-gray-800 hover:bg-gray-750 transition-colors duration-300 group/item border border-gray-700"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <svg
                          className="w-6 h-6 text-white group-hover/item:scale-110 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-200 leading-relaxed font-medium">
                        {solution}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From resume upload to final decision — fully automated in 4 simple
              steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gray-900 rounded-3xl blur-xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
              <div
                // Ensuring all feature cards have equal height for consistent UI
                className="relative bg-gradient-to-r from-gray-200 to-white h-full p-8 rounded-3xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-500 hover:shadow-xl text-center"
              >
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Upload & Define
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Bulk upload resumes and define the role requirements, skills,
                  and job description in one click.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gray-900 rounded-3xl blur-xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
              <div
                className="relative bg-gradient-to-r from-gray-200 to-white
 p-8 rounded-3xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-500 hover:shadow-xl text-center"
              >
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  AI Screening
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  AI instantly screens all resumes, ranks candidates, and sends
                  personalized shortlist/rejection emails automatically.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gray-900 rounded-3xl blur-xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
              <div
                className="relative bg-gradient-to-r from-gray-200 to-white
 p-8 rounded-3xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-500 hover:shadow-xl text-center"
              >
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  AI Agent Interviews
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Shortlisted candidates are automatically interviewed by AI
                  agents with consistent, unbiased evaluation.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gray-900 rounded-3xl blur-xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
              <div
                className="relative bg-gradient-to-r from-gray-200 to-white
 p-8 rounded-3xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-500 hover:shadow-xl text-center"
              >
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">4</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Results & Closing
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Get detailed analytics, final candidate rankings, and
                  automated closing emails — all delivered seamlessly.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 italic text-lg">
              Complete automation from start to finish — with just a few clicks
            </p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Key Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to revolutionize your recruitment process
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gray-900 rounded-3xl blur-xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
                <div
                  className="relative bg-gradient-to-r from-gray-200 to-white
 p-8 rounded-3xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-500 hover:shadow-xl"
                >
                  <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="space-y-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div
                        key={benefitIndex}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Clients*/}
      {/* <ClientLogos /> */}

      {/* Testimonials Section */}
      <div className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join hundreds of companies transforming their hiring process
            </p>
          </div>
          <div>
            <Testimonials />
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about HiRekruit
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 p-8 rounded-2xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                How quickly can I get started with HiRekruit?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                You can get started immediately after signing up. Our onboarding
                process takes less than 15 minutes, and you can begin uploading
                resumes right away.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                What file formats does HiRekruit support?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                HiRekruit supports PDF resume formats as of now. We are
                continuously working to add support for additional formats like
                DOCX and TXT in the near future.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Is my candidate data secure?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Absolutely. We process all data locally and follow strict
                security protocols. We're GDPR compliant and use
                enterprise-grade encryption for all data handling.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Can HiRekruit integrate with our existing HR tools?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Not yet, but we are actively working on adding integrations with
                popular HR platforms. Please contact us for the latest updates
                and custom integration options.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                What kind of support do you offer?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We provide 24/7 live chat support, phone support during business
                hours, comprehensive documentation, and dedicated account
                managers for enterprise clients.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Do you offer custom pricing for large organizations?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Yes, we offer flexible enterprise pricing based on your volume
                and specific needs. Contact our sales team to discuss a custom
                solution for your organization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      {/* <section className="py-16 px-6 bg-gradient-to-r from-black to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join hundreds of companies using AI to make smarter, faster hiring
            decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/drive-creation")}
              className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl hover:shadow-2xl transform hover:scale-105 duration-200"
            >
              Start Your Drive Now
            </button>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Home;
