import Editor from "@monaco-editor/react";
import { Play } from "lucide-react";
import { Loader } from "lucide-react"; // Here Loader is not imported BUG Found
const LANGUAGES = [
  { name: "python", label: "Python", monacoName: "python" },
  { name: "javascript", label: "JavaScript", monacoName: "javascript" },
  { name: "java", label: "Java", monacoName: "java" },
  { name: "cpp", label: "C++", monacoName: "cpp" },
];

export default function CodeEditor({
  code,
  setCode,
  language,
  setLanguage,
  onRun,
  darkMode,
  isRunning,
}) {
  const bgColor = darkMode ? "#1a1a1a" : "#ffffff";
  const borderColor = darkMode ? "#2a2a2a" : "#e5e5e5";
  const textColor = darkMode ? "#e0e0e0" : "#000000";

  const currentLanguage = LANGUAGES.find((l) => l.name === language);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: "12px 20px",
          borderBottom: `1px solid ${borderColor}`,
          display: "flex",
          gap: "12px",
          alignItems: "center",
          backgroundColor: bgColor,
          flexShrink: 0,
        }}
      >
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: `1px solid ${borderColor}`,
            backgroundColor: bgColor,
            color: textColor,
            fontSize: "13px",
            cursor: "pointer",
            fontWeight: "600",
            outline: "none",
          }}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.name} value={lang.name}>
              {lang.label}
            </option>
          ))}
        </select>

        <button
          onClick={onRun}
          disabled={isRunning}
          style={{
            marginLeft: "auto",
            padding: "8px 20px",
            backgroundColor: isRunning ? "#16a34a" : "#22c55e",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            cursor: isRunning ? "not-allowed" : "pointer",
            fontSize: "13px",
            fontWeight: "600",
            transition: "all 0.2s",
            opacity: isRunning ? 0.8 : 1,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          onMouseEnter={(e) => {
            if (!isRunning) {
              e.currentTarget.style.backgroundColor = "#16a34a";
            }
          }}
          onMouseLeave={(e) => {
            if (!isRunning) {
              e.currentTarget.style.backgroundColor = "#22c55e";
            }
          }}
        >
          {isRunning ? (
            <>
              <Loader
                size={16}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Running...
            </>
          ) : (
            <>
              <Play size={16} />
              Run Code
            </>
          )}
        </button>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
        <Editor
          height="100%"
          theme={darkMode ? "vs-dark" : "vs-light"}
          language={currentLanguage?.monacoName || "python"}
          value={code}
          onChange={(value) => setCode(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "Monaco, Courier New, monospace",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: "on",
            lineNumbers: "on",
            renderLineHighlight: "line",
            padding: { top: 0, bottom: 0 },
          }}
        />
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
