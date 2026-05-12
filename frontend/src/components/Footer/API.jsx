import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Code2, Zap, Lock, Blocks } from 'lucide-react';

const API = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-5xl w-full text-center z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "backOut" }}
          className="inline-flex items-center justify-center p-5 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl mb-10"
        >
          <Code2 className="w-12 h-12 text-indigo-400" />
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-violet-300 drop-shadow-sm">
          Developer API
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
          We're engineering a powerful, scalable REST & GraphQL API to seamlessly integrate HiRekruit's AI capabilities directly into your workflows.
        </p>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6 mb-20"
        >
          <div className="flex items-center gap-3 px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
            <span className="text-gray-300 font-medium tracking-wide">Status: In Active Development</span>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md shadow-inner">
            <Zap className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            <span className="text-gray-300 font-medium tracking-wide">Coming Soon</span>
          </div>
        </motion.div>

        {/* Feature Preview Grid */}
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <FeatureCard 
            icon={<Terminal className="w-8 h-8 text-indigo-400" />}
            title="Real-Time Webhooks"
            desc="Subscribe to instant event payloads. Get notified immediately when candidates complete rounds or statuses change."
            delay={0.5}
          />
          <FeatureCard 
            icon={<Lock className="w-8 h-8 text-violet-400" />}
            title="Enterprise Security"
            desc="Secure your integrations with fine-grained access tokens, scoped API keys, and comprehensive audit logs."
            delay={0.6}
          />
          <FeatureCard 
            icon={<Blocks className="w-8 h-8 text-fuchsia-400" />}
            title="Flexible Endpoints"
            desc="Robust REST architecture allowing you to script interview creation, extract analytics, and manage candidates programmatically."
            delay={0.7}
          />
        </div>
      </motion.div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.6 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="p-8 bg-white/[0.02] border border-white/5 hover:border-white/20 rounded-3xl backdrop-blur-md transition-all duration-300 ease-out group"
    >
      <div className="mb-6 p-4 bg-white/[0.05] inline-block rounded-2xl group-hover:bg-white/[0.1] transition-colors">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold mb-3 text-white tracking-tight">{title}</h3>
      <p className="text-gray-400 text-base leading-relaxed font-light">{desc}</p>
    </motion.div>
  );
};

export default API;
