import React, { useEffect, useState } from "react";
import Nav from "../home/Nav";
import SideBar from "./SideBar";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify"; // ✅ Toastify import

const Feedbacks = () => {
  const [sideBar, setSidebar] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [replyId, setReplyId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); // ✅ Delete modal state
  const [loadingReply, setLoadingReply] = useState(false);
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // Load feedbacks
  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/feedback/showFeedback`);
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      toast.error("Failed to fetch feedbacks");
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // ✅ Delete feedback
  const confirmDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/feedback/deleteFeedback/${deleteId}`);
      setFeedbacks(feedbacks.filter((fb) => fb._id !== deleteId));
      toast.success("Feedback deleted successfully!", { autoClose: 1500 });
      setDeleteId(null); // ✅ Close modal
    } catch (err) {
      console.error("Error deleting feedback:", err);
      toast.error("Failed to delete feedback", { autoClose: 2000 });
    }
  };

  // ✅ Reply to feedback
  const handleReply = async () => {
    if (!replyText.trim()) return toast.error("Reply cannot be empty!");
    if (!replyId) return toast.error("No feedback selected!");

    try {
      setLoadingReply(true);
      await axios.post(`${BASE_URL}/feedback/replyFeedback/${replyId}`, {
        replyMessage: replyText,
      });

      setFeedbacks(
        feedbacks.map((fb) =>
          fb._id === replyId ? { ...fb, reply: replyText } : fb
        )
      );

      setReplyText("");
      setReplyId(null);

      toast.success("Reply sent successfully!", { autoClose: 1500 });
    } catch (err) {
      console.error("Error sending reply:", err);
      toast.error("Failed to send reply: " + (err.response?.data || err.message), {
        autoClose: 2000,
      });
    } finally {
      setLoadingReply(false);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white min-h-screen overflow-hidden">
      {/* Navbar */}
      <Nav sideBar={sideBar} setSidebar={setSidebar} />

      {/* Sidebar */}
      <SideBar sideBar={sideBar} />

      {/* Main Content */}
      <div
        className={`pt-[70px] transition-all duration-300 ease-in-out ${
          sideBar ? "pl-[300px]" : "pl-[60px]"
        } min-h-screen overflow-y-auto p-4`}
      >
        <div className="max-w-7xl mx-auto pt-6 p-10 ">
          <h2 className="text-3xl font-bold text-blue-500 mb-6 text-center">
            User Feedbacks
          </h2>

          {feedbacks.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No feedbacks yet.
            </p>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {feedbacks.map((fb) => (
                <motion.div
                  key={fb._id}
                  whileHover={{ scale: 1.03 }}
                  className="p-5 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-2xl flex flex-col"
                >
                  <h3 className="text-xl font-bold text-blue-500 mb-2 break-words">
                    {fb.subject}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 break-words">
                    {fb.email}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-3 break-words">
                    {fb.message}
                  </p>
                  <p className="mt-2 text-green-500 font-medium break-words">
                    <strong>Admin Reply:</strong> {fb.reply || "No reply yet"}
                  </p>

                  {/* Buttons */}
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => setReplyId(fb._id)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => setDeleteId(fb._id)} // ✅ Open delete modal
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ✅ Reply Modal */}
      {replyId && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-[400px]">
            <h3 className="text-xl font-bold mb-4 text-blue-500">
              Reply to Feedback
            </h3>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="w-full h-28 p-3 border rounded dark:bg-gray-700 dark:text-white"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setReplyId(null)}
                disabled={loadingReply}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={loadingReply}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loadingReply ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-[350px] text-center">
            <h3 className="text-xl font-bold mb-4 text-red-500">Confirm Delete</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this feedback?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedbacks;
