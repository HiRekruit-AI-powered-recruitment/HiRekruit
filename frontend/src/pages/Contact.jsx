import React, { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
  Users,
  Headphones,
  Globe,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const form = useRef();
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    company: "",
    phone: "",
    inquiryType: "general",
    message: "",
  });

  const navigate = useNavigate();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // EmailJS credentials
  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear any previous errors
    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await emailjs.sendForm(
        SERVICE_ID,
        TEMPLATE_ID,
        form.current,
        PUBLIC_KEY
      );

      console.log("Email sent successfully:", result.text);
      setIsSubmitted(true);

      // Reset form
      setFormData({
        user_name: "",
        user_email: "",
        company: "",
        phone: "",
        inquiryType: "general",
        message: "",
      });

      // Hide success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error("Email send failed:", error);
      setSubmitError(
        "Failed to send message. Please try again or contact us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "hirekruit@gmail.com",
      description: "Send us an email anytime",
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+91-6202908328",
      description: "Mon-Fri from 9am to 6pm IST",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: "NITK, Surathkal, India",
      description: "Our headquarters in Karnataka",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "9:00 AM - 6:00 PM EST",
      description: "Monday through Friday",
    },
  ];

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      availability: "Available 24/7",
    },
    {
      icon: Headphones,
      title: "Phone Support",
      description: "Speak directly with our experts",
      availability: "Mon-Fri, 9am-6pm EST",
    },
    {
      icon: Globe,
      title: "Help Center",
      description: "Browse our comprehensive documentation",
      availability: "Available anytime",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Get in{" "}
            <span className="bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Ready to transform your hiring process? We're here to help you get
            started with HiRekruit. Reach out to us and discover how AI can
            revolutionize your recruitment.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Send us a Message
              </h2>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-gray-600">
                    Thank you for contacting us. We'll get back to you within 24
                    hours.
                  </p>
                </div>
              ) : (
                <>
                  {submitError && (
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg flex items-center">
                      <AlertCircle className="w-5 h-5 text-gray-600 mr-3" />
                      <p className="text-gray-700">{submitError}</p>
                    </div>
                  )}

                  <form
                    ref={form}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="user_name"
                          required
                          value={formData.user_name}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="user_email"
                          required
                          value={formData.user_email}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="your.email@company.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="Your company name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Inquiry Type
                      </label>
                      <select
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="demo">Request Demo</option>
                        <option value="pricing">Pricing Information</option>
                        <option value="support">Technical Support</option>
                        <option value="partnership">Partnership</option>
                        <option value="enterprise">Enterprise Solutions</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Tell us about your needs and how we can help..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-black to-gray-800 text-white py-3 px-6 rounded-lg font-semibold hover:from-gray-800 hover:to-gray-900 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                        <info.icon className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {info.title}
                        </h3>
                        <p className="text-black font-medium">{info.details}</p>
                        <p className="text-gray-600 text-sm">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Options */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Support Options
                </h3>
                <div className="space-y-4">
                  {supportOptions.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center p-4 bg-white rounded-lg"
                    >
                      <option.icon className="w-8 h-8 text-black mr-4" />
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {option.title}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {option.description}
                        </p>
                        <p className="text-black text-xs">
                          {option.availability}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                How quickly can I get started with HiRekruit?
              </h3>
              <p className="text-gray-600">
                You can get started immediately after signing up. Our onboarding
                process takes less than 15 minutes, and you can begin uploading
                resumes right away.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                What file formats does HiRekruit support?
              </h3>
              <p className="text-gray-600">
                HiRekruit supports PDF resume formats as of now. We are
                continuously working to add support for additional formats like
                DOCX and TXT in the near future.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Is my candidate data secure?
              </h3>
              <p className="text-gray-600">
                Absolutely. We process all data locally and follow strict
                security protocols. We're GDPR compliant and use
                enterprise-grade encryption for all data handling.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Can HiRekruit integrate with our existing HR tools?
              </h3>
              <p className="text-gray-600">
                Not yet, but we are actively working on adding integrations with
                popular HR platforms. Please contact us for the latest updates
                and custom integration options.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                What kind of support do you offer?
              </h3>
              <p className="text-gray-600">
                We provide 24/7 live chat support, phone support during business
                hours, comprehensive documentation, and dedicated account
                managers for enterprise clients.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Do you offer custom pricing for large organizations?
              </h3>
              <p className="text-gray-600">
                Yes, we offer flexible enterprise pricing based on your volume
                and specific needs. Contact our sales team to discuss a custom
                solution for your organization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-black to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of companies transforming their hiring with HiRekruit.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* here navigate this button to sign up */}
            <button
              onClick={() => navigate("/drive-creation")}
              className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Your Drive Now
            </button>
            {/* <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-black transition-colors">
              Schedule Demo
            </button> */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
