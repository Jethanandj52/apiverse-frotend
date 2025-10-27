import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Pencil } from 'lucide-react';
import { toast } from "react-toastify";
import { FaCopy } from 'react-icons/fa';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs, okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";

const ViewDoc = ({ setShowModal, id }) => {
  const [docData, setDocData] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [form, setForm] = useState({});
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const BASE_URL = import.meta.env.BASE_URL;
  // Detect dark mode dynamically
  useEffect(() => {
    const updateDarkMode = () => setIsDark(document.body.classList.contains("dark"));
    updateDarkMode();
    const observer = new MutationObserver(updateDarkMode);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchApiById = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/rApi/getApiById/${id}`);
        setDocData(res.data);
        setForm(res.data);
      } catch (err) {
        console.error("❌ Error loading API:", err.message);
      }
    };
    fetchApiById();
  }, [id]);

const handleSaveField = async (field, isNested = false) => {
  try {
    const updated = { ...form };

    const res = await axios.put(
      `${BASE_URL}/rApi/updateApi/${id}`,   // ✅ proxy use kiya, direct 5000 mat likho
      updated,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );

    setDocData(res.data);   // ✅ backend se updated data lelo
    setEditingField(null);
    toast.success("API updated successfully!", { autoClose: 2000 });

  } catch (err) {
    console.error("❌ Save error:", err.response?.data || err.message);
    toast.error("Error: " + (err.response?.data?.message || err.message), { autoClose: 2000 });
  }
};


  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const renderEditableField = ({ label, field, isNested = false, type = 'input', isSteps = false }) => {
    const value = isNested ? form?.[isNested]?.[field] : form?.[field];
    const originalValue = isNested ? docData?.[isNested]?.[field] : docData?.[field];

    const onChange = (e) => {
      const val = e.target.value;
      setForm(prev => {
        if (isNested) {
          return { ...prev, [isNested]: { ...prev[isNested], [field]: val } };
        } else {
          return { ...prev, [field]: val };
        }
      });
    };

    // Steps rendering
    if (!editingField && isSteps && originalValue) {
      const stepsArray = Array.isArray(originalValue) ? originalValue : originalValue.split("\n");
      return (
        <div className="mb-4" key={`${isNested || ''}-${field}`}>
          <h3 className="text-lg font-bold text-blue-500 pb-2">{label}</h3>
          <ul className="list-disc list-inside space-y-1 bg-gray-100 dark:bg-gray-700 p-3 rounded">
            {stepsArray.map((step, idx) => <li key={idx}>{step}</li>)}
          </ul>
        </div>
      );
    }

    // Code rendering
    if (!editingField && type === 'code' && originalValue) {
      return (
        <div className="mb-4 relative" key={`${isNested || ''}-${field}`}>
          <h3 className="text-lg font-bold text-blue-500 pb-2">{label}</h3>
          <SyntaxHighlighter
            language="javascript"
            style={isDark ? okaidia : vs}
            wrapLines
            className="rounded overflow-x-auto"
          >
            {originalValue}
          </SyntaxHighlighter>
          <button
            onClick={() => handleCopy(originalValue)}
            className="absolute top-2 right-2 text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
          >
            {copied ? "Copied!" : <FaCopy />}
          </button>
        </div>
      );
    }

    // Editable rendering
    return (
      <div className="mb-4 relative group" key={`${isNested || ''}-${field}`}>
        <h3 className="text-lg font-bold text-blue-500 pb-2 flex items-center justify-between">
          {label}
          {editingField !== `${isNested || ''}.${field}` && (
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() => setEditingField(`${isNested || ''}.${field}`)}
              title="Edit"
            >
              <Pencil size={18} />
            </button>
          )}
        </h3>
        {editingField === `${isNested || ''}.${field}` ? (
          <>
            {type === 'textarea' || type === 'code' ? (
              <textarea
                rows={4}
                value={value || ''}
                onChange={onChange}
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
              />
            ) : (
              <input
                value={value || ''}
                onChange={onChange}
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
              />
            )}
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleSaveField(field, isNested)}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >Save</button>
              <button
                onClick={() => { setForm(docData); setEditingField(null); }}
                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
              >Cancel</button>
            </div>
          </>
        ) : (
          <p className="bg-gray-100 dark:bg-gray-700 p-3 rounded whitespace-pre-wrap">
            {originalValue || 'N/A'}
          </p>
        )}
      </div>
    );
  };

  if (!docData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] max-w-3xl overflow-y-auto max-h-[90vh] text-black dark:text-white">
          <div className='flex justify-between items-center border-b-2 border-blue-400 mb-5'>
            <h2 className="text-2xl font-semibold mb-6 text-blue-600">{docData.name}</h2>
            <div className="cursor-pointer text-red-400 text-3xl font-bold hover:text-red-500 " onClick={() => setShowModal(false)}>X</div>
          </div>

          {renderEditableField({ label: "API Name", field: "name" })}
          {renderEditableField({ label: "Description", field: "description", type: "textarea" })}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderEditableField({ label: "Language(s)", field: "language" })}
            {renderEditableField({ label: "Category", field: "category" })}
            {renderEditableField({ label: "Security", field: "security" })}
            {renderEditableField({ label: "License", field: "license" })}
          </div>

          <hr className="my-6 border-gray-300" />
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">📄 Documentation</h2>
          {renderEditableField({ label: "Title", field: "title", isNested: "documentation" })}
          {renderEditableField({ label: "Description", field: "description", isNested: "documentation", type: "textarea" })}
          {renderEditableField({ label: "Endpoints", field: "endpoints", isNested: "documentation", type: "code" })}
          {renderEditableField({ label: "Parameters", field: "parameters", isNested: "documentation", type: "code" })}
          {renderEditableField({ label: "Examples", field: "example", isNested: "documentation", type: "code" })}

          <hr className="my-6 border-gray-300" />
          <h2 className="text-2xl font-semibold mb-4 text-green-600">🔌 Integration Guide</h2>
          {renderEditableField({ label: "Title", field: "title", isNested: "integration" })}
          {renderEditableField({ label: "Description", field: "description", isNested: "integration", type: "textarea" })}
          {renderEditableField({ label: "Setup Steps", field: "setupSteps", isNested: "integration", isSteps: false })}
          {renderEditableField({ label: "Code Examples", field: "codeExamples", isNested: "integration", type: "code" })}

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >Close</button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ViewDoc;
