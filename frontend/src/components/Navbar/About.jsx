import React, { useState, useEffect } from "react";
import { Users, Target, Award, Zap } from "lucide-react";

// Custom hook for animated counter
const useAnimatedCounter = (
  end,
  duration = 2000,
  startAnimation = false,
  decimal = false
) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startAnimation) return;

    let startTime = null;

    const animateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      if (progress < duration) {
        const currentCount = decimal
          ? parseFloat(((progress / duration) * end).toFixed(1))
          : Math.floor((progress / duration) * end);
        setCount(currentCount);
        requestAnimationFrame(animateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animateCount);
  }, [end, duration, startAnimation, decimal]);

  return count;
};

// Intersection Observer hook for triggering animation when section comes into view
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(element); // Trigger only once
        }
      },
      { threshold: 0.3, ...options }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [element, options]);

  return [setElement, isIntersecting];
};

const About = () => {
  const [statsRef, statsVisible] = useIntersectionObserver();

  // Animated counters for stats
  const screeningSpeed = useAnimatedCounter(95, 2000, statsVisible);
  const candidatesCount = useAnimatedCounter(5, 2200, statsVisible);
  const accuracyRate = useAnimatedCounter(95, 2500, statsVisible, true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
              HiRekruit
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            We're revolutionizing recruitment with AI-powered solutions that
            make hiring faster, fairer, and more effective for companies
            worldwide.
          </p>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
              Problem & Solution
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Traditional hiring is broken. We've rebuilt it from the ground up.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Problem Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gray-900 rounded-3xl blur-xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
              <div className="relative bg-white p-8 md:p-12 rounded-3xl border-2 border-gray-300 shadow-lg hover:shadow-2xl transition-all duration-500 hover:border-gray-400">
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
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    The Problem
                  </h2>
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
              <div className="relative bg-gray-900 p-8 md:p-12 rounded-3xl border-2 border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500">
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
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Our Solution
                  </h2>
                </div>

                <p className="text-lg text-gray-300 mb-4 leading-relaxed">
                  <span className="font-bold text-white">HiRekruit</span> is an
                  AI-powered recruitment platform that automates your entire
                  hiring pipeline with a single click.
                </p>

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

      {/* Company Values */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that drive everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center group bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Innovation
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Continuously pushing the boundaries of AI technology to solve
                complex recruitment challenges.
              </p>
            </div>

            <div className="text-center group bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Precision
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Delivering accurate, data-driven insights that help you make the
                right hiring decisions.
              </p>
            </div>

            <div className="text-center group bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Inclusivity
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Promoting fair and unbiased hiring practices to build diverse,
                high-performing teams.
              </p>
            </div>

            <div className="text-center group bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
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
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Excellence
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Committed to delivering exceptional results and exceeding our
                clients' expectations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gray-900 rounded-3xl blur-xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
              <div className="relative bg-white p-10 md:p-12 rounded-3xl border-2 border-gray-300 shadow-lg hover:shadow-2xl transition-all duration-500 hover:border-gray-400">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-gray-900 p-4 rounded-2xl">
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Our Mission
                  </h2>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  To democratize access to intelligent recruitment tools,
                  empowering organizations of all sizes to make faster, fairer,
                  and more effective hiring decisions through the power of
                  artificial intelligence.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gray-900 rounded-3xl blur-xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
              <div className="relative bg-gray-900 p-10 md:p-12 rounded-3xl border-2 border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-white p-4 rounded-2xl">
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Our Vision
                  </h2>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">
                  To create a world where every hiring decision is data-driven,
                  bias-free, and optimized for success, where the best
                  candidates are matched with the right opportunities regardless
                  of background or circumstance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-gray-50" ref={statsRef}>
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-12">
            HiRekruit by the Numbers
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div
                className={`text-4xl font-bold text-black mb-2 transition-all duration-500 ${
                  statsVisible ? "animate-pulse" : ""
                }`}
              >
                {screeningSpeed}%
              </div>
              <div className="text-gray-600 font-medium">Faster Screening</div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div
                className={`text-4xl font-bold text-gray-700 mb-2 transition-all duration-500 ${
                  statsVisible ? "animate-pulse" : ""
                }`}
              >
                {candidatesCount}K+
              </div>
              <div className="text-gray-600 font-medium">
                Candidates Processed
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div
                className={`text-4xl font-bold text-gray-800 mb-2 transition-all duration-500 ${
                  statsVisible ? "animate-pulse" : ""
                }`}
              >
                {accuracyRate}%
              </div>
              <div className="text-gray-600 font-medium">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
