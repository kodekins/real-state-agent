import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi, I’m AP-Prime, your personal Toronto real estate assistant! What type of property are you looking for?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const iframeRef = useRef(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send postMessage to HeyGen iframe to start speaking automatically
  useEffect(() => {
  if (!iframeRef.current) return;

  const host = "https://labs.heygen.com";

  const startAvatar = () => {
    const iframeWindow = iframeRef.current.contentWindow;
    iframeWindow.postMessage({ type: "streaming-embed", action: "init" }, host);
    iframeWindow.postMessage({ type: "streaming-embed", action: "show" }, host);
  };

  iframeRef.current.addEventListener("load", startAvatar);
  return () => {
    iframeRef.current.removeEventListener("load", startAvatar);
  };
}, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      const assistantReply = data?.reply || "Sorry, I didn't catch that.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantReply },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Oops, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 p-6 gap-6">
      {/* Left Column */}
      <div className="flex flex-col flex-[2] items-center mt-6">
        {/* Title */}
        <h1 className="mb-6 text-2xl font-bold text-gray-800 text-center">
          AP-Prime Your Personal Real Estate Assistant
        </h1>

        {/* HeyGen Avatar */}
        <div className="flex justify-center mb-6 w-full max-w-lg h-48 lg:h-80">
          <iframe
            ref={iframeRef}
            src="https://labs.heygen.com/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJQZWRyb19DaGFpcl9TaXR0aW5nX3B1YmxpYyIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3YzLzkyZGU3OWU1MzNhODQyMWJiODZkYTYzYTBlNWViMTJmXzU3MDEwL3ByZXZpZXdfdGFyZ2V0LndlYnAiLCJuZWVkUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6IjAzNzIwN2YyNDc2NzQ0MGY5ZmQ0YjI3MTNmZDQzMmZiIiwidXNlcm5hbWUiOiJiYTA5Yjc4ZDg0NDM0YWExYjBjOWE0ZGE0MmJlOWJlYSJ9&inIFrame=1&autoplay=1"
            title="HeyGen Avatar"
            className="w-full h-full rounded-lg shadow-lg"
            allow="microphone; autoplay"
          />
        </div>

        {/* Chat Box */}
        <div className="mt-3 w-full max-w-lg bg-white rounded-2xl shadow-md flex flex-col">
          <div
            className="overflow-y-auto p-4 space-y-2"
            style={{ height: "184px" }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <span
                  className={`px-4 py-2 rounded-2xl max-w-xs whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {m.content}
                </span>
              </div>
            ))}
            {loading && (
              <div className="text-gray-400 text-sm">Assistant is typing...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex border-t">
            <input
              className="flex-1 p-3 rounded-bl-2xl outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about homes..."
              aria-label="Chat input"
            />
            <button
              className="bg-blue-600 text-white px-6 rounded-br-2xl disabled:opacity-60"
              onClick={sendMessage}
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-col flex-[1] mt-8">
        <h2 className="text-lg font-semibold mb-3">🏡 Listings</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-medium">123 Main St, Toronto</h3>
            <p className="text-sm text-gray-500">3 Bed · 2 Bath · $850,000</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-medium">456 Queen St, Toronto</h3>
            <p className="text-sm text-gray-500">2 Bed · 1 Bath · $650,000</p>
          </div>
        </div>
      </div>
    </div>
  );
}
