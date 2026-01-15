import { Copy } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function Problem({ problem, darkMode }) {
  const textColor = darkMode ? "#e0e0e0" : "#1a1a1a";
  const accentColor = darkMode ? "#3a3a3a" : "#e8e8e8";

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: darkMode ? "dark" : "light",
      });
    });
  };

  if (!problem) {
    return (
      <div style={{ padding: "20px", color: textColor }}>
        <p>Loading problem...</p>
      </div>
    );
  }

  return (
    <div
    
     style={{
        // THIS PREVENTS TEXT SELECTION
        userSelect: "none", 
        WebkitUserSelect: "none", 
        msUserSelect: "none", 
        MozUserSelect: "none",
      }}
      // THIS PREVENTS THE COPY EVENT
      onCopy={(e) => {
        e.preventDefault();
        return false;
      }}
    >
      <ToastContainer />
      
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "12px" }}>
          <span style={{ fontSize: "12px", opacity: 0.6, fontWeight: "600", letterSpacing: "1px" }}>
            PROBLEM #{problem.number}
          </span>
        </div>
        <h1 style={{ margin: "0 0 16px 0", fontSize: "24px", fontWeight: "700" }}>
          {problem.title}
        </h1>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: "600", marginBottom: "8px", opacity: 0.8 }}>DESCRIPTION</h3>
        <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap", color: textColor }}>
          {problem.description}
        </p>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: "600", marginBottom: "8px", opacity: 0.8 }}>CONSTRAINTS</h3>
        <p
          style={{ margin: 0, fontSize: "14px", fontFamily: "monospace", color: textColor, whiteSpace: "pre-wrap" }}
          dangerouslySetInnerHTML={{
            __html: problem.constraints
              .replace(/â‰¤/g, "≤")
              .replace(/â‰¥/g, "≥")
              .replace(/â‰ /g, "≠"),
          }}
        />
      </div>

      <div>
        <h3 style={{ fontSize: "13px", fontWeight: "600", marginBottom: "8px", opacity: 0.8 }}>TEST CASES</h3>
        
        {problem.testCases && problem.testCases.length > 0 ? (
          problem.testCases.map((tc, idx) => (
            <div
              key={idx}
              style={{ marginBottom: "12px", padding: "12px", backgroundColor: accentColor, borderRadius: "6px", fontSize: "13px" }}
            >
              <div style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ opacity: 0.7 }}>Input: </span>
                <span style={{ fontFamily: "monospace" }}>{tc.input}</span>
                <Copy
                  size={16}
                  style={{ cursor: "pointer" }}
                  onClick={() => copyToClipboard(tc.input)}
                />
              </div>
              <div>
                <span style={{ opacity: 0.7 }}>Output: </span>
                <span style={{ fontFamily: "monospace" }}>{tc.output}</span>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: textColor, opacity: 0.7 }}>No test cases available</p>
        )}
      </div>
    </div>
  );
}
