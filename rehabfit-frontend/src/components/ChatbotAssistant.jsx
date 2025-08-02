import { useState, useEffect } from "react";
import API from "../api/axios";

// const LOCAL_STORAGE_KEY = "rehabfit-chat-history";

export default function ChatbotAssistant({ onRecommendVideos, userId }) {
  const LOCAL_STORAGE_KEY = `rehabfit-chat-history-${userId || "guest"}`;
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
  }, [messages, LOCAL_STORAGE_KEY]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const userMessage = { sender: "user", text: input };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput("");

    try {
      await API.post("/api/rag/upsert-chat", { message: input });
    } catch (e) {}

    try {
      const res = await API.post("/api/rag/chat", { question: input });
      setMessages((msgs) => [...msgs, { sender: "bot", text: res.data.answer }]);
      // If LLM response includes recommended videos, update them
      if (res.data.videos && onRecommendVideos) {
        onRecommendVideos(res.data.videos);
      }
    } catch {
      setMessages((msgs) => [
        ...msgs,
        { sender: "bot", text: "Sorry, I couldn't process your request." },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-xl mt-8 max-w-2xl mx-auto transition-colors duration-300">
      <h2 className="font-bold mb-4 text-2xl text-center text-teal-700 dark:text-teal-300 tracking-tight">
        🤖 AI Chatbot Assistant
      </h2>
      <div className="mb-4 h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/80 transition-colors duration-300 shadow-inner">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-500 italic mt-12">
            Start the conversation! Ask about your recovery, symptoms, or exercises.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-3 flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-md text-base break-words ${
                m.sender === "user"
                  ? "bg-gradient-to-tr from-teal-600 to-teal-400 text-white dark:from-teal-700 dark:to-teal-500"
                  : "bg-gradient-to-tr from-blue-600 to-blue-400 text-white dark:from-blue-800 dark:to-blue-600"
              }`}
            >
              <b className="mr-1">{m.sender === "user" ? "You" : "Bot"}:</b> {m.text}
            </span>
          </div>
        ))}
        {loading && (
          <div className="text-gray-400 dark:text-gray-500 text-center mt-2 animate-pulse">
            Bot is typing...
          </div>
        )}
      </div>
      <div className="flex mt-2 gap-2">
        <input
          className="flex-1 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-300"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Ask about your recovery, symptoms, or exercises..."
        />
        <button
          className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white px-6 py-2 rounded-xl font-semibold shadow transition disabled:opacity-60"
          onClick={sendMessage}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}