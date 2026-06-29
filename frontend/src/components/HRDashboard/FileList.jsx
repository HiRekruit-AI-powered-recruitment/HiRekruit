import React from "react";

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

const FileList = ({ files, onRemove }) => {
  if (!files.length) return null;
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {files.length} file{files.length > 1 ? "s" : ""}
        </div>
      </div>
      <div className="mt-2 border border-gray-300 shadow-lg rounded-lg divide-y bg-white">
        {files.map((f, i) => (
          <div
            key={`${f.name}-${i}`}
            className="flex items-center justify-between px-3 py-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-gray-400">📄</span>
              <div className="text-sm text-gray-700 truncate">
                {f.webkitRelativePath || f.name}
              </div>
              <div className="text-xs text-gray-400">({fmtBytes(f.size)})</div>
            </div>
            <button
              onClick={() => onRemove(i)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;
