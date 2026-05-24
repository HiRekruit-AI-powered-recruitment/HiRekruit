import { CheckCircle, AlertCircle, Clock, Code, Award } from "lucide-react";

export default function Instructions({
  onStartAssessment,
  darkMode,
  totalQuestions = 3,
  timeLimit = 60,
}) {
  const handleStartClick = () => {
    console.log("Start button clicked");
    if (typeof onStartAssessment === "function") {
      onStartAssessment();
      console.log("onStartAssessment called successfully");
    } else {
      console.error(
        "ERROR: onStartAssessment is not a function!",
        onStartAssessment
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        color: "#000000",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 40px",
          borderBottom: "1px solid #e5e5e5",
        }}
      >
        <div
          style={{
            fontSize: "24px",
            fontWeight: "800",
            letterSpacing: "-0.5px",
          }}
        >
          HiRekruit
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "60px",
            alignItems: "center",
          }}
        >
          {/* Left Section - Branding */}
          <div>
            <div style={{ marginBottom: "40px" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "20px",
                  letterSpacing: "0.5px",
                }}
              >
                CODING ASSESSMENT
              </div>
              <h1
                style={{
                  fontSize: "48px",
                  fontWeight: "900",
                  marginBottom: "16px",
                  lineHeight: "1.1",
                  letterSpacing: "-1px",
                }}
              >
                Test Your
                <br />
                Coding Skills
              </h1>
              <p
                style={{
                  fontSize: "18px",
                  color: "#666666",
                  lineHeight: "1.6",
                  maxWidth: "500px",
                }}
              >
                Solve real-world coding problems, demonstrate your technical
                abilities, and showcase your problem-solving skills.
              </p>
            </div>

            {/* Features */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    backgroundColor: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Code size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "15px" }}>
                    Real Coding Problems
                  </div>
                  <div style={{ fontSize: "14px", color: "#666666" }}>
                    Multiple test cases validation
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    backgroundColor: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "15px" }}>
                    Timed Challenge
                  </div>
                  <div style={{ fontSize: "14px", color: "#666666" }}>
                    {timeLimit} minutes to complete
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    backgroundColor: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "15px" }}>
                    Instant Feedback
                  </div>
                  <div style={{ fontSize: "14px", color: "#666666" }}>
                    Immediate test case results
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    backgroundColor: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Award size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "15px" }}>
                    Auto-graded
                  </div>
                  <div style={{ fontSize: "14px", color: "#666666" }}>
                    Automated evaluation system
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Instructions */}
          <div
            style={{
              padding: "40px",
              backgroundColor: "#fafafa",
              borderRadius: "16px",
              border: "1px solid #e5e5e5",
            }}
          >
            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e5e5e5",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#999999",
                    marginBottom: "8px",
                    fontWeight: "700",
                    letterSpacing: "1px",
                  }}
                >
                  QUESTIONS
                </div>
                <div style={{ fontSize: "36px", fontWeight: "700" }}>
                  {totalQuestions}
                </div>
              </div>

              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e5e5e5",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#999999",
                    marginBottom: "8px",
                    fontWeight: "700",
                    letterSpacing: "1px",
                  }}
                >
                  TIME LIMIT
                </div>
                <div style={{ fontSize: "36px", fontWeight: "700" }}>
                  {timeLimit}
                  <span style={{ fontSize: "18px", color: "#666666" }}>
                    min
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div style={{ marginBottom: "28px" }}>
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  marginBottom: "16px",
                  color: "#999999",
                  letterSpacing: "1.5px",
                }}
              >
                INSTRUCTIONS
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {[
                  "Read each problem statement carefully",
                  "Write solution in the code editor",
                  "Run code to test against test cases",
                  "Switch between problems anytime",
                  "Submit before time runs out",
                ].map((instruction, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >
                    <div
                      style={{
                        minWidth: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: "#000000",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: "700",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div style={{ color: "#333333" }}>{instruction}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Note */}
            <div
              style={{
                padding: "14px",
                backgroundColor: "#fffbeb",
                borderRadius: "8px",
                border: "1px solid #fbbf24",
                display: "flex",
                gap: "10px",
                marginBottom: "28px",
              }}
            >
              <AlertCircle
                size={18}
                style={{ marginTop: "2px", flexShrink: 0, color: "#f59e0b" }}
              />
              <div>
                <div
                  style={{
                    fontWeight: "600",
                    marginBottom: "4px",
                    fontSize: "13px",
                  }}
                >
                  Important
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#666666",
                    lineHeight: "1.5",
                  }}
                >
                  Timer starts when you begin. Ensure stable internet. Progress
                  auto-saves.
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartClick}
              type="button"
              style={{
                padding: "16px 32px",
                backgroundColor: "#000000",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#333333";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#000000";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Start Assessment →
            </button>

            <div
              style={{
                marginTop: "16px",
                fontSize: "13px",
                color: "#999999",
                textAlign: "center",
              }}
            >
              Good luck! 🚀
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "20px 40px",
          borderTop: "1px solid #e5e5e5",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "13px", color: "#999999", margin: 0 }}>
          Powered by HiRekruit • Coding Assessment Platform
        </p>
      </div>
    </div>
  );
}
