import React, { useCallback, useMemo, useRef, useState } from "react";

const SUPPORTED_EXTENSIONS = ["pdf", "doc", "docx", "txt", "rtf"];

function bytesToReadable(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024)
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function isSupported(file) {
  const name = file.name || "";
  const ext = name.split(".").pop()?.toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

async function readAllEntries(directoryReader) {
  // readEntries returns at most 100 entries per call; keep reading until empty
  const entries = [];
  while (true) {
    const batch = await new Promise((resolve) =>
      directoryReader.readEntries(resolve)
    );
    if (!batch.length) break;
    entries.push(...batch);
  }
  return entries;
}

async function traverseFileTree(entry, path = "") {
  const files = [];
  if (entry.isFile) {
    const file = await new Promise((resolve, reject) =>
      entry.file(resolve, reject)
    );
    // Attach a pseudo relative path for better UX if not present
    file.webkitRelativePath = file.webkitRelativePath || `${path}${file.name}`;
    files.push(file);
  } else if (entry.isDirectory) {
    const reader = entry.createReader();
    const entries = await readAllEntries(reader);
    for (const ent of entries) {
      const nested = await traverseFileTree(ent, `${path}${entry.name}/`);
      files.push(...nested);
    }
  }
  return files;
}

const ResumeFolderDropzone = ({ onFilesSelected }) => {
  const inputRef = useRef(null);
  const [allFiles, setAllFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const totalSize = useMemo(
    () => allFiles.reduce((acc, f) => acc + (f.size || 0), 0),
    [allFiles]
  );

  const addFiles = useCallback(
    (files) => {
      // Filter duplicates by webkitRelativePath + name + size
      const existingKeys = new Set(
        allFiles.map((f) => `${f.webkitRelativePath || f.name}|${f.size}`)
      );
      const next = [];
      for (const f of files) {
        if (!isSupported(f)) continue;
        const key = `${f.webkitRelativePath || f.name}|${f.size}`;
        if (!existingKeys.has(key)) next.push(f);
      }
      if (next.length) setAllFiles((prev) => [...prev, ...next]);
    },
    [allFiles]
  );

  const onFolderInput = useCallback(
    (e) => {
      const list = Array.from(e.target.files || []);
      addFiles(list);
    },
    [addFiles]
  );

  const onDrop = useCallback(
    async (e) => {
      e.preventDefault();
      setIsDragging(false);
      const dt = e.dataTransfer;
      const collected = [];
      if (dt.items && dt.items.length && dt.items[0].webkitGetAsEntry) {
        for (const item of dt.items) {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            const files = await traverseFileTree(entry);
            collected.push(...files);
          }
        }
      } else if (dt.files && dt.files.length) {
        collected.push(...Array.from(dt.files));
      }
      addFiles(collected);
    },
    [addFiles]
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    // Ignore if leaving a child element
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false);
  }, []);

  const clearAll = useCallback(() => setAllFiles([]), []);

  const proceed = useCallback(() => {
    if (onFilesSelected) onFilesSelected(allFiles);
    // For now, just save a summary JSON as a demo
    const summary = allFiles.map((f) => ({
      name: f.name,
      path: f.webkitRelativePath || f.name,
      size: f.size,
    }));
    const blob = new Blob([JSON.stringify(summary, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-import-summary.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [allFiles, onFilesSelected]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          Import Candidate Resumes
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Drag and drop a folder with all resumes, or choose a folder.
          Supported: PDF, DOC, DOCX, TXT, RTF
        </p>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`rounded-2xl border ${
          isDragging
            ? "border-emerald-400 bg-emerald-400/5"
            : "border-white/10 bg-white/5"
        } p-8 transition-colors`}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <span className="text-emerald-400 text-xl">📁</span>
          </div>
          <div className="text-white font-medium">
            Drop your resume folder here
          </div>
          <div className="text-gray-400 text-sm">or</div>
          <button
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
          >
            Choose Folder
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            /* @ts-ignore */
            webkitdirectory=""
            /* @ts-ignore */
            directory=""
            className="hidden"
            onChange={onFolderInput}
          />
        </div>
      </div>

      {allFiles.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div className="text-gray-300 text-sm">
              <span className="text-white font-medium">{allFiles.length}</span>{" "}
              files • {bytesToReadable(totalSize)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearAll}
                className="px-3 py-2 rounded-md text-sm bg-white/5 hover:bg-white/10 text-gray-300"
              >
                Clear
              </button>
              <button
                onClick={proceed}
                className="px-3 py-2 rounded-md text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Proceed
              </button>
            </div>
          </div>

          <div className="mt-4 max-h-72 overflow-auto rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white/5 text-gray-400">
                <tr>
                  <th className="px-4 py-2 font-medium">File</th>
                  <th className="px-4 py-2 font-medium w-32">Size</th>
                </tr>
              </thead>
              <tbody>
                {allFiles.map((f, idx) => (
                  <tr
                    key={`${f.name}-${idx}`}
                    className="border-t border-white/5"
                  >
                    <td className="px-4 py-2 text-gray-200 truncate">
                      {f.webkitRelativePath || f.name}
                    </td>
                    <td className="px-4 py-2 text-gray-400">
                      {bytesToReadable(f.size)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeFolderDropzone;
