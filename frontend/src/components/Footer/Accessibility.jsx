import React from "react";
import { Mail, Phone, AlertCircle } from "lucide-react";

const Accessibility = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Accessibility Statement
          </h1>
          <p className="text-xl text-gray-300">
            HiRekruit is committed to making our platform accessible to all
            users.
          </p>
          <p className="text-gray-400 mt-4">Last Updated: August 15, 2025</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Current Status Notice */}
        <section className="mb-12">
          <div className="bg-gray-100 border-l-4 border-black p-6">
            <div className="flex items-start gap-4">
              <AlertCircle size={24} className="flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold mb-2">
                  Accessibility In Progress
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  HiRekruit is currently in active development. We are working
                  to implement comprehensive accessibility features to ensure
                  our platform is usable by everyone, including people with
                  disabilities. This page will be updated as we make progress.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Commitment */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Our Commitment</h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              At HiRekruit, we believe that technology should be accessible to
              everyone. We recognize the importance of providing equal access to
              our recruitment platform for all users, regardless of their
              abilities.
            </p>
            <p>
              As we continue to develop and improve our platform, we are
              committed to:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  Following Web Content Accessibility Guidelines (WCAG) 2.1
                  standards
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  Designing with accessibility in mind from the ground up
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>Testing our platform with assistive technologies</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  Listening to user feedback and continuously improving
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>Training our team on accessibility best practices</span>
              </li>
            </ul>
          </div>
        </section>

        {/* What We're Working On */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">What We're Working On</h2>
          <div className="space-y-4 text-gray-700">
            <p className="text-lg leading-relaxed">
              We are actively developing accessibility features across our
              platform. Our roadmap includes:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="border-2 border-gray-200 p-6">
                <h3 className="font-bold text-lg mb-2">Keyboard Navigation</h3>
                <p className="text-sm text-gray-600">
                  Ensuring all features are accessible using keyboard alone,
                  without requiring a mouse.
                </p>
              </div>
              <div className="border-2 border-gray-200 p-6">
                <h3 className="font-bold text-lg mb-2">
                  Screen Reader Support
                </h3>
                <p className="text-sm text-gray-600">
                  Making our platform compatible with popular screen readers
                  like JAWS, NVDA, and VoiceOver.
                </p>
              </div>
              <div className="border-2 border-gray-200 p-6">
                <h3 className="font-bold text-lg mb-2">Visual Accessibility</h3>
                <p className="text-sm text-gray-600">
                  Implementing proper color contrast, text sizing, and visual
                  indicators.
                </p>
              </div>
              <div className="border-2 border-gray-200 p-6">
                <h3 className="font-bold text-lg mb-2">Alternative Formats</h3>
                <p className="text-sm text-gray-600">
                  Providing captions, transcripts, and text alternatives for
                  multimedia content.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Current Limitations */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Known Limitations</h2>
          <div className="bg-gray-50 border-2 border-gray-200 p-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              We want to be transparent about our current accessibility status.
              As we are still developing our platform, some areas may not yet
              meet full accessibility standards. We are working diligently to
              address these limitations.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you encounter any barriers while using HiRekruit, please reach
              out to us. Your feedback is invaluable and helps us prioritize our
              accessibility improvements.
            </p>
          </div>
        </section>

        {/* Need Assistance */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Need Assistance?</h2>
          <div className="bg-black text-white p-8">
            <p className="text-lg mb-6 leading-relaxed">
              If you are experiencing difficulty accessing any part of our
              platform or need accommodations, we want to help. Please contact
              us and we will work with you to provide the information or service
              you need through an alternative method.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Mail className="flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-bold mb-1">Email</p>
                  <a
                    href="mailto: hirekruit@gmail.com"
                    className="text-gray-300 hover:text-white underline"
                  >
                    hirekruit@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-bold mb-1">Phone</p>
                  <a
                    href="tel:+91 7255892578"
                    className="text-gray-300 hover:text-white underline"
                  >
                    +91 7255892578
                  </a>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-6">
              We aim to respond to all accessibility inquiries within 2 business
              days.
            </p>
          </div>
        </section>

        {/* Feedback */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Share Your Feedback</h2>
          <div className="border-2 border-black p-6">
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Your feedback helps us improve. If you have suggestions or
              encounter accessibility issues, please let us know:
            </p>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>What accessibility barrier did you encounter?</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>Which page or feature was affected?</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>What assistive technology are you using (if any)?</span>
              </li>
            </ul>
            <a
              href="mailto:hirekruit@gmail.com?subject=Accessibility%20Feedback"
              className="inline-block bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 transition-colors"
            >
              Send Accessibility Feedback
            </a>
          </div>
        </section>

        {/* Standards We're Working Towards */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">
            Standards We're Working Towards
          </h2>
          <div className="space-y-4 text-gray-700">
            <p className="text-lg leading-relaxed">
              Our goal is to meet or exceed the following accessibility
              standards:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  <strong>WCAG 2.1 Level AA:</strong> Web Content Accessibility
                  Guidelines for digital content
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  <strong>Section 508:</strong> U.S. federal accessibility
                  standards
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  <strong>ADA:</strong> Americans with Disabilities Act
                  compliance
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Updates */}
        <section className="border-t-2 border-gray-200 pt-8">
          <h2 className="text-2xl font-bold mb-4">Regular Updates</h2>
          <p className="text-gray-600 leading-relaxed">
            We will update this accessibility statement as we implement new
            features and improvements. We are committed to transparency about
            our progress and limitations. Check back regularly for updates on
            our accessibility journey.
          </p>
          <p className="text-gray-500 text-sm mt-4">
            This statement was last updated on January 15, 2025.
          </p>
        </section>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-4">Questions or Concerns?</h3>
          <p className="text-gray-600 mb-6">
            We're here to help. Contact us with any accessibility questions or
            to request assistance.
          </p>
          <a
            href="mailto:hirekruit@gmail.com"
            className="inline-block bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;

/*
===================================================================================
FUTURE ACCESSIBILITY FEATURES - UNCOMMENT AND IMPLEMENT WHEN READY
===================================================================================

Below is the comprehensive accessibility page with all features claimed.
Use this as a reference when implementing actual accessibility features.

import React from "react";
import {
  Eye,
  Keyboard,
  Monitor,
  Volume2,
  MousePointer,
  FileText,
  Mail,
  Phone,
  CheckCircle,
} from "lucide-react";

const Accessibility = () => {
  const currentYear = new Date().getFullYear();

  const commitments = [
    {
      icon: Eye,
      title: "Visual Accessibility",
      description:
        "High contrast ratios, scalable text, and support for screen readers including JAWS, NVDA, and VoiceOver.",
    },
    {
      icon: Keyboard,
      title: "Keyboard Navigation",
      description:
        "Full keyboard accessibility with logical tab order, skip links, and visible focus indicators throughout the platform.",
    },
    {
      icon: Monitor,
      title: "Screen Reader Support",
      description:
        "Semantic HTML, ARIA labels, and proper heading structure for seamless screen reader navigation.",
    },
    {
      icon: Volume2,
      title: "Audio & Captions",
      description:
        "Video content includes captions and transcripts. Audio-based interviews support text alternatives.",
    },
    {
      icon: MousePointer,
      title: "Motor Accessibility",
      description:
        "Large click targets, drag-and-drop alternatives, and support for assistive input devices.",
    },
    {
      icon: FileText,
      title: "Content Clarity",
      description:
        "Clear language, consistent layouts, and easy-to-understand navigation for cognitive accessibility.",
    },
  ];

  const standards = [
    {
      name: "WCAG 2.1 Level AA",
      status: "Compliant",
      description:
        "We follow Web Content Accessibility Guidelines 2.1 at Level AA standard.",
    },
    {
      name: "Section 508",
      status: "Compliant",
      description:
        "Our platform meets Section 508 requirements for federal accessibility.",
    },
    {
      name: "ADA Compliant",
      status: "Compliant",
      description:
        "We adhere to Americans with Disabilities Act digital accessibility standards.",
    },
    {
      name: "EN 301 549",
      status: "Compliant",
      description:
        "Compliant with European accessibility standards for ICT products.",
    },
  ];

  // ... rest of the comprehensive implementation
  // See previous version for full code
};

export default Accessibility;

===================================================================================
END OF FUTURE FEATURES
===================================================================================
*/
