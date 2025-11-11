import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatbotAssistant({ onRecommendVideos, userId }) {
  const LOCAL_STORAGE_KEY = `rehabfit-chat-history-${userId || "guest"}`;
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
  }, [messages, LOCAL_STORAGE_KEY]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const userMessage = { sender: "user", text: input };
    setMessages((msgs) => [...msgs, userMessage]);

    const currentInput = input;
    setInput("");

    try {
      // Upsert chat to Pinecone
      await API.post("/api/rag/upsert-chat", { message: currentInput });
    } catch (e) {
      console.error("Error upserting chat:", e);
    }

    try {
      // Use non-streaming endpoint
      const response = await API.post("/api/rag/chat/simple", { question: currentInput });
      const botMessage = response.data.answer;

      setMessages((msgs) => [...msgs, { sender: "bot", text: botMessage }]);
      
      // Extract keywords and fetch videos
      if (onRecommendVideos) {
        fetchVideosFromResponse(botMessage);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((msgs) => [
        ...msgs,
        { sender: "bot", text: "Sorry, I couldn't process your request." },
      ]);
    }
    
    setLoading(false);
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const fetchVideosFromResponse = async (botResponse) => {
    try {
      const keywords = extractExerciseKeywords(botResponse);
      if (!keywords.length) return;
      const allVideos = [];

      for (const keyword of keywords.slice(0, 3)) {
        const response = await API.get(
          `/api/rag/test-youtube?query=${encodeURIComponent(keyword)}`
        );
        if (response.data.urls?.length) allVideos.push(...response.data.urls.slice(0, 3));
      }

      if (allVideos.length > 0) onRecommendVideos(allVideos);
    } catch (e) {
      console.error("Error fetching videos:", e);
    }
  };

  const extractExerciseKeywords = (text) => {
    const keywords = [];
    const patterns = [
      /\b(stretch|stretching|stretches)\b/gi,
      /\b(strengthen|strengthening|strength)\b/gi,
      /\b(exercise|exercises|workout)\b/gi,
      /\b(mobility|range of motion|ROM)\b/gi,
      /\b(physical therapy|physiotherapy|rehab)\b/gi,
      /\b(core|back|shoulder|knee|hip|ankle|wrist|neck)\s+(exercise|strengthening|mobility|rehab)\b/gi,
      /\b(lower back|upper back|lumbar|cervical)\s+(exercise|stretch|strengthen)\b/gi,
      /\b(planks?|bridges?|squats?|lunges?|deadlifts?)\b/gi,
    ];
    patterns.forEach((p) => {
      const matches = text.match(p);
      if (matches)
        matches.forEach((m) => {
          const kw = m.trim().toLowerCase();
          if (!keywords.includes(kw)) keywords.push(kw + " exercise");
        });
    });
    return keywords;
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-xl mt-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-2xl text-teal-700 dark:text-teal-300">
          🤖 AI Chatbot Assistant
        </h2>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg"
          >
            Clear History
          </button>
        )}
      </div>

      <div className="mb-4 h-[600px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/80 shadow-inner">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 italic mt-12">
            Start the conversation! Ask about your recovery, symptoms, or exercises.
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-3 flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-md ${
                m.sender === "user"
                  ? "bg-gradient-to-tr from-teal-600 to-teal-400 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              <div className="font-bold mb-1 text-sm opacity-70">
                {m.sender === "user" ? "You" : "Bot"}
              </div>
              {m.sender === "bot" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.text}
                </ReactMarkdown>
              ) : (
                <div className="whitespace-pre-wrap break-words">{m.text}</div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-gray-400 text-center mt-2 animate-pulse">
            Bot is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex mt-2 gap-2">
        <input
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2 bg-white/90 text-gray-900 focus:ring-2 focus:ring-teal-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about your recovery, symptoms, or exercises..."
        />
        <button
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl font-semibold shadow disabled:opacity-60"
          onClick={sendMessage}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
