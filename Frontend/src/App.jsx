import { useState, useRef, useEffect } from "react";
import UploadPanel from "./components/UploadPanel";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import "./App.css";

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [filename, setFilename] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle | uploading | ready
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUpload = async (file) => {
    setUploadStatus("uploading");
    setMessages([]);
    setSessionId(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }

      const data = await res.json();
      setSessionId(data.session_id);
      setFilename(data.filename);
      setUploadStatus("ready");
      setMessages([
        {
          role: "assistant",
          content: `📄 **${data.filename}** loaded successfully! (${data.chunks} chunks indexed)\n\nAsk me anything about this document.`,
        },
      ]);
    } catch (err) {
      setUploadStatus("idle");
      alert("Error: " + err.message);
    }
  };

  const handleSend = async (text) => {
    if (!sessionId || !text.trim()) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Chat error");
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error: " + err.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    if (sessionId) {
      fetch(`http://localhost:8000/session/${sessionId}`, { method: "DELETE" });
    }
    setSessionId(null);
    setFilename("");
    setMessages([]);
    setUploadStatus("idle");
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">DocMind</span>
        </div>

        <UploadPanel
          uploadStatus={uploadStatus}
          filename={filename}
          onUpload={handleUpload}
          onNewChat={handleNewChat}
        />

        <div className="sidebar-footer">
          <div className="model-badge">GPT-3.5-turbo · RAG + Memory</div>
        </div>
      </aside>

      <main className="chat-area">
        <header className="chat-header">
          <div className="header-title">
            {filename ? (
              <>
                <span className="header-icon">📄</span>
                <span>{filename}</span>
              </>
            ) : (
              <span className="header-placeholder">No document loaded</span>
            )}
          </div>
          {messages.length > 1 && (
            <button className="clear-btn" onClick={handleNewChat}>
              New Chat
            </button>
          )}
        </header>

        <ChatWindow messages={messages} loading={loading} bottomRef={bottomRef} />
        <ChatInput
          onSend={handleSend}
          disabled={!sessionId || loading}
          loading={loading}
        />
      </main>
    </div>
  );
}
