import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Brain,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  FileText,
  Lightbulb,
  Mic,
  Play,
  ShieldCheck,
  Video,
} from "lucide-react";

const guidelineSections = [
  {
    title: "Key Instructions",
    icon: Lightbulb,
    defaultOpen: true,
    items: [
      "Only the invited candidate should attend this technical interview.",
      "Speak clearly and explain your thinking before jumping to the final answer.",
      "You may be asked questions about your resume, projects, algorithms, debugging, and real-world engineering scenarios.",
      "Your responses, transcript, and interview completion status will be recorded for evaluation.",
      "Do not refresh, close the tab, or switch devices once the interview has started.",
    ],
  },
  {
    title: "Technical Evaluation Focus",
    icon: Brain,
    items: [
      "Problem-solving approach and ability to break down requirements.",
      "Knowledge of data structures, algorithms, coding fundamentals, and trade-offs.",
      "Code quality mindset, including edge cases, testing, complexity, and optimization.",
      "Clarity while explaining technical decisions and project experience.",
    ],
  },
  {
    title: "Interview Setup",
    icon: Video,
    items: [
      "Use a quiet place with stable internet and good lighting.",
      "Allow camera and microphone permissions when the browser asks.",
      "Keep your face visible and avoid background conversations or interruptions.",
      "Use headphones if possible to reduce echo during the AI voice interview.",
    ],
  },
  {
    title: "Conduct Guidelines",
    icon: ShieldCheck,
    items: [
      "Answer honestly based on your own knowledge and experience.",
      "Do not use unfair assistance, copied answers, or another person during the interview.",
      "If you are unsure, explain your assumptions and the approach you would try.",
      "Maintain a professional tone throughout the session.",
    ],
  },
];

const overviewCards = [
  {
    label: "Round",
    value: "Technical",
    icon: Code2,
  },
  {
    label: "Mode",
    value: "AI Interview",
    icon: Mic,
  },
  {
    label: "Resume",
    value: "Required",
    icon: FileText,
  },
];

const TechnicalInterviewStartCard = ({
  candidate,
  canStart,
  isStarting,
  onStartInterview,
}) => {
  const [openSections, setOpenSections] = useState(() =>
    guidelineSections.reduce((acc, section, index) => {
      acc[index] = Boolean(section.defaultOpen);
      return acc;
    }, {}),
  );

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="pb-28">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10">
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg border border-gray-200 shadow-xl p-8 lg:min-h-[620px]"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg text-sm font-semibold mb-8">
            <Code2 className="w-4 h-4" />
            Technical Interview
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 shadow-sm flex items-center justify-center">
              <Code2 className="w-8 h-8 text-black" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">
                HiRekruit AI Round
              </p>
              <h2 className="text-xl font-bold text-gray-900">
                Technical Assessment
              </h2>
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-slate-950 mb-5 leading-tight">
            AI Technical Interview
          </h1>

          <p className="text-2xl font-semibold text-gray-800 mb-2">
            Good luck {candidate?.name || "Candidate"}!
          </p>
          <p className="text-gray-600 max-w-xl mb-10">
            Review the instructions before starting. Once you click start, the
            AI interviewer will begin asking technical questions based on your
            resume and interview round.
          </p>

          <div className="mb-3 text-sm font-semibold text-gray-700">
            Overview
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {overviewCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 transition-colors hover:bg-gray-50"
                >
                  <Icon className="w-6 h-6 text-black mb-5" />
                  <p className="text-sm text-gray-500 mb-2">{card.label}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {card.value}
                  </p>
                </div>
              );
            })}
          </div>

          {!canStart && (
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">
                Resume data is required before the technical interview can
                start.
              </p>
            </div>
          )}
        </motion.aside>

        <motion.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-8">
            <Lightbulb className="w-8 h-8 text-gray-800" />
            <h2 className="text-3xl font-bold text-gray-900">Guidelines</h2>
          </div>

          {guidelineSections.map((section, index) => {
            const Icon = section.icon;
            const isOpen = openSections[index];

            return (
              <div
                key={section.title}
                className={`rounded-lg border transition-colors ${
                  isOpen
                    ? "bg-white border-gray-300 shadow-sm"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleSection(index)}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left"
                >
                  <span className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                    <Icon className="w-5 h-5 text-gray-700" />
                    {section.title}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-700" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-700" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-8 pb-7">
                    <ul className="space-y-3 text-sm leading-6 text-gray-700">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-black flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </motion.section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 shadow-2xl backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
          <p className="text-base text-gray-900 sm:mr-auto">
            Click <span className="font-semibold">Start</span> to begin the AI
            technical interview.
          </p>

          <motion.button
            onClick={onStartInterview}
            disabled={!canStart || isStarting}
            whileHover={{ scale: canStart && !isStarting ? 1.03 : 1 }}
            whileTap={{ scale: canStart && !isStarting ? 0.97 : 1 }}
            className={`px-8 py-3 rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
              canStart && !isStarting
                ? "bg-black hover:bg-gray-800 text-white border border-black hover:shadow-lg"
                : "bg-gray-200 text-gray-500 border border-gray-300 cursor-not-allowed"
            }`}
          >
            {isStarting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" fill="currentColor" />
                Start
              </>
            )}
          </motion.button>
        </div>
      </div>

      <div className="sr-only">
        <Clock />
        <CheckCircle />
      </div>
    </div>
  );
};

export default TechnicalInterviewStartCard;
