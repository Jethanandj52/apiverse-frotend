import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FiSend, FiPlus, FiCopy, FiClock } from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Nav from "../home/Nav";
import SideBar from "../home/SideBar";
import { useNavigate } from "react-router-dom";

const Gemini = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [sideBar, setSidebar] = useState(true);
  const [historyModal, setHistoryModal] = useState(false); // Mobile/Tablet history modal
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [responseText, setResponseText] = useState("");
  const scrollRef = useRef(null);
  const typingRef = useRef(true);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) navigate("/");
  }, [userId, navigate]);

  const fetchChats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/ai/history/${userId}`);
      setChats(res.data);
      localStorage.setItem("chats", JSON.stringify(res.data));
    } catch (err) {
      const local = localStorage.getItem("chats");
      if (local) setChats(JSON.parse(local));
    }
  };

  const loadChat = async (chatId) => {
    try {
      const res = await axios.get(`${BASE_URL}/ai/chat/${chatId}`);
      setActiveChat(res.data);
      setResponseText("");
      setHistoryModal(false); // Close modal on selection
    } catch (err) {
      console.error("Error loading chat:", err);
    }
  };

const handleSend = async () => {
  if (!prompt.trim()) return;
  try {
    setLoading(true);
    setError("");
    setIsTyping(true);
    setResponseText("");

    const res = await axios.post(`${BASE_URL}/ai/gemini`, {
      prompt,
      userId,
      chatId: activeChat?._id || null,
      model: "deepseek-r1-lite",
    });

    const { chatId, response } = res.data;
    setPrompt("");

    // Directly set response without typing effect
    setResponseText(response);

    setIsTyping(false);
    setLoading(false);

    fetchChats();
    loadChat(chatId);
  } catch (err) {
    setError("⚠️ Server Error: " + (err.response?.data?.message || err.message));
    setLoading(false);
    setIsTyping(false);
  }
};


  const copyToClipboard = (code) => navigator.clipboard.writeText(code);

  const renderResponse = (text) => {
    const codeRegex = /```(\w*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(text)) !== null) {
      const [block, lang, code] = match;
      const start = match.index;

      if (lastIndex < start) {
        parts.push(
          <div key={`text-${start}`} className="prose prose-slate dark:prose-invert max-w-none mb-4 break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {text.slice(lastIndex, start)}
            </ReactMarkdown>
          </div>
        );
      }

      parts.push(
        <div key={`code-${start}`} className="relative mb-6 rounded-lg overflow-hidden shadow-lg border dark:border-gray-700">
          <button
            onClick={() => copyToClipboard(code.trim())}
            className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs rounded-lg flex items-center gap-1"
          >
            <FiCopy /> Copy
          </button>
          <SyntaxHighlighter language={lang || "javascript"} style={vscDarkPlus}>
            {code.trim()}
          </SyntaxHighlighter>
        </div>
      );
      lastIndex = match.index + block.length;
    }

    if (lastIndex < text.length) {
      parts.push(
        <div key="end" className="prose prose-slate dark:prose-invert max-w-none break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {text.slice(lastIndex)}
          </ReactMarkdown>
        </div>
      );
    }
    return parts;
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [responseText, activeChat]);

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Nav sideBar={sideBar} setSidebar={setSidebar} />

      <div className="flex flex-1 overflow-hidden pt-[55px]">
        <SideBar sideBar={sideBar} />

        {/* Main Chat Area */}
        <div className="pl-15 flex flex-1 flex-col md:flex-row transition-all duration-300">
          {/* Desktop Sidebar */}
          <div className="hidden md:flex flex-col w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-lg">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gradient-to-r from-blue-600 to-green-500 text-white">
              <h2 className="text-lg font-semibold">Chat History</h2>
              <button
                onClick={() => setActiveChat(null)}
                className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-lg"
              >
                <FiPlus />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chats.length > 0 ? (
                chats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`group p-3 rounded-lg cursor-pointer relative transition-all ${
                      activeChat?._id === chat._id
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => loadChat(chat._id)}
                  >
                    <p className="font-medium truncate">{chat.title}</p>
                    <p className="text-xs opacity-70">{new Date(chat.updatedAt).toLocaleString()}</p>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm("Delete this chat?")) {
                          await axios.delete(`${BASE_URL}/ai/chat/${chat._id}`);
                          setChats((prev) => prev.filter((c) => c._id !== chat._id));
                          if (activeChat?._id === chat._id) setActiveChat(null);
                        }
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-sm px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center text-sm mt-6 italic">No previous chats ✨</p>
              )}
            </div>
          </div>

          {/* Mobile/Tablet History Icon */}
          <div className="md:hidden fixed bottom-24 right-4 z-50">
            <button
              onClick={() => setHistoryModal(true)}
              className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all"
            >
              <FiClock size={24} />
            </button>
          </div>

          {/* History Modal */}
          {historyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white dark:bg-gray-800 rounded-xl w-11/12 max-w-md p-4 shadow-lg relative">
                <h2 className="text-lg font-semibold text-center mb-4 text-gray-800 dark:text-gray-100">
                  Chat History
                </h2>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {chats.length > 0 ? (
                    chats.map((chat) => (
                      <div
                        key={chat._id}
                        className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                        onClick={() => loadChat(chat._id)}
                      >
                        <p className="font-medium truncate">{chat.title}</p>
                        <p className="text-xs opacity-70">{new Date(chat.updatedAt).toLocaleString()}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">No previous chats ✨</p>
                  )}
                </div>
                <button
                  onClick={() => setHistoryModal(false)}
                  className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  ✖️
                </button>
              </div>
            </div>
          )}

          {/* Chat Messages Area */}
          <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 w-full max-w-5xl mx-auto"
            >
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                  Gemini AI Assistant
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base italic">
                  “Ask anything — from coding help to creative writing ✨”
                </p>
              </div>

              {/* Error */}
              {error && (
                <p className="text-red-500 mb-4 text-center font-medium bg-red-50 dark:bg-red-900/30 py-2 rounded-lg">
                  {error}
                </p>
              )}

              {/* Active Chat Messages */}
              {activeChat && activeChat.messages?.length > 0 ? (
                activeChat.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex mb-5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`p-4 sm:p-5 rounded-2xl shadow-md max-w-[90%] sm:max-w-[70%] break-words ${
                        msg.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-white dark:bg-gray-800 dark:text-gray-100 border dark:border-gray-700"
                      }`}
                    >
                      {renderResponse(msg.content)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center mt-10 sm:mt-16">
                  <p className="text-gray-500 text-base sm:text-lg italic">
                    💬 Start a new chat and explore the power of AI!
                  </p>
                </div>
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="mt-4 text-gray-500 flex items-center gap-2 justify-center text-sm sm:text-base">
                  <ImSpinner2 className="animate-spin" /> Gemini is thinking...
                </div>
              )}

              {/* AI Response */}
              {responseText && (
                <div className="p-4 sm:p-5 bg-white dark:bg-gray-800 mt-6 rounded-xl border dark:border-gray-700 shadow-md break-words">
                  {renderResponse(responseText)}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 sticky bottom-0 z-20">
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 max-w-5xl mx-auto">
                <textarea
                  rows={2}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type your message..."
                  className=" flex-1 p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-xl resize-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder:italic focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:opacity-90 text-white py-2 sm:py-3 px-6 rounded-xl shadow-lg disabled:opacity-50 transition-all text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <ImSpinner2 className="animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <FiSend /> Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gemini;
