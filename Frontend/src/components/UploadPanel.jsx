import { useRef } from "react";
import "./UploadPanel.css";

export default function UploadPanel({ uploadStatus, filename, onUpload, onNewChat }) {
  const fileRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") onUpload(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  return (
    <div className="upload-panel">
      <div className="up-label">Document</div>

      {uploadStatus === "idle" && (
        <div
          className="drop-zone"
          onClick={() => fileRef.current.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="drop-icon">⬆</div>
          <div className="drop-text">Drop PDF here</div>
          <div className="drop-sub">or click to browse</div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            hidden
            onChange={handleChange}
          />
        </div>
      )}

      {uploadStatus === "uploading" && (
        <div className="status-box uploading">
          <div className="spinner" />
          <span>Processing PDF…</span>
        </div>
      )}

      {uploadStatus === "ready" && (
        <div className="status-box ready">
          <div className="ready-row">
            <span className="ready-icon">✓</span>
            <span className="ready-name">{filename}</span>
          </div>
          <button className="new-doc-btn" onClick={onNewChat}>
            Upload new PDF
          </button>
        </div>
      )}
    </div>
  );
}
