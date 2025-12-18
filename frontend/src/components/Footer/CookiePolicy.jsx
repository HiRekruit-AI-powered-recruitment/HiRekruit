import React from "react";
import { Cookie, Shield, Clock, Info } from "lucide-react";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <Cookie size={48} />
            <h1 className="text-4xl md:text-5xl font-bold">Cookie Policy</h1>
          </div>
          <p className="text-xl text-gray-300">
            How HiRekruit uses cookies to provide our services
          </p>
          <p className="text-gray-400 mt-4">Last Updated: August 15, 2025</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">What Are Cookies?</h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              Cookies are small text files that are placed on your device
              (computer, smartphone, or tablet) when you visit a website. They
              are widely used to make websites work more efficiently and provide
              information to website owners.
            </p>
            <p>
              Cookies help websites remember your actions and preferences (such
              as login status) over a period of time, so you don't have to keep
              re-entering them whenever you come back to the site.
            </p>
          </div>
        </section>

        {/* How We Use Cookies */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">How We Use Cookies</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            HiRekruit uses cookies strictly for essential functionality to
            provide our service. We currently use cookies only for session
            management and user authentication.
          </p>

          {/* Cookie Types */}
          <div className="border-2 border-black p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <Shield size={32} className="flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Essential Cookies (Required)
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  These cookies are necessary for the website to function and
                  cannot be switched off in our systems. They are usually only
                  set in response to actions made by you which amount to a
                  request for services, such as logging into your account.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Specific Cookies */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Cookies We Use</h2>
          <div className="space-y-6">
            {/* Session Cookie */}
            <div className="bg-gray-50 border-l-4 border-black p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold">Session Cookie</h3>
                <span className="bg-black text-white px-3 py-1 text-xs font-bold">
                  ESSENTIAL
                </span>
              </div>
              <div className="space-y-3 text-gray-700">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold mb-1">Purpose:</p>
                    <p className="text-sm">
                      Maintains your login session and authenticates your
                      identity while using the platform
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Duration:</p>
                    <p className="text-sm">
                      Session-based (deleted when you close your browser) or up
                      to 30 days if "Remember Me" is selected
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold mb-1">Information Stored:</p>
                  <p className="text-sm">
                    User ID, authentication token, login timestamp
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Why It's Essential:</p>
                  <p className="text-sm">
                    Without this cookie, you would need to log in again every
                    time you navigate to a new page on our platform. This cookie
                    is strictly necessary for the security and functionality of
                    your account.
                  </p>
                </div>
              </div>
            </div>

            {/* Authentication Token */}
            <div className="bg-gray-50 border-l-4 border-black p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold">Authentication Token</h3>
                <span className="bg-black text-white px-3 py-1 text-xs font-bold">
                  ESSENTIAL
                </span>
              </div>
              <div className="space-y-3 text-gray-700">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold mb-1">Purpose:</p>
                    <p className="text-sm">
                      Securely verifies your identity and protects your account
                      from unauthorized access
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Duration:</p>
                    <p className="text-sm">
                      Varies based on your login preferences (typically 24 hours
                      to 30 days)
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold mb-1">Information Stored:</p>
                  <p className="text-sm">
                    Encrypted authentication token, user role, account status
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Why It's Essential:</p>
                  <p className="text-sm">
                    This cookie ensures that only you can access your account
                    and prevents unauthorized users from accessing your data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* No Third-Party Notice */}
        <section className="mb-12">
          <div className="bg-gray-100 border-2 border-gray-300 p-8">
            <div className="flex items-start gap-4">
              <Info size={32} className="flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold mb-3">
                  We Don't Use Third-Party Cookies
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  HiRekruit does not currently use any third-party cookies for
                  analytics, advertising, or tracking purposes. All cookies used
                  on our platform are first-party cookies set by HiRekruit.com
                  and are essential for the platform to function properly.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We do not share your cookie data with any third parties, and
                  we do not use cookies to track your behavior across other
                  websites.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cookie Duration */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">How Long Cookies Last</h2>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start gap-3">
              <Clock size={24} className="flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Session Cookies</h3>
                <p className="leading-relaxed">
                  These are temporary cookies that expire when you close your
                  browser. They are used to maintain your login session while
                  you navigate through the platform.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={24} className="flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Persistent Cookies</h3>
                <p className="leading-relaxed">
                  If you select "Remember Me" when logging in, we set a
                  persistent cookie that keeps you logged in for up to 30 days.
                  This cookie is stored on your device until it expires or you
                  manually delete it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Managing Cookies */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Managing Cookies</h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              Since we only use essential cookies that are necessary for the
              platform to function, we cannot offer an option to disable them.
              Without these cookies, you would not be able to log in or use
              HiRekruit's services.
            </p>
            <p>
              However, you can control and delete cookies through your browser
              settings:
            </p>
            <ul className="space-y-3 ml-6 mt-4">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  <strong>Google Chrome:</strong> Settings → Privacy and
                  Security → Cookies and other site data
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  <strong>Mozilla Firefox:</strong> Settings → Privacy &
                  Security → Cookies and Site Data
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  <strong>Safari:</strong> Preferences → Privacy → Manage
                  Website Data
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  <strong>Microsoft Edge:</strong> Settings → Cookies and site
                  permissions
                </span>
              </li>
            </ul>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
              <p className="text-sm text-gray-800">
                <strong>Important:</strong> If you block or delete our cookies,
                you will not be able to log in to your HiRekruit account or use
                our platform. These cookies are strictly necessary for the
                service to function.
              </p>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Cookie Security</h2>
          <div className="bg-gray-50 border-2 border-gray-200 p-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              We take the security of your data seriously. All cookies we use
              are:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  <strong>Encrypted:</strong> Authentication tokens are
                  encrypted to prevent unauthorized access
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  <strong>Secure:</strong> Transmitted only over HTTPS
                  connections
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  <strong>HttpOnly:</strong> Protected from client-side script
                  access to prevent XSS attacks
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  <strong>SameSite:</strong> Protected against CSRF (Cross-Site
                  Request Forgery) attacks
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Future Changes */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">
            Changes to Our Cookie Policy
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            If we introduce additional cookies in the future (such as analytics
            or performance cookies), we will update this Cookie Policy and
            notify you accordingly. Any non-essential cookies will require your
            consent before being set.
          </p>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Questions About Cookies?</h2>
          <div className="bg-black text-white p-8">
            <p className="text-lg mb-6 leading-relaxed">
              If you have any questions about how we use cookies or this Cookie
              Policy, please don't hesitate to contact us:
            </p>
            <div className="space-y-3">
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:privacy@hirekruit.com"
                  className="text-gray-300 hover:text-white underline"
                >
                  privacy@hirekruit.com
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
              For more information about how we handle your data, please review:
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
                  href="/terms"
                  className="text-black font-medium hover:underline"
                >
                  → Terms of Service
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
            Your Privacy Matters to Us
          </h3>
          <p className="text-gray-600 mb-6">
            We're committed to transparency about how we use cookies and protect
            your data.
          </p>
          <a
            href="/privacy-policy"
            className="inline-block bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 transition-colors"
          >
            Read Our Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
