import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { FaTimes, FaCopy, FaTrash, FaEdit } from "react-icons/fa";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ViewUserApi = ({ setShowModal, id, onUpdate }) => {
  const [apiData, setApiData] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [form, setForm] = useState({});
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const currentUserId = localStorage.getItem("userId")?.trim();

  // Dark mode detection
  useEffect(() => {
    const updateDarkMode = () => setIsDark(document.body.classList.contains("dark"));
    updateDarkMode();
    const observer = new MutationObserver(updateDarkMode);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Fetch API data
  useEffect(() => {
    if (!id) return;
    const fetchApi = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/userApi/${id}`, { withCredentials: true });
        setApiData(res.data);
        setForm(res.data); // Initialize form with fetched data
      } catch (err) {
        console.error("Error fetching API:", err.message);
        toast.error("Failed to fetch API data");
      }
    };
    fetchApi();
  }, [id]);

  const isOwner = currentUserId && apiData?.user && String(apiData.user) === currentUserId;

  // Copy to clipboard
  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Delete API
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this API?")) return;

    try {
      await axios.delete(`${BASE_URL}/userApi/${id}`, { withCredentials: true });

      toast.success("API deleted successfully!");

      // Notify owner if current user is not owner
      if (!isOwner) {
        await axios.post(`${BASE_URL}/notifications`, {
          userId: apiData.user,
          type: "UserApi",
          itemId: apiData._id,
          action: "delete",
          message: `${form.name} was deleted by ${currentUserId}`
        },{ withCredentials: true }, );
      }

      if (onUpdate) onUpdate();
      setShowModal(false);
    } catch (err) {
      console.error("Delete API error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to delete API");
    }
  };

  // Save field update
  const handleSaveField = async (field) => {
    try {
      const updated = { ...form };
     await axios.put(
  `${BASE_URL}/userApi/${id}`,
  updated,
  {
    headers: { "Content-Type": "application/json" },
    withCredentials: true
  }
);


      // Notify owner if someone else updated
      if (!isOwner) {
  await axios.post(
    `${BASE_URL}/notifications/add`,
    {
      userId: apiData.user,
      type: "UserApi",
      itemId: apiData._id,
      action: "update",
      message: `${form.name} was updated by ${currentUserId}`
    },
    { withCredentials: true } // config goes here
  );
}


      setApiData(prev => ({ ...prev, [field]: updated[field] }));
      setForm(prev => ({ ...prev, [field]: updated[field] }));
      setEditingField(null);
      toast.success("API updated successfully!");

      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to update API");
    }
  };

  // Render editable field
  const renderEditableField = ({ label, field, type = "input" }) => {
    const value = form?.[field];
    const displayValue = apiData?.[field] || "N/A";

    const onChange = (e) => {
      const val = e.target.value;
      setForm(prev => ({ ...prev, [field]: val }));
    }

    return (
      <div className="mb-4 relative group" key={field}>
        <h3 className="text-lg font-bold text-blue-500 pb-2 flex items-center justify-between">
          {label}
          {isOwner && editingField !== field && (
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() => setEditingField(field)}
            >
              <FaEdit/>
            </button>
          )}
        </h3>
        {editingField === field ? (
          <>
            {type === "textarea" ? (
              <textarea
                rows={4}
                value={value || ""}
                onChange={onChange}
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
              />
            ) : (
              <input
                value={value || ""}
                onChange={onChange}
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
              />
            )}
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleSaveField(field)}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => { setForm(apiData); setEditingField(null); }}
                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <p className="bg-gray-100 dark:bg-gray-700 p-3 rounded whitespace-pre-wrap">
            {displayValue}
          </p>
        )}
      </div>
    );
  };

  if (!apiData) return null;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] max-w-4xl overflow-y-auto max-h-[90vh] text-black dark:text-white shadow-lg">
            <div className="flex justify-between items-center border-b-2 border-blue-400 mb-5">
              <h2 className="text-2xl font-semibold mb-6 text-blue-600">{apiData.name}</h2>
              <FaTimes
                onClick={() => setShowModal(false)}
                className="cursor-pointer text-red-400 text-3xl hover:text-red-500"
              />
            </div>

            {renderEditableField({ label: "API Name", field: "name" })}
            {renderEditableField({ label: "Description", field: "description", type: "textarea" })}
            {renderEditableField({ label: "Category", field: "category" })}
            {renderEditableField({ label: "Version", field: "version" })}
            {renderEditableField({ label: "Endpoints", field: "endpoints", type: "textarea" })}
            {renderEditableField({ label: "Parameters", field: "parameters", type: "textarea" })}
            {renderEditableField({ label: "Visibility", field: "visibility" })}

            <div className="mb-4 relative">
              <h3 className="text-lg font-bold text-blue-500 pb-2">Example Code</h3>
              <SyntaxHighlighter
                language="javascript"
                style={isDark ? vscDarkPlus : vs}
                wrapLines
                className="rounded overflow-x-auto"
              >
                {apiData.exampleCode || "// Not available"}
              </SyntaxHighlighter>
              <button
                onClick={() => handleCopy(apiData.exampleCode)}
                className="absolute top-2 right-2 flex items-center gap-2 text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
              >
                {copied ? "Copied!" : <FaCopy />}
              </button>
            </div>

            {isOwner && (
            <div className="flex gap-3">
              <div className="flex justify-end mt-4 ">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-red-600 transition-all active:scale-90"
                >
                  Close
                </button>
              </div>
              <div className="flex gap-4 justify-end mt-4">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
            )}

          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default ViewUserApi;
