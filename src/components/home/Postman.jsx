import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../home/Nav";
import SideBar from "./SideBar";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-monokai";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate } from "react-router-dom";

const Postman = () => {
  const [sideBar, setSidebar] = useState(true);
  const [token, setToken] = useState("");
  const [autoSaveToken, setAutoSaveToken] = useState(true);
  const [showTokenPopup, setShowTokenPopup] = useState(false);
  const [requests, setRequests] = useState([
    { id: 1, method: "GET", url: "", body: "", response: null, loading: false },
  ]);
  const [activeTab, setActiveTab] = useState(1);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [shareGroupId, setShareGroupId] = useState("");
  const [shareTitle, setShareTitle] = useState("");
  const [sharing, setSharing] = useState(false);
  const navigate = useNavigate();

  const TOKEN_KEY = "api_tester_jwt";
  const userId = localStorage.getItem("userId");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL.replace("http://", "https://");

  // ✅ Redirect if user not logged in
  useEffect(() => {
    if (!userId) navigate("/");
  }, [userId, navigate]);

  // ✅ Load saved token + user history
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
    fetchHistory();

    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get("sharedId");
    if (sharedId) fetchSharedAndPopulate(sharedId);
  }, []);

  useEffect(() => {
    if (showShareModal) fetchMyGroups();
  }, [showShareModal]);

  // ✅ Save token locally
  const saveToken = (tkn) => {
    setToken(tkn);
    if (tkn) localStorage.setItem(TOKEN_KEY, tkn);
    else localStorage.removeItem(TOKEN_KEY);
  };

  const clearToken = () => saveToken("");

  const current = requests.find((req) => req.id === activeTab);

  const updateRequest = (id, updates) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, ...updates } : req))
    );
  };

  const addRequest = () => {
    const newId = Date.now();
    setRequests((prev) => [
      ...prev,
      { id: newId, method: "GET", url: "", body: "", response: null, loading: false },
    ]);
    setActiveTab(newId);
  };

  const closeRequest = (id) => {
    const newReqs = requests.filter((req) => req.id !== id);
    setRequests(newReqs);
    if (activeTab === id && newReqs.length > 0) setActiveTab(newReqs[0].id);
    else if (newReqs.length === 0) addRequest();
  };

  // ✅ Fetch user's history
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/requests/myRequests`, {
        withCredentials: true,
      });
      if (res.data && res.data.length > 0) {
        const historyReqs = res.data.map((r) => ({
          id: r._id || Date.now(),
          method: r.method || "GET",
          url: r.url || "",
          body:
            typeof r.body === "string"
              ? r.body
              : JSON.stringify(r.body || "", null, 2),
          response: r.response || null,
          loading: false,
        }));
        setRequests(historyReqs);
        setActiveTab(historyReqs[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  // ✅ Save request to backend
  const saveRequestToHistory = async (reqData) => {
    try {
      await axios.post(`${BASE_URL}/requests/save`, reqData, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Failed to save request:", err);
    }
  };

  // ✅ Send API Request (HTTPS-safe)
  const sendRequest = async () => {
    if (!current || !current.url) return;
    updateRequest(activeTab, { loading: true, response: null });
    setAiSuggestion("");
    setLoadingAi(true);

    // Force HTTPS if user typed HTTP manually
   const apiUrl = current.url.startsWith("http")
  ? current.url // full URL already hai
  : `${BASE_URL}${current.url.startsWith("/") ? "" : "/"}${current.url}`;

    try {
      const res = await axios({
        method: current.method,
        url: apiUrl,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        data: current.method !== "GET" ? tryParseJson(current.body) : undefined,
        withCredentials: true,
        validateStatus: () => true,
      });

      const responseToShow = {
        status: res.status,
        ok: res.status >= 200 && res.status < 300,
        headers: res.headers,
        body: res.data,
      };

      updateRequest(activeTab, { response: responseToShow });

      // ✅ Auto-save token if found
      if (autoSaveToken) {
        const headerAuth =
          res.headers.authorization || res.headers["x-auth-token"];
        if (headerAuth && headerAuth.length > 10) saveToken(headerAuth);
        else if (res.data) {
          const found = findTokenInObject(res.data);
          if (found) saveToken(found);
        }
      }

      // ✅ Save in backend (history)
      await saveRequestToHistory({
        method: current.method,
        url: apiUrl,
        headers: res.config.headers,
        body: tryParseJson(current.body),
        response: responseToShow,
      });

      // ✅ AI Suggestion
      try {
        const aiRes = await axios.post(
          `${BASE_URL}/ai/gemini`,
          {
            prompt: `Analyze this API response and provide suggestions:\n${JSON.stringify(
              res.data,
              null,
              2
            )}`,
            userId: userId || "guest_user",
          },
          { withCredentials: true }
        );

        if (aiRes.data?.response) {
          setAiSuggestion(aiRes.data.response);
        } else {
          setAiSuggestion("⚠️ No suggestion generated by AI.");
        }
      } catch (err) {
        console.error("AI Suggestion Error:", err);
        setAiSuggestion("❌ Failed to get AI suggestion.");
      }
    } catch (err) {
      updateRequest(activeTab, { response: { error: err.message } });
      setAiSuggestion("❌ Request failed. Check your URL or server.");
    } finally {
      updateRequest(activeTab, { loading: false });
      setLoadingAi(false);
    }
  };

  // ✅ Utilities
  const tryParseJson = (text) => {
    if (!text) return text;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  const findTokenInObject = (obj) => {
    if (!obj || typeof obj !== "object") return null;
    const keys = ["token", "accessToken", "authToken", "jwt", "access_token"];
    for (const k of keys)
      if (k in obj && typeof obj[k] === "string" && obj[k].length > 10)
        return obj[k];
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === "object") {
        const found = findTokenInObject(val);
        if (found) return found;
      }
    }
    return null;
  };

  // ✅ Fetch Groups
  const fetchMyGroups = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/groups/myGroups`, {
        withCredentials: true,
      });
      setGroups(res.data);
    } catch {
      toast.error("Failed to fetch your groups");
    }
  };

  const openShareModal = () => {
    if (!current) return toast.error("No active request to share");
    setShareGroupId("");
    setShareTitle(`${current.method} ${current.url}`.slice(0, 80));
    setShowShareModal(true);
  };

  // ✅ Share Request
  const shareToGroup = async (e) => {
    e && e.preventDefault();
    if (!shareGroupId) return toast.error("Select group to share into");
    if (!current) return toast.error("No request to share");
    setSharing(true);

    try {
      const payload = {
        title: shareTitle,
        request: {
          method: current.method,
          url: current.url,
          body: current.body || null,
          category: "Postman",
        },
        response: current.response || null,
      };

      const res = await axios.post(
        `${BASE_URL}/sharedRequests/groups/${shareGroupId}/share`,
        payload,
        { withCredentials: true }
      );
      const shareId = res.data.shareId;
      const link = shareId
        ? `${window.location.origin}/postman?sharedId=${shareId}`
        : "";
      if (link) await navigator.clipboard.writeText(link);
      toast.success("Shared to group! Link copied to clipboard");
      setShowShareModal(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to share request");
    } finally {
      setSharing(false);
    }
  };

  // ✅ Fetch Shared Request
  const fetchSharedAndPopulate = async (sharedId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/sharedRequests/${sharedId}`,
        { withCredentials: true }
      );
      const shared = res.data;
      if (!shared || !shared.request) return;

      const newId = Date.now();
      const newReq = {
        id: newId,
        method: shared.request.method || "GET",
        url: shared.request.url || "",
        body:
          typeof shared.request.body === "string"
            ? shared.request.body
            : JSON.stringify(shared.request.body || "", null, 2),
        response: shared.response || null,
        loading: false,
      };

      setRequests((prev) => [...prev, newReq]);
      setActiveTab(newId);
      toast.info(`Loaded shared request from ${shared.sender?.firstName || "someone"}`);
    } catch {
      toast.error("Failed to load shared request");
    }
  };


  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white p-10">
      <Nav sideBar={sideBar} setSidebar={setSidebar} />
      <SideBar sideBar={sideBar} />

     <div
          className={`pt-[70px] transition-all duration-300 ease-in-out 
          ${sideBar ? "sm:pl-[220px]" : "sm:pl-[60px]"} 
          pl-0 min-h-screen overflow-y-auto p-6`}
        >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.h2 className="text-2xl font-bold text-blue-500 flex items-center gap-2">
            🚀 API Tester
          </motion.h2>
          <div className="flex items-center gap-3">
            <button
              onClick={openShareModal}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
            >
              Share to Group
            </button>
            <button
              onClick={() => setShowTokenPopup(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-md shadow bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition"
            >
              🔑 Manage Token{" "}
              {token && <span className="w-2 h-2 bg-green-400 rounded-full"></span>}
            </button>
          </div>
        </div>

        {/* Request Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {requests.map((req) => (
            <motion.div
              key={req.id}
              onClick={() => setActiveTab(req.id)}
              className={`px-4 py-2 rounded-t-lg cursor-pointer ${
                activeTab === req.id
                  ? "bg-white dark:bg-gray-800 border border-b-0 shadow"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span className="font-medium mr-2">{req.method}</span>
              <span className="text-xs truncate max-w-[150px] inline-block">
                {req.url ? req.url.replace(/https?:\/\//, "") : "New Request"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeRequest(req.id);
                }}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </motion.div>
          ))}
          <button
            onClick={addRequest}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
          >
            +
          </button>
        </div>

        {/* Active Request */}
        {current && (
          <motion.div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4 shadow-lg">
            <div className="flex gap-2">
              <select
                value={current.method}
                onChange={(e) =>
                  updateRequest(activeTab, { method: e.target.value })
                }
                className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
                <option>PATCH</option>
              </select>
              <input
                type="text"
                placeholder="Enter API URL..."
                value={current.url}
                onChange={(e) => updateRequest(activeTab, { url: e.target.value })}
                className="flex-1 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700"
              />
            </div>

            {current.method !== "GET" && (
              <AceEditor
                mode="json"
                theme="monokai"
                value={current.body}
                onChange={(val) => updateRequest(activeTab, { body: val })}
                fontSize={14}
                width="100%"
                height="200px"
                showPrintMargin={false}
              />
            )}

            <div className="flex gap-2">
              <button
                onClick={sendRequest}
                disabled={current.loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2"
              >
                {current.loading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {current.loading ? "Sending..." : "Send"}
              </button>
              <button
                onClick={openShareModal}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md"
              >
                Share
              </button>
              <button
                onClick={() =>
                  current.url && navigator.clipboard.writeText(current.url)
                }
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md"
              >
                Copy URL
              </button>
            </div>
          </motion.div>
        )}

        {/* Response */}
        {current?.response && (
          <div className="mt-6 bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 rounded-xl p-4 shadow-inner">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Response:
              </h3>
              <div className="text-xs text-gray-800 dark:text-gray-300">
                Status: {current.response.status} • OK:{" "}
                {String(current.response.ok)}
              </div>
            </div>
            <pre className="whitespace-pre-wrap break-words text-sm">
              {JSON.stringify(current.response, null, 2)}
            </pre>
          </div>
        )}

        {/* AI Suggestion */}
      {aiSuggestion && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-6 bg-gradient-to-r from-yellow-50 via-white to-yellow-100 dark:from-yellow-900/20 dark:via-gray-800 dark:to-gray-900 p-5 rounded-xl border-l-8 border-yellow-400 shadow-lg"
  >
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-bold text-lg text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
        💡Suggestion
      </h3>
      {loadingAi && (
        <span className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></span>
      )}
    </div>

    {loadingAi ? (
      <p className="text-sm text-gray-600 dark:text-gray-300 italic">
        Analyzing API response and generating insights...
      </p>
    ) : (
      <div
        className="bg-white/80 dark:bg-gray-800/60 rounded-lg p-5 max-h-96 overflow-y-auto text-gray-800 dark:text-gray-100
        prose prose-sm dark:prose-invert"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-4 mb-2" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mt-3 mb-1" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-lg font-semibold text-blue-500 dark:text-blue-300 mt-2 mb-1" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-6 marker:text-yellow-600 dark:marker:text-yellow-400 space-y-1" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal pl-6 marker:text-yellow-600 dark:marker:text-yellow-400 space-y-1" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="leading-relaxed text-gray-800 dark:text-gray-200" {...props} />
            ),
            code: ({ node, inline, className, children, ...props }) => (
              <code
                className={`px-1.5 py-0.5 rounded-md text-sm font-mono ${
                  inline
                    ? "bg-yellow-100 dark:bg-gray-700 text-yellow-800 dark:text-yellow-300"
                    : "block bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto"
                }`}
                {...props}
              >
                {children}
              </code>
            ),
          }}
        >
          {aiSuggestion}
        </ReactMarkdown>
      </div>
    )}
  </motion.div>
)}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[600px] shadow-lg"
          >
            <h3 className="text-lg font-bold text-blue-500 mb-4">
              Share Request to Group
            </h3>
            <form onSubmit={shareToGroup} className="space-y-3">
              <label className="block">
                <div className="text-sm mb-1">Select Group</div>
                <select
                  value={shareGroupId}
                  onChange={(e) => setShareGroupId(e.target.value)}
                  className="w-full p-3 rounded border bg-gray-800"
                >
                  <option value="">-- choose group --</option>
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <div className="text-sm mb-1">Title (optional)</div>
                <input
                  value={shareTitle}
                  onChange={(e) => setShareTitle(e.target.value)}
                  className="w-full p-3 rounded border"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sharing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  {sharing ? "Sharing..." : "Share"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Postman;
