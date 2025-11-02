import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Filter,
  BarChart3,
  Shield,
  Upload,
  Users,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const Services = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: FileText,
      title: "Resume Intelligence",
      description:
        "Automatically extract key candidate details from their resumes with high accuracy",
      benefits: [
        "Instant data extraction",
        // "Multiple format support",
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
      benefits: [
        "Local processing",
        "GDPR compliant",
        // "Data encryption",
        "Privacy protection",
      ],
    },
    {
      icon: Users,
      title: "Collaborative Workflows",
      description:
        "Seamlessly integrate with existing HR tools and workflows for team collaboration",
      benefits: [
        "Team collaboration",
        // "HR tool integration",
        "Workflow automation",
        "Multi-user access",
      ],
    },
  ];

  const packages = [
    {
      name: "Starter",
      price: "₹999",
      period: "/month",
      description: "Perfect for small businesses and startups",
      features: [
        "Up to 50 candidates/month",
        "AI-powered shortlisting",
        "Automated Email notifications",
        "AI agent interviews",
      ],
      popular: false,
    },
    {
      name: "Professional",
      price: "₹9,999",
      period: "/month",
      description: "Ideal for growing companies",
      features: [
        "Up to 500 candidates/month",
        "AI-powered shortlisting",
        "AI agent interviews",
        "Automated email communication",
        "Comprehensive analytics",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large organizations with complex needs",
      features: [
        "Unlimited candidates",
        "Full AI automation pipeline",
        "Custom drive workflows",
        "Custom analytics & reporting",
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Navigation */}

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Our{" "}
            <span className="bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
              Services
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Comprehensive AI-powered recruitment solutions designed to
            streamline your hiring process and help you find the perfect
            candidates faster than ever before.
          </p>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
            Key Features
          </h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <div className="space-y-3">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-gray-700 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gray-50">
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
              <div className="relative bg-white p-8 rounded-3xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-500 hover:shadow-xl text-center">
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
              <div className="relative bg-white p-8 rounded-3xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-500 hover:shadow-xl text-center">
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
              <div className="relative bg-white p-8 rounded-3xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-500 hover:shadow-xl text-center">
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
              <div className="relative bg-white p-8 rounded-3xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-500 hover:shadow-xl text-center">
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

          {/* Optional: Add connecting line or flow indicator */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 italic text-lg">
              Complete automation from start to finish — with some clicks
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              End-to-end AI recruitment automation at every scale. Start
              automating your hiring today.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div key={index} className="relative group">
                <div
                  className={`absolute inset-0 rounded-3xl blur-xl opacity-5 group-hover:opacity-10 transition-opacity duration-500 ${
                    pkg.popular ? "bg-gray-900" : "bg-gray-600"
                  }`}
                ></div>

                <div
                  className={`relative p-8 md:p-10 rounded-3xl border-2 transition-all duration-500 hover:shadow-2xl ${
                    pkg.popular
                      ? "bg-gray-900 border-gray-800"
                      : "bg-white border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3
                      className={`text-2xl font-bold mb-4 ${
                        pkg.popular ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {pkg.name}
                    </h3>
                    <div className="mb-4">
                      <span
                        className={`text-5xl font-black ${
                          pkg.popular ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {pkg.price}
                      </span>
                      <span
                        className={`text-lg ${
                          pkg.popular ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {pkg.period}
                      </span>
                    </div>
                    <p
                      className={
                        pkg.popular ? "text-gray-300" : "text-gray-600"
                      }
                    >
                      {pkg.description}
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {pkg.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-start gap-3"
                      >
                        <svg
                          className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                            pkg.popular ? "text-white" : "text-gray-900"
                          }`}
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
                        <span
                          className={`leading-relaxed ${
                            pkg.popular ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-300 group/btn ${
                      pkg.popular
                        ? "bg-white text-gray-900 hover:bg-gray-100"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    Get Started
                    <svg
                      className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-lg">
              All plans include our core AI automation features • No setup fees
              • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-black to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of companies who have transformed their recruitment
            process with HiRekruit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/drive-creation")}
              className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Your Drive Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
