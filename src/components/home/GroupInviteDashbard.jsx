import React, { useEffect, useState, useRef } from "react";
import Nav from "./Nav";
import SideBar from "./SideBar";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import ViewDocApi from ".${BASE_URL}/ViewDocApi";
import ViewDocLibHome from "./Library/ViewDocLibHome";
const BASE_URL = import.meta.env.BASE_URL;
// ====================== Modal Component ======================
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-lg relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-red-500 font-bold text-lg"
      >
        ✕
      </button>
      <h2 className="text-2xl font-bold mb-5 text-blue-500">{title}</h2>
      {children}
    </div>
  </div>
);

// ====================== Group Details ======================
const GroupDetails = ({ group }) => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/groupInvites/${group._id}/members`,
          { withCredentials: true }
        );
        setMembers(res.data);
      } catch {
        toast.error("Failed to fetch members");
      }
    };
    fetchMembers();
  }, [group]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-300 dark:border-gray-700"
    >
      <h3 className="text-xl font-semibold text-indigo-500 mb-3">Group Members</h3>
      {members.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">No members yet</p>
      ) : (
        <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
          {members.map((m) => (
            <li
              key={m._id}
              className="bg-white dark:bg-gray-800 p-2 rounded-lg flex justify-between border border-gray-300 dark:border-gray-700"
            >
              <span>{m.firstName}</span>
              {m._id === group.createdBy && (
                <span className="text-sm text-blue-500 font-semibold">(Owner)</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

// ====================== Group Chat ======================

const GroupChat = ({ groupId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [sharedRequests, setSharedRequests] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [viewApiId, setViewApiId] = useState(null);
  const [viewLibId, setViewLibId] = useState(null);
  const chatEndRef = useRef(null);
  const lastSentByUserRef = useRef(false);

  // Fetch messages and shared requests
  useEffect(() => {
    if (!groupId) return;

    const fetchData = async () => {
      try {
        const [msgRes, srRes] = await Promise.all([
          axios.get(`${BASE_URL}/messages/${groupId}`, { withCredentials: true }),
          axios.get(`${BASE_URL}/sharedRequests/group/${groupId}`, { withCredentials: true }),
        ]);

        setMessages(msgRes.data);

        // Enrich shared requests with API/Library data
        const enrichedSR = await Promise.all(
          srRes.data.map(async (sr) => {
            if ((sr.request.category === "API" || sr.request.category === "Library") && sr.request.apiId) {
              try {
                const url =
                  sr.request.category === "API"
                    ? `${BASE_URL}/rApi/getApiById/${sr.request.apiId}`
                    : `${BASE_URL}/lib/getLibById/${sr.request.apiId}`;

                const res = await axios.get(url, { withCredentials: true });
                return { ...sr, apiData: res.data };
              } catch {
                return { ...sr, apiData: null }; // fallback if not found
              }
            }
            return sr;
          })
        );

        setSharedRequests(enrichedSR);
        lastSentByUserRef.current = false;
      } catch {
        toast.error("Failed to load messages or shared requests");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [groupId]);

  // Scroll to bottom if user sent last message
  useEffect(() => {
    if (lastSentByUserRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      lastSentByUserRef.current = false;
    }
  }, [messages, sharedRequests, expanded]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/messages/${groupId}`,
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

  // Combine messages + shared requests sorted by time
  const chatItems = [
    ...messages.map((m) => ({ type: "msg", data: m })),
    ...sharedRequests.map((sr) => ({ type: "sr", data: sr })),
  ].sort((a, b) => new Date(a.data.createdAt) - new Date(b.data.createdAt));

  return (
    <div className="flex flex-col h-96 border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto mb-3 space-y-3">
        {chatItems.map((item, idx) => {
          const isUser = item.data.sender?._id === userId;
          const baseClasses = "p-2 rounded-lg max-w-xs flex flex-col break-words";
          const alignment = isUser
            ? "self-end ml-auto bg-blue-500 text-white"
            : "self-start bg-gray-200 dark:bg-gray-700";

          // ================= Message =================
          if (item.type === "msg") {
            const time = new Date(item.data.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return (
              <div key={idx} className={`${baseClasses} ${alignment}`}>
                <p className="text-sm font-semibold">{item.data.sender.firstName}</p>
                <p className="text-sm">{item.data.text}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 self-end">{time}</p>
              </div>
            );
          }

          // ================= Shared Request - API Card =================
          if (item.type === "sr" && item.data.request.category === "API") {
            const apiItem = item.data.apiData;
            if (!apiItem) return <div key={idx} className="text-red-500">API not found</div>;

            const time = new Date(item.data.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            return (
              <div
                key={idx}
                className="bg-gray-200 dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-3 cursor-pointer"
                style={{ width: "400px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div>
                  <div className="flex justify-between items-center border-b pb-3 border-blue-400">
                    <h3 className="font-bold text-blue-500 text-2xl">{apiItem.name}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{time}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{apiItem.description || "No description available"}</p>
                  <div className="leading-8 text-gray-700 dark:text-gray-300">
                    <strong>Language:</strong> {apiItem.language || "-"} <br />
                    <strong>Category:</strong> {apiItem.category || "-"} <br />
                    <strong>Version:</strong> {apiItem.version || "-"} <br />
                    <strong>License:</strong> {apiItem.license || "-"}
                  </div>
                </div>
                <div className="flex justify-center items-center mt-4">
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    onClick={() => setViewApiId(apiItem._id)}
                  >
                    View Docs
                  </button>
                </div>
              </div>
            );
          }

          // ================= Shared Request - Library Card =================
          if (item.type === "sr" && item.data.request.category === "Library") {
            const libItem = item.data.apiData;
            if (!libItem) return <div key={idx} className="text-red-500">Library not found</div>;

            const time = new Date(item.data.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            return (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-3 hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                style={{ width: "400px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div>
                  <div className="flex justify-between items-center border-b pb-3 border-blue-400">
                    <h3 className="font-bold text-blue-500 text-2xl">{libItem.name}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{time}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{libItem.description || "No description available"}</p>
                  <div className="leading-8 text-gray-700 dark:text-gray-300">
                    <strong>Language:</strong> {libItem.language?.join(", ") || "-"} <br />
                    <strong>Category:</strong> {libItem.category || "-"} <br />
                    <strong>Version:</strong> {libItem.version || "-"} <br />
                    <strong>License:</strong> {libItem.license || "-"}
                  </div>
                </div>
                <div className="flex justify-center items-center mt-4">
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    onClick={() => setViewLibId(libItem._id)}
                  >
                    View Docs
                  </button>
                </div>
              </div>
            );
          }

          // ================= Shared Request - Other =================
          if (item.type === "sr" && item.data.request.category !== "API" && item.data.request.category !== "Library") {
            const expandedSR = expanded === item.data._id;
            const time = new Date(item.data.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            return (
              <div
                key={idx}
                className={`${baseClasses} ${alignment} cursor-pointer`}
                onClick={() => setExpanded(expandedSR ? null : item.data._id)}
              >
                <p className="text-sm font-semibold">{item.data.sender.firstName}</p>
                <p className="font-semibold">{item.data.title} 📂</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Click to {expandedSR ? "collapse" : "expand"}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 self-end">{time}</p>

                {expandedSR && (
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 overflow-x-auto">
                    <pre className="text-xs">{JSON.stringify(item.data.request, null, 2)}</pre>
                    {item.data.response && (
                      <pre className="text-xs text-green-500">{JSON.stringify(item.data.response, null, 2)}</pre>
                    )}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
          placeholder="Type a message"
        />
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">
          Send
        </button>
      </form>

      {/* Modals */}
      <AnimatePresence>
        {viewApiId && <ViewDocApi setShowModal={() => setViewApiId(null)} id={viewApiId} />}
        {viewLibId && <ViewDocLibHome setShowModal={() => setViewLibId(null)} id={viewLibId} />}
      </AnimatePresence>
    </div>
  );
};


// ====================== Group Menu ======================
const GroupMenu = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute top-2 right-2">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 text-xl"
      >
        ⋮
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-28 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => { onEdit(); setOpen(false); }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-red-500"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ====================== Main Dashboard ======================
const GroupInviteDashboard = ({ userId }) => {
  const [sideBar, setSidebar] = useState(true);
  const [groups, setGroups] = useState([]);
  const [invites, setInvites] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  // Form states
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [editingGroupId, setEditingGroupId] = useState(null);

  useEffect(() => {
    fetchGroups();
    fetchInvites();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await axios.get("${BASE_URL}/groups/myGroups", { withCredentials: true });
      setGroups(res.data);
    } catch {
      toast.error("Failed to load groups");
    }
  };

  const fetchInvites = async () => {
    try {
      const res = await axios.get("${BASE_URL}/groupInvites/myInvites", { withCredentials: true });
      setInvites(res.data);
    } catch {
      toast.error("Failed to load invites");
    }
  };

  // ====================== Create / Update Group ======================
  const createGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return toast.error("Group name required");
    try {
      await axios.post(
        "${BASE_URL}/groups/create",
        { name: newGroupName, description: newGroupDesc },
        { withCredentials: true }
      );
      toast.success("Group created!");
      setShowCreateModal(false);
      setNewGroupName("");
      setNewGroupDesc("");
      fetchGroups();
    } catch {
      toast.error("Failed to create group");
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroupId(group._id);
    setNewGroupName(group.name);
    setNewGroupDesc(group.description);
    setShowCreateModal(true);
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return toast.error("Group name required");
    try {
      await axios.put(
        `${BASE_URL}/groups/update/${editingGroupId}`,
        { name: newGroupName, description: newGroupDesc },
        { withCredentials: true }
      );
      toast.success("Group updated!");
      setShowCreateModal(false);
      setEditingGroupId(null);
      setNewGroupName("");
      setNewGroupDesc("");
      fetchGroups();
    } catch {
      toast.error("Failed to update group");
    }
  };

  // ====================== Delete Group ======================
  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      await axios.delete(`${BASE_URL}/groups/delete/${groupId}`, { withCredentials: true });
      toast.success("Group deleted!");
      setSelectedGroup(null);
      fetchGroups();
    } catch {
      toast.error("Failed to delete group");
    }
  };

  // ====================== Invites ======================
  const sendInvite = async (e) => {
    e.preventDefault();
    if (!selectedGroupId || !receiverEmail) return toast.error("Select group and enter email");
    try {
      await axios.post("${BASE_URL}/groupInvites/invite", { groupId: selectedGroupId, receiverEmail }, { withCredentials: true });
      toast.success("Invite sent!");
      setReceiverEmail("");
      setSelectedGroupId("");
      setShowInviteModal(false);
      fetchInvites();
    } catch {
      toast.error("Failed to send invite");
    }
  };

  const acceptInvite = async (inviteId) => {
    try {
      await axios.post(`${BASE_URL}/groupInvites/accept/${inviteId}`, {}, { withCredentials: true });
      toast.success("Invite accepted!");
      fetchInvites();
      fetchGroups();
    } catch {
      toast.error("Failed to accept invite");
    }
  };

  const rejectInvite = async (inviteId) => {
    try {
      await axios.post(`${BASE_URL}/groupInvites/reject/${inviteId}`, {}, { withCredentials: true });
      toast.success("Invite rejected!");
      fetchInvites();
    } catch {
      toast.error("Failed to reject invite");
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 min-h-screen text-gray-900 dark:text-white">
      <Nav sideBar={sideBar} setSidebar={setSidebar} />
      <SideBar sideBar={sideBar} />

      <div className={`pt-[70px] transition-all duration-300 ${sideBar ? "pl-[220px]" : "pl-[60px]"} min-h-screen overflow-y-auto p-6`}>
        {/* Top Buttons */}
        <div className="pt-10 px-4 md:px-8 pb-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-semibold shadow-lg">➕ Create Group</button>
          <button onClick={() => setShowInviteModal(true)} className="bg-green-600 hover:bg-green-700 text-white py-6 rounded-xl font-semibold shadow-lg">✉️ Send Invite</button>
          <button onClick={() => setShowPendingModal(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white py-6 rounded-xl font-semibold shadow-lg">⏳ Pending Invites</button>
        </motion.div>

        {/* Groups List */}
        <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-2xl font-bold text-indigo-500 mb-5">Your Groups</h3>
          {groups.length === 0 ? (
            <p className="text-gray-700 dark:text-gray-300">No groups available</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map(g => (
                <li
                  key={g._id}
                  onClick={() => setSelectedGroup(g)}
                  className={`relative p-4 rounded-lg border cursor-pointer transition ${selectedGroup?._id === g._id ? "bg-blue-100 dark:bg-blue-800 border-blue-500 shadow-lg" : "bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                >
                  <GroupMenu 
                    onEdit={() => handleEditGroup(g)} 
                    onDelete={() => handleDeleteGroup(g._id)} 
                  />
                  <p className="font-semibold text-lg">{g.name}</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{g.description}</p>
                </li>
              ))}
            </ul>
          )}

          {/* Selected Group Details */}
          {selectedGroup && (
            <>
              <GroupDetails group={selectedGroup} />
              <GroupChat groupId={selectedGroup._id} userId={userId} />
            </>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <Modal title={editingGroupId ? "Edit Group" : "Create New Group"} onClose={() => { setShowCreateModal(false); setEditingGroupId(null); }}>
          <form onSubmit={editingGroupId ? handleUpdateGroup : createGroup} className="space-y-4">
            <input
              type="text"
              placeholder="Group Name"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newGroupDesc}
              onChange={e => setNewGroupDesc(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
            />
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold">
              {editingGroupId ? "Update Group" : "Create"}
            </button>
          </form>
        </Modal>
      )}

      {showInviteModal && (
        <Modal title="Send Group Invite" onClose={() => setShowInviteModal(false)}>
          <form onSubmit={sendInvite} className="space-y-4">
            <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" required>
              <option value="">Select Group</option>
              {groups.map((g) => (<option key={g._id} value={g._id}>{g.name}</option>))}
            </select>
            <input type="email" placeholder="Receiver Email" value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" required />
            <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold">Send</button>
          </form>
        </Modal>
      )}

      {showPendingModal && (
        <Modal title="Pending Invitations" onClose={() => setShowPendingModal(false)}>
          {invites.length === 0 ? (
            <p>No pending invites</p>
          ) : (
            <ul className="space-y-3">
              {invites.map((invite) => (
                <li key={invite._id} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{invite.group.name}</p>
                    <p className="text-sm text-gray-500">Invited by {invite.senderEmail}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => acceptInvite(invite._id)} className="px-3 py-1 bg-green-500 text-white rounded">Accept</button>
                    <button onClick={() => rejectInvite(invite._id)} className="px-3 py-1 bg-red-500 text-white rounded">Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
      </div>
    </div>
  );
};

export default GroupInviteDashboard;
