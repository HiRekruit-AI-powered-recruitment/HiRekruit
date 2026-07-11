import React, { useEffect, useState } from "react";
import { AlertTriangle, Maximize, XCircle } from "lucide-react";

/**
 * ProctoringOverlay — shows a warning when the candidate triggers a proctoring violation.
 *
 * First violation:  Full-screen warning banner with "Re-enter Fullscreen" button.
 *                   Also warns that the next violation will auto-submit.
 * Second violation: Handled by the hook (auto-submits); this component unmounts.
 */
const ProctoringOverlay = ({ activeWarning, warningStage, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Animate in when a warning appears
  useEffect(() => {
    if (activeWarning) {
      // Small delay for mount animation
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [activeWarning]);

  if (!activeWarning) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[998] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: isVisible ? 1 : 0 }}
      />

      {/* Warning Card */}
      <div
        className="fixed inset-0 z-[999] flex items-center justify-center p-4"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.95)",
          transition: "opacity 300ms ease-out, transform 300ms ease-out",
        }}
      >
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border-3 border-red-500 overflow-hidden">
          {/* Red accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-600" />

          <div className="p-8">
            {/* Icon + Title */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  ⚠️ Interview Warning
                </h3>
                <p className="text-sm text-red-600 font-semibold mt-0.5">
                  Suspicious activity detected
                </p>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-5">
              <p className="text-gray-800 font-medium text-sm leading-relaxed">
                {activeWarning.message}
              </p>
            </div>

            {/* Next-time warning */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-orange-800 font-semibold text-sm">
                  If you switch tabs, minimize, or exit fullscreen again, your
                  interview will be automatically submitted.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onDismiss}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-base rounded-xl transition-all transform hover:scale-[1.02] shadow-lg border-2 border-red-800"
            >
              <Maximize className="w-5 h-5" />
              Re-enter Fullscreen & Continue Interview
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProctoringOverlay;
