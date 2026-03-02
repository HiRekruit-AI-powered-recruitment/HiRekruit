import React from "react";
import {
  Linkedin,
  Twitter,
  Instagram,
  Github,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/hirekruit",
      icon: Linkedin,
    },
    {
      name: "Twitter",
      href: "https://twitter.com/hirekruit",
      icon: Twitter,
    },
    {
      name: "Instagram",
      href: "https://instagram.com/hirekruit",
      icon: Instagram,
    },
  ];

  const footerLinks = {
    company: [
      { label: "About Us", href: "/about" },
      { label: "HiKareers", href: "https://careers.hirekruit.com" },
      // { label: "Blog", href: "/blog" },
      // { label: "Press", href: "/press" },
    ],
    resources: [
      { label: "Documentation", href: "/docs" },
      { label: "Help Center", href: "/help" },
      { label: "API", href: "/api" },
      // { label: "Community", href: "/community" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "Compliance", href: "/compliance" },
    ],
  };

  const contactInfo = [
    {
      label: "hirekruit@gmail.com",
      href: "hirekruit@gmail.com",
      icon: Mail,
    },
    {
      label: "+91 7255892578",
      href: "+91 7255892578",
      icon: Phone,
    },
    {
      label: "Bihar, India",
      href: "#",
      icon: MapPin,
    },
  ];

  return (
    <footer className="bg-black text-white border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand Section - Takes more space */}
          <div className="lg:col-span-5">
            <a
              href="https://hirekruit.com/"
              className="inline-block mb-6 group"
            >
              <h2 className="text-3xl font-bold tracking-tight group-hover:tracking-wide transition-all duration-300">
                HiRekruit
              </h2>
            </a>
            <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-md">
              Transforming recruitment with intelligent automation. Build
              exceptional teams faster with data-driven hiring solutions.
            </p>

            {/* Newsletter Signup */}
            {/* <div className="mb-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                Stay Updated
              </h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2.5 bg-white text-black border border-gray-700 focus:border-white focus:outline-none transition-colors text-sm"
                />
                <button className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 transition-all duration-300 font-medium text-sm flex items-center gap-2 group">
                  Subscribe
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div> */}

            {/* Social Links */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                Connect With Us
              </h3>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                      aria-label={social.name}
                    >
                      <div className="w-11 h-11 border-2 border-gray-700 hover:border-white flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                        <Icon
                          size={18}
                          className="text-gray-400 group-hover:text-white transition-colors duration-300"
                        />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Company Links */}
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5 pb-2 border-b-2 border-white inline-block">
                Company
              </h3>
              <ul className="space-y-3.5 mt-5">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center gap-2 group"
                    >
                      <span className="w-0 h-0.5 bg-white group-hover:w-4 transition-all duration-300"></span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5 pb-2 border-b-2 border-white inline-block">
                Resources
              </h3>
              <ul className="space-y-3.5 mt-5">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center gap-2 group"
                    >
                      <span className="w-0 h-0.5 bg-white group-hover:w-4 transition-all duration-300"></span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5 pb-2 border-b-2 border-white inline-block">
                Legal
              </h3>
              <ul className="space-y-3.5 mt-5">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center gap-2 group"
                    >
                      <span className="w-0 h-0.5 bg-white group-hover:w-4 transition-all duration-300"></span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Contact
            </h3>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-6 md:gap-8">
              {contactInfo.map((contact) => {
                const Icon = contact.icon;
                return (
                  <a
                    key={contact.label}
                    href={contact.href}
                    className="flex items-center gap-2.5 text-gray-400 hover:text-white text-sm transition-colors duration-200 group"
                  >
                    <div className="w-8 h-8 border border-gray-700 group-hover:border-white flex items-center justify-center transition-colors">
                      <Icon size={14} />
                    </div>
                    <span>{contact.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>© {currentYear}</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <a
                href="https://hirekruit.com/"
                className="text-gray-400 hover:text-white transition-colors font-medium"
              >
                HiRekruit Inc.
              </a>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span>All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a className="text-gray-500 ">Sitemap</a>
              <span className="w-px h-4 bg-gray-700"></span>
              <a
                href="/accessibility"
                className="text-gray-500 hover:text-white transition-colors"
              >
                Accessibility
              </a>
              {/* <span className="w-px h-4 bg-gray-700"></span> */}
              {/* <button className="text-gray-500">Cookies</button> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
