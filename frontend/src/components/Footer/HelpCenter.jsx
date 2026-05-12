import React from 'react';
import { motion } from 'framer-motion';
import { LifeBuoy, Mail, Phone, MapPin, MessageSquare, Clock } from 'lucide-react';

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-20 px-6 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-4xl w-full text-center z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-6"
        >
          <LifeBuoy className="w-10 h-10 text-blue-600" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          HiRekruit Help Center
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 mb-16 max-w-2xl mx-auto">
          Need assistance? Our support team is here to ensure your hiring process runs smoothly. Reach out to us through any of the channels below.
        </p>

        {/* Contact Grid */}
        <div className="grid md:grid-cols-2 gap-8 text-left">
          
          {/* Email Support */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 bg-white border border-gray-100 shadow-xl shadow-gray-200/40 rounded-3xl transition-all"
          >
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-500 mb-4">Send us an email and we'll get back to you within 24 hours.</p>
            <a href="mailto:hirekruit@gmail.com" className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
              hirekruit@gmail.com
            </a>
          </motion.div>

          {/* Phone Support */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 bg-white border border-gray-100 shadow-xl shadow-gray-200/40 rounded-3xl transition-all"
          >
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Call Us</h3>
            <p className="text-gray-500 mb-4">Speak directly with our technical experts for immediate help.</p>
            <a href="tel:+917255892578" className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors">
              +91-7255892578
            </a>
          </motion.div>

          {/* Office Location */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 bg-white border border-gray-100 shadow-xl shadow-gray-200/40 rounded-3xl transition-all"
          >
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Headquarters</h3>
            <p className="text-gray-500 mb-4">Visit us at our main office for enterprise inquiries.</p>
            <span className="inline-flex items-center text-orange-600 font-semibold">
              Bihar, India
            </span>
          </motion.div>

          {/* Working Hours */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 bg-white border border-gray-100 shadow-xl shadow-gray-200/40 rounded-3xl transition-all"
          >
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Business Hours</h3>
            <p className="text-gray-500 mb-4">Our support team is available during standard business hours.</p>
            <span className="inline-flex items-center text-purple-600 font-semibold">
              Mon-Fri, 9:00 AM - 6:00 PM IST
            </span>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
};

export default HelpCenter;
