import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FiSend, FiPlus, FiCopy } from "react-icons/fi";
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
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [responseText, setResponseText] = useState("");
  const scrollRef = useRef(null);
  const typingRef = useRef(true);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.BASE_URL;

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) navigate("/");
  }, [userId, navigate]);

  // Fetch chat history
  const fetchChats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/ai/history/${userId}`);
      setChats(res.data);
      localStorage.setItem("chats", JSON.stringify(res.data));
    } catch (err) {
      console.error("Error fetching chats:", err);
      const local = localStorage.getItem("chats");
      if (local) setChats(JSON.parse(local));
    }
  };

  // Load specific chat
  const loadChat = async (chatId) => {
    try {
      const res = await axios.get(`${BASE_URL}/ai/chat/${chatId}`);
      setActiveChat(res.data);
      setResponseText("");
    } catch (err) {
      console.error("Error loading chat:", err);
    }
  };

  // Send prompt
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
      });

      const { chatId, response } = res.data;
      setPrompt("");

      let index = 0;
      typingRef.current = true;
      setActiveChat({ _id: chatId });
      const typeText = () => {
        if (!typingRef.current) return;
        if (index < response.length) {
          setResponseText((prev) => prev + response.charAt(index));
          index++;
          setTimeout(typeText, 5);
        } else {
          setIsTyping(false);
          setLoading(false);
          fetchChats();
          loadChat(chatId);
        }
      };
      typeText();
    } catch (err) {
      setError("⚠️ Server Error: " + (err.response?.data?.message || err.message));
      setLoading(false);
      setIsTyping(false);
    }
  };

  const copyToClipboard = (code) => navigator.clipboard.writeText(code);

  // Markdown with Prose Styling
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
          <div
            key={`text-${start}`}
            className="prose prose-slate dark:prose-invert max-w-none mb-4 leading-relaxed 
            prose-h1:text-2xl prose-h1:font-bold prose-h1:text-blue-600 dark:prose-h1:text-blue-400
            prose-h2:text-xl prose-h2:font-semibold prose-h2:text-green-600 dark:prose-h2:text-green-400
            prose-p:text-gray-800 dark:prose-p:text-gray-200
            prose-strong:text-blue-700 dark:prose-strong:text-blue-300
            prose-li:marker:text-blue-500 prose-a:text-blue-600 hover:prose-a:underline
            prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-gray-800 prose-blockquote:italic prose-blockquote:rounded-lg prose-blockquote:p-3"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {text.slice(lastIndex, start)}
            </ReactMarkdown>
          </div>
        );
      }

      parts.push(
        <div key={`code-${start}`} className="relative mb-6 rounded-lg overflow-hidden shadow-lg border border-gray-300 dark:border-gray-700">
          <button
            onClick={() => copyToClipboard(code.trim())}
            className="absolute top-2 right-2 bg-gradient-to-r from-blue-600 to-green-600 hover:opacity-90 text-white px-3 py-1 text-xs rounded-lg shadow-md"
          >
            <FiCopy className="inline mr-1" /> Copy
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
        <div
          key="end"
          className="prose prose-slate dark:prose-invert max-w-none leading-relaxed 
          prose-h1:text-2xl prose-h1:font-bold prose-h1:text-blue-600 dark:prose-h1:text-blue-400
          prose-h2:text-xl prose-h2:font-semibold prose-h2:text-green-600 dark:prose-h2:text-green-400
          prose-p:text-gray-800 dark:prose-p:text-gray-200
          prose-strong:text-blue-700 dark:prose-strong:text-blue-300
          prose-li:marker:text-blue-500 prose-a:text-blue-600 hover:prose-a:underline
          prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-gray-800 prose-blockquote:italic prose-blockquote:rounded-lg prose-blockquote:p-3"
        >
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

        <div
          className={`flex w-full h-full transition-all duration-300 ${
            sideBar ? "pl-[230px]" : "pl-[60px]"
          }`}
        >
          {/* Sidebar */}
         {/* Chat History Sidebar */}
<div className="hidden md:flex flex-col w-72 bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-lg">
  <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-lg">
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
          className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 relative ${
            activeChat?._id === chat._id
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
          }`}
        >
          <div onClick={() => loadChat(chat._id)}>
            <p className="font-medium truncate">{chat.title}</p>
            <p className="text-xs opacity-75">
              {new Date(chat.updatedAt).toLocaleString()}
            </p>
          </div>

          {/* 🗑️ Delete Button (visible on hover) */}
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (window.confirm("Delete this chat?")) {
                try {
                  await axios.delete(`/api/ai/chat/${chat._id}`);
                  setChats((prev) => prev.filter((c) => c._id !== chat._id));
                  if (activeChat?._id === chat._id) setActiveChat(null);
                } catch (err) {
                  alert("Failed to delete chat");
                }
              }
            }}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-sm px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md"
          >
            🗑️
          </button>
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-center text-sm mt-6 italic">
        No previous chats found ✨
      </p>
    )}
  </div>
</div>

          {/* Chat Section */}
          <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-6 py-8 max-w-4xl mx-auto w-full"
            >
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                  Gemini AI Assistant
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2 italic">
                  “Ask anything — from coding help to creative writing ✨”
                </p>
              </div>

              {error && (
                <p className="text-red-500 mb-4 text-center font-medium bg-red-50 dark:bg-red-900/30 py-2 rounded-lg">
                  {error}
                </p>
              )}

              {activeChat && activeChat.messages?.length > 0 ? (
                activeChat.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex mb-5 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-4 rounded-2xl shadow-md max-w-[80%] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-blue-500 text-white w-[40%] "
                          : "bg-white dark:bg-gray-800 dark:text-gray-100 border dark:border-gray-700"
                      }`}
                    >
                      {renderResponse(msg.content)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center mt-16">
                  <p className="text-gray-500 text-lg italic">
                    💬 Start a new chat and explore the power of AI!
                  </p>
                </div>
              )}

              {isTyping && (
                <div className="mt-4 text-gray-500 flex items-center gap-2 justify-center">
                  <ImSpinner2 className="animate-spin" /> <span>Gemini is thinking...</span>
                </div>
              )}

              {responseText && (
                <div className="p-5 bg-white dark:bg-gray-800 mt-6 rounded-xl border dark:border-gray-700 shadow-md">
                  {renderResponse(responseText)}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-6 py-4 sticky bottom-0 shadow-lg">
              <div className="flex items-center gap-3 max-w-4xl mx-auto">
                <textarea
                  rows={2}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder:italic focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:opacity-90 text-white py-3 px-6 rounded-xl shadow-lg disabled:opacity-50 transition-all duration-200"
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
