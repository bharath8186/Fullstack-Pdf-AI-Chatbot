import "./ChatWindow.css";

function parseMarkdown(text) {
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Inline code
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Line breaks
  text = text.replace(/\n/g, "<br/>");
  return text;
}

export default function ChatWindow({ messages, loading, bottomRef }) {
  if (messages.length === 0) {
    return (
      <div className="chat-window empty-state">
        <div className="empty-inner">
          <div className="empty-hex">⬡</div>
          <div className="empty-title">DocMind</div>
          <div className="empty-sub">Upload a PDF to start chatting</div>
          <div className="empty-tags">
            <span>RAG-powered</span>
            <span>Chat Memory</span>
            <span>GPT-3.5</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`msg-row ${msg.role}`}>
            <div className="avatar">{msg.role === "user" ? "U" : "AI"}</div>
            <div
              className="bubble"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
            />
          </div>
        ))}

        {loading && (
          <div className="msg-row assistant">
            <div className="avatar">AI</div>
            <div className="bubble thinking">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
