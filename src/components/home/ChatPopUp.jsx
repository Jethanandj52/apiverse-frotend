import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import ViewDocApi from "./APi/ViewDocApi";
import ViewDocLibHome from "./Library/ViewDocLibHome";

const ChatPopUp = ({ userId, onClose }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sharedRequests, setSharedRequests] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [viewApiId, setViewApiId] = useState(null);
  const [viewLibId, setViewLibId] = useState(null);
  const chatEndRef = useRef(null);
  const lastSentByUserRef = useRef(false);
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id);

  // ✅ Fetch all groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/groups/myGroups`, {
          withCredentials: true,
        });
        setGroups(res.data);
      } catch {
        toast.error("Failed to load groups");
      }
    };
    fetchGroups();
  }, []);

  // ✅ Fetch group chat data
  useEffect(() => {
    if (!selectedGroup?._id || !isValidObjectId(selectedGroup._id)) return;

    const fetchGroupData = async () => {
      try {
        const [memberRes, msgRes, srRes] = await Promise.all([
          axios.get(
            `${BASE_URL}/groupInvites/${selectedGroup._id}/members`,
            { withCredentials: true }
          ),
          axios.get(`${BASE_URL}/messages/${selectedGroup._id}`, {
            withCredentials: true,
          }),
          axios.get(
            `${BASE_URL}/sharedRequests/group/${selectedGroup._id}`,
            { withCredentials: true }
          ),
        ]);

        setMembers(memberRes.data);
        setMessages(msgRes.data);

        // Enrich shared requests (API / Library)
        const enrichedSR = await Promise.all(
          srRes.data.map(async (sr) => {
            if (
              (sr.request.category === "API" ||
                sr.request.category === "Library") &&
              sr.request.apiId
            ) {
              try {
                const url =
                  sr.request.category === "API"
                    ? `${BASE_URL}/rApi/getApiById/${sr.request.apiId}`
                    : `${BASE_URL}/lib/getLibById/${sr.request.apiId}`;
                const apiRes = await axios.get(url, { withCredentials: true });
                return { ...sr, apiData: apiRes.data };
              } catch {
                return { ...sr, apiData: null };
              }
            }
            return sr;
          })
        );

        setSharedRequests(enrichedSR);
        lastSentByUserRef.current = false;
      } catch (err) {
        console.error(err);
        toast.error("Failed to load chat data");
      }
    };

    fetchGroupData();
    const interval = setInterval(fetchGroupData, 4000);
    return () => clearInterval(interval);
  }, [selectedGroup]);

  // ✅ Auto-scroll
  useEffect(() => {
    if (lastSentByUserRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      lastSentByUserRef.current = false;
    }
  }, [messages, sharedRequests, expanded]);

  // ✅ Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedGroup?._id) return;
    try {
      const res = await axios.post(
        `${BASE_URL}/messages/${selectedGroup._id}`,
        { text: newMsg },
        { withCredentials: true }
      );
      setMessages((prev) => [...prev, res.data]);
      setNewMsg("");
      lastSentByUserRef.current = true;
    } catch {
      toast.error("Failed to send message");
    }
  };

  // ✅ Combine messages + sharedRequests
  const chatItems = [
    ...messages.map((m) => ({ type: "msg", data: m })),
    ...sharedRequests.map((sr) => ({ type: "sr", data: sr })),
  ].sort((a, b) => new Date(a.data.createdAt) - new Date(b.data.createdAt));

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[95%] md:w-[90%] lg:w-[80%] max-w-6xl h-[90vh] flex flex-col md:flex-row relative overflow-hidden"
      >
        {/* ===== Close Button ===== */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 z-10"
        >
          <X size={20} />
        </button>

        {/* ===== Left Side: Groups ===== */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r dark:border-gray-700 p-4 overflow-y-auto">
          <h2 className="text-lg font-bold text-blue-600 mb-3">💬 Your Groups</h2>
          {groups.length === 0 ? (
            <p className="text-gray-500 text-sm">No groups available</p>
          ) : (
            <ul className="space-y-2">
              {groups.map((g) => (
                <li
                  key={g._id}
                  onClick={() => setSelectedGroup(g)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedGroup?._id === g._id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <p className="font-semibold">{g.name}</p>
                  <p className="text-xs opacity-80">{g.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ===== Right Side: Chat ===== */}
        <div className="w-full md:w-2/3 flex flex-col p-4">
          {!selectedGroup ? (
            <div className="flex-1 flex justify-center items-center text-gray-500 text-sm">
              Select a group to start chatting 💬
            </div>
          ) : (
            <>
              {/* ===== Group Header ===== */}
              <div className="border-b dark:border-gray-700 pb-2 mb-3 flex justify-between items-center">
                <h3 className="font-bold text-indigo-500 truncate">
                  {selectedGroup.name}
                </h3>
                <span className="text-xs text-gray-400">
                  {members.length} Members
                </span>
              </div>

              {/* ===== Chat Area ===== */}
              <div className="flex-1 overflow-y-auto space-y-3 p-2 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 mb-3">
                {chatItems.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm">
                    No messages yet...
                  </p>
                ) : (
                  chatItems.map((item, idx) => {
                    const isUser = item.data.sender?._id === userId;

                    // === Normal Messages ===
                    if (item.type === "msg") {
                      const time = new Date(item.data.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg max-w-xs break-words shadow ${
                            isUser
                              ? "self-end bg-blue-500 text-white ml-auto"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        >
                          <p className="text-sm font-semibold">
                            {item.data.sender.firstName}
                          </p>
                          <p>{item.data.text}</p>
                          <p className="text-xs mt-1 opacity-70">{time}</p>
                        </div>
                      );
                    }

                    // === Shared Request: API ===
                    if (
                      item.type === "sr" &&
                      item.data.request.category === "API"
                    ) {
                      const api = item.data.apiData;
                      const time = new Date(item.data.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      if (!api)
                        return (
                          <div key={idx} className="text-red-500">
                            API not found
                          </div>
                        );
                      return (
                        <div
                          key={idx}
                          className="bg-gray-200 dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-3"
                        >
                          <div className="flex justify-between border-b pb-3 border-blue-400">
                            <h3 className="font-bold text-blue-500 text-2xl">
                              {api.name}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            {api.description || "No description available"}
                          </p>
                          <div className="leading-8 text-gray-700 dark:text-gray-300">
                            <strong>Language:</strong> {api.language || "-"} <br />
                            <strong>Category:</strong> {api.category || "-"} <br />
                            <strong>Version:</strong> {api.version || "-"} <br />
                            <strong>License:</strong> {api.license || "-"}
                          </div>
                          <div className="flex justify-center mt-4">
                            <button
                              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                              onClick={() => setViewApiId(api._id)}
                            >
                              View Docs
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // === Shared Request: Library ===
                    if (
                      item.type === "sr" &&
                      item.data.request.category === "Library"
                    ) {
                      const lib = item.data.apiData;
                      const time = new Date(item.data.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      if (!lib)
                        return (
                          <div key={idx} className="text-red-500">
                            Library not found
                          </div>
                        );
                      return (
                        <div
                          key={idx}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-3 hover:scale-105 transition-all"
                        >
                          <div className="flex justify-between border-b pb-3 border-blue-400">
                            <h3 className="font-bold text-blue-500 text-2xl">
                              {lib.name}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            {lib.description || "No description available"}
                          </p>
                          <div className="leading-8 text-gray-700 dark:text-gray-300">
                            <strong>Language:</strong> {lib.language?.join(", ") || "-"} <br />
                            <strong>Category:</strong> {lib.category || "-"} <br />
                            <strong>Version:</strong> {lib.version || "-"} <br />
                            <strong>License:</strong> {lib.license || "-"}
                          </div>
                          <div className="flex justify-center mt-4">
                            <button
                              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                              onClick={() => setViewLibId(lib._id)}
                            >
                              View Docs
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // === Shared Request: Other ===
                    if (
                      item.type === "sr" &&
                      item.data.request.category !== "API" &&
                      item.data.request.category !== "Library"
                    ) {
                      const expandedSR = expanded === item.data._id;
                      const time = new Date(item.data.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return (
                        <div
                          key={idx}
                          onClick={() =>
                            setExpanded(expandedSR ? null : item.data._id)
                          }
                          className={`p-2 rounded-lg max-w-xs cursor-pointer ${
                            isUser
                              ? "self-end bg-blue-500 text-white ml-auto"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        >
                          <p className="font-semibold">
                            {item.data.sender.firstName}
                          </p>
                          <p className="font-semibold">
                            {item.data.title} 📂
                          </p>
                          <p className="text-xs opacity-70">
                            Click to {expandedSR ? "collapse" : "expand"}
                          </p>
                          <p className="text-xs mt-1 opacity-70">{time}</p>
                          {expandedSR && (
                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 overflow-x-auto">
                              <pre className="text-xs">
                                {JSON.stringify(item.data.request, null, 2)}
                              </pre>
                              {item.data.response && (
                                <pre className="text-xs text-green-500">
                                  {JSON.stringify(item.data.response, null, 2)}
                                </pre>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return null;
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* ===== Message Input ===== */}
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 rounded-md border dark:border-gray-600 dark:bg-gray-700 text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>

        {/* ===== View Docs Modals ===== */}
        <AnimatePresence>
          {viewApiId && (
            <ViewDocApi setShowModal={() => setViewApiId(null)} id={viewApiId} />
          )}
          {viewLibId && (
            <ViewDocLibHome
              setShowModal={() => setViewLibId(null)}
              id={viewLibId}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ChatPopUp;
