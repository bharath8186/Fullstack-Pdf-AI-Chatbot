import { useState } from "react";
import "./ChatInput.css";

export default function ChatInput({ onSend, disabled, loading }) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="input-bar">
      <div className={`input-wrap ${disabled ? "disabled" : ""}`}>
        <textarea
          className="chat-textarea"
          placeholder={disabled ? "Upload a PDF to start chatting…" : "Ask a question about your document…"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          disabled={disabled}
          rows={1}
        />
        <button
          className={`send-btn ${loading ? "loading" : ""}`}
          onClick={submit}
          disabled={disabled || !value.trim()}
        >
          {loading ? <span className="send-spinner" /> : <SendIcon />}
        </button>
      </div>
      <div className="input-hint">Enter to send · Shift+Enter for new line</div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
