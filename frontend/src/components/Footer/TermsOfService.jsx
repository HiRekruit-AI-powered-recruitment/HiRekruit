import React from "react";
import { FileText, Shield, Scale, Info } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <FileText size={48} />
            <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-xl text-gray-300">
            Please read these terms carefully before using HiRekruit
          </p>
          <p className="text-gray-400 mt-4">Last Updated: May 25, 2026</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Agreement to Terms */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">1. Agreement to Terms</h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              By accessing or using our services, you agree to be bound by these
              Terms of Service and all terms incorporated by reference. If you
              do not agree to all of these terms, do not use our services.
            </p>
            <p>
              These Terms apply to all users of the HiRekruit platform, including
              employers, candidates, administrators, and any other individuals
              accessing the service.
            </p>
          </div>
        </section>

        {/* Use of Services */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">2. Use of Services</h2>
          
          <div className="border-2 border-black p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <Scale size={32} className="flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Acceptable Use Policy
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  You agree not to misuse the HiRekruit services. You are
                  responsible for all activities associated with your account and
                  must comply with all applicable local, state, national, and
                  international laws.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>When using our platform, you agree not to:</p>
            <ul className="space-y-3 ml-6 mt-4">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  <strong>Provide false information:</strong> Submit inaccurate,
                  incomplete, or false information during the registration or
                  application process.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  <strong>Harm the system:</strong> Interfere with, disrupt, or
                  create an undue burden on the services or the networks or
                  services connected to the platform.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  <strong>Unauthorized access:</strong> Attempt to bypass any
                  measures of the site designed to prevent or restrict access to
                  the platform or any portion of the platform.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* User Accounts */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">3. User Accounts</h2>
          <div className="bg-gray-50 border-l-4 border-black p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold">Account Responsibilities</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                To use certain features of the platform, you may be required to
                create an account. You are responsible for maintaining the
                confidentiality of your account credentials and are fully
                responsible for all activities that occur under your account.
              </p>
              <p>
                You must notify us immediately of any unauthorized use of your
                account or any other breach of security. We cannot and will not
                be liable for any loss or damage arising from your failure to
                protect your account information.
              </p>
            </div>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">4. Intellectual Property</h2>
          <div className="bg-gray-100 border-2 border-gray-300 p-8">
            <div className="flex items-start gap-4">
              <Shield size={32} className="flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold mb-3">
                  Ownership and Rights
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  All rights, title, and interest in and to the platform and
                  services, including all intellectual property rights, are and
                  will remain the exclusive property of HiRekruit and its
                  licensors.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  You are granted a limited, non-exclusive, non-transferable,
                  and revocable license to access and use the platform strictly
                  in accordance with these Terms.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer of Warranties */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">5. Disclaimer of Warranties</h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS
              WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED,
              INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT.
            </p>
            <p>
              HiRekruit does not warrant that the services will be uninterrupted,
              secure, or free from errors, viruses, or other harmful components.
            </p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">6. Limitation of Liability</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
            <p className="text-sm text-gray-800 leading-relaxed">
              <strong>Important:</strong> To the fullest extent permitted by
              applicable law, in no event will HiRekruit, its affiliates,
              directors, employees, or agents be liable for any indirect,
              incidental, special, consequential, or punitive damages, including
              without limitation, loss of profits, data, use, goodwill, or other
              intangible losses, resulting from (i) your access to or use of or
              inability to access or use the services; (ii) any conduct or
              content of any third party on the services; or (iii) unauthorized
              access, use, or alteration of your transmissions or content.
            </p>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">7. Changes to Terms</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. If a revision is material, we will provide
            at least 30 days' notice prior to any new terms taking effect. What
            constitutes a material change will be determined at our sole
            discretion.
          </p>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">8. Contact Us</h2>
          <div className="bg-black text-white p-8">
            <p className="text-lg mb-6 leading-relaxed">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="space-y-3">
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:legal@hirekruit.com"
                  className="text-gray-300 hover:text-white underline"
                >
                  legal@hirekruit.com
                </a>
              </p>
              <p>
                <strong>Address:</strong> HiRekruit Inc., 123 Tech Street, San
                Francisco, CA 94105, USA
              </p>
            </div>
          </div>
        </section>

        {/* Related Policies */}
        <section className="border-t-2 border-gray-200 pt-8">
          <h2 className="text-2xl font-bold mb-4">Related Policies</h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              Please also review our other policies that govern your use of the
              platform:
            </p>
            <ul className="space-y-2 ml-4">
              <li>
                <a
                  href="/privacy-policy"
                  className="text-black font-medium hover:underline"
                >
                  → Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/cookie-policy"
                  className="text-black font-medium hover:underline"
                >
                  → Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </section>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Have questions about our terms?
          </h3>
          <p className="text-gray-600 mb-6">
            Our support team is here to help clarify any part of our Terms of Service.
          </p>
          <a
            href="/contact"
            className="inline-block bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
