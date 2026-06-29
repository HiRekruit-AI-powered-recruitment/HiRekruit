import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-300 text-lg">Last updated: August 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <p className="text-gray-700 leading-relaxed mb-6">
              At HiRekruit, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our AI-powered recruitment platform.
              Please read this privacy policy carefully.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12 p-8 bg-gray-50 rounded-2xl border-2 border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              1. Information We Collect
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Personal Information
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We collect information that you provide directly to us,
                  including:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-gray-900 font-bold mt-1">•</span>
                    <span>
                      Account information (name, email address, company name,
                      phone number)
                    </span>
                  </li>
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-gray-900 font-bold mt-1">•</span>
                    <span>
                      Payment information (processed securely through
                      third-party payment processors)
                    </span>
                  </li>
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-gray-900 font-bold mt-1">•</span>
                    <span>
                      Communication preferences and correspondence with us
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Candidate Data
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  When you upload resumes and candidate information, we collect:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-gray-900 font-bold mt-1">•</span>
                    <span>
                      Resume content (skills, experience, education, contact
                      information)
                    </span>
                  </li>
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-gray-900 font-bold mt-1">•</span>
                    <span>Interview responses and assessment results</span>
                  </li>
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-gray-900 font-bold mt-1">•</span>
                    <span>Job application data and hiring decisions</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Automatically Collected Information
                </h3>
                <ul className="space-y-2 ml-6">
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-gray-900 font-bold mt-1">•</span>
                    <span>
                      Log data (IP address, browser type, pages visited, time
                      spent)
                    </span>
                  </li>
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-gray-900 font-bold mt-1">•</span>
                    <span>Device information and usage patterns</span>
                  </li>
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-gray-900 font-bold mt-1">•</span>
                    <span>Cookies and similar tracking technologies</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12 p-8 bg-white rounded-2xl border-2 border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              2. How We Use Your Information
            </h2>

            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="space-y-3 ml-6">
                <li className="text-gray-700 flex items-start gap-2">
                  <span className="text-gray-900 font-bold mt-1">•</span>
                  <span>
                    Provide, maintain, and improve our AI recruitment platform
                  </span>
                </li>
                <li className="text-gray-700 flex items-start gap-2">
                  <span className="text-gray-900 font-bold mt-1">•</span>
                  <span>
                    Process resumes and conduct AI-powered screening and
                    interviews
                  </span>
                </li>
                <li className="text-gray-700 flex items-start gap-2">
                  <span className="text-gray-900 font-bold mt-1">•</span>
                  <span>
                    Send automated emails and notifications related to the
                    recruitment process
                  </span>
                </li>
                <li className="text-gray-700 flex items-start gap-2">
                  <span className="text-gray-900 font-bold mt-1">•</span>
                  <span>
                    Generate analytics and insights about hiring processes
                  </span>
                </li>
                <li className="text-gray-700 flex items-start gap-2">
                  <span className="text-gray-900 font-bold mt-1">•</span>
                  <span>
                    Communicate with you about updates, features, and support
                  </span>
                </li>
                <li className="text-gray-700 flex items-start gap-2">
                  <span className="text-gray-900 font-bold mt-1">•</span>
                  <span>
                    Detect, prevent, and address technical issues and fraud
                  </span>
                </li>
                <li className="text-gray-700 flex items-start gap-2">
                  <span className="text-gray-900 font-bold mt-1">•</span>
                  <span>
                    Comply with legal obligations and enforce our terms
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-12 p-8 bg-gray-50 rounded-2xl border-2 border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              3. Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your
              information:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>End-to-end encryption for data transmission</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>Secure cloud storage with regular backups</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>Access controls and authentication protocols</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>
                  Regular security audits and vulnerability assessments
                </span>
              </li>
            </ul>
            <p className="text-gray-600 italic mt-4">
              However, no method of transmission over the Internet is 100%
              secure. While we strive to protect your data, we cannot guarantee
              absolute security.
            </p>
          </section>

          {/* Data Sharing */}
          <section className="mb-12 p-8 bg-white rounded-2xl border-2 border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              4. Information Sharing and Disclosure
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell your personal information. We may share information
              in the following circumstances:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>
                  <strong>With your consent:</strong> When you explicitly
                  authorize us to share information
                </span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>
                  <strong>Service providers:</strong> Third-party vendors who
                  perform services on our behalf (cloud hosting, payment
                  processing, analytics)
                </span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>
                  <strong>Legal requirements:</strong> When required by law or
                  to protect our rights and safety
                </span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>
                  <strong>Business transfers:</strong> In connection with a
                  merger, acquisition, or sale of assets
                </span>
              </li>
            </ul>
          </section>

          {/* Data Retention */}
          <section className="mb-12 p-8 bg-gray-50 rounded-2xl border-2 border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              5. Data Retention
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your information for as long as necessary to:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>Provide our services and maintain your account</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>Comply with legal obligations and resolve disputes</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>Enforce our agreements and protect our legal rights</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              When you delete your account, we will delete or anonymize your
              personal information within 90 days, unless we are required to
              retain it for legal purposes.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-12 p-8 bg-white rounded-2xl border-2 border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              6. Your Rights and Choices
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>
                  <strong>Access:</strong> Request a copy of your personal
                  information
                </span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>
                  <strong>Correction:</strong> Update or correct inaccurate
                  information
                </span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>
                  <strong>Deletion:</strong> Request deletion of your personal
                  information
                </span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>
                  <strong>Data portability:</strong> Receive your data in a
                  structured format
                </span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>
                  <strong>Opt-out:</strong> Unsubscribe from marketing
                  communications
                </span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, please contact us at{" "}
              <a
                href="mailto:privacy@hirekruit.com"
                className="text-gray-900 font-semibold hover:underline"
              >
                hirekruit@gmail.com
              </a>
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-12 p-8 bg-gray-50 rounded-2xl border-2 border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              7. Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your
              experience:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>
                  <strong>Essential cookies:</strong> Required for platform
                  functionality
                </span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>
                  <strong>Analytics cookies:</strong> Help us understand usage
                  patterns
                </span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-1">•</span>
                <span>
                  <strong>Preference cookies:</strong> Remember your settings
                  and choices
                </span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              You can manage cookie preferences through your browser settings.
            </p>
          </section>

          {/* International Transfers */}
          {/* <section className="mb-12 p-8 bg-white rounded-2xl border-2 border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              8. International Data Transfers
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries
              other than India. We ensure appropriate safeguards are in place to
              protect your data in accordance with this Privacy Policy and
              applicable data protection laws.
            </p>
          </section> */}

          {/* Children's Privacy */}
          {/* <section className="mb-12 p-8 bg-gray-50 rounded-2xl border-2 border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              9. Children's Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are not intended for individuals under the age of 18.
              We do not knowingly collect personal information from children. If
              we become aware that we have collected information from a child,
              we will delete it immediately.
            </p>
          </section> */}

          {/* Changes to Policy */}
          {/* <section className="mb-12 p-8 bg-white rounded-2xl border-2 border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              10. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new policy on
              this page and updating the "Last updated" date. Your continued use
              of our services after changes constitutes acceptance of the
              updated policy.
            </p>
          </section> */}

          {/* Contact */}
          <section className="p-8 bg-gray-900 rounded-2xl text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              11. Contact Us
            </h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-3 text-gray-300">
              {/* <p>
                <strong className="text-white">Email:</strong>{" "}
                hirekruit@gmail.com
              </p> */}
              <p>
                <strong className="text-white">Address:</strong> HiRekruit,
                Karnataka, India
              </p>
              <p>
                <strong className="text-white">Support:</strong>{" "}
                hirekruit@gmail.com
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
