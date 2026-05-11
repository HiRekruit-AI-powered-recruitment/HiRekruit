import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileCode, Layers, Search, Compass } from 'lucide-react';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Glowing Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

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
          className="inline-flex items-center justify-center p-5 bg-slate-800/50 border border-slate-700/50 rounded-3xl backdrop-blur-xl shadow-2xl mb-10"
        >
          <BookOpen className="w-12 h-12 text-sky-400" />
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-indigo-300 drop-shadow-sm">
          Documentation
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
          We're writing comprehensive guides, tutorials, and API references to help you get the most out of HiRekruit's AI hiring platform.
        </p>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6 mb-20"
        >
          <div className="flex items-center gap-3 px-6 py-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl backdrop-blur-md shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]"></div>
            <span className="text-slate-300 font-medium tracking-wide">Status: Being Written</span>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl backdrop-blur-md shadow-inner">
            <Compass className="w-5 h-5 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
            <span className="text-slate-300 font-medium tracking-wide">Publishing Soon</span>
          </div>
        </motion.div>

        {/* Sneak Peek Grid */}
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <FeatureCard 
            icon={<Search className="w-8 h-8 text-sky-400" />}
            title="Quickstart Guides"
            desc="Step-by-step instructions to create your first hiring drive, invite candidates, and review AI feedback."
            delay={0.5}
          />
          <FeatureCard 
            icon={<FileCode className="w-8 h-8 text-indigo-400" />}
            title="API Reference"
            desc="Detailed endpoint documentation with request/response examples and comprehensive error code definitions."
            delay={0.6}
          />
          <FeatureCard 
            icon={<Layers className="w-8 h-8 text-teal-400" />}
            title="Best Practices"
            desc="Learn how to optimize your assessment questions and prompt engineering for the most accurate AI evaluations."
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
      className="p-8 bg-slate-800/20 border border-slate-700/50 hover:border-slate-600/80 rounded-3xl backdrop-blur-md transition-all duration-300 ease-out group"
    >
      <div className="mb-6 p-4 bg-slate-800/40 inline-block rounded-2xl group-hover:bg-slate-700/60 transition-colors">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold mb-3 text-slate-200 tracking-tight">{title}</h3>
      <p className="text-slate-400 text-base leading-relaxed font-light">{desc}</p>
    </motion.div>
  );
};

export default Documentation;
