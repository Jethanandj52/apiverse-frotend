import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Pencil } from 'lucide-react';
import { toast } from "react-toastify";
import { FaCopy } from 'react-icons/fa';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ViewDocLib = ({ setShowModal, id }) => {
  const [docData, setDocData] = useState(null);
  const [form, setForm] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);

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

    const fetchLibById = async () => {
      try {
        const res = await axios.get(`/api/lib/getLibById/${id}`);
        setDocData(res.data);
        setForm(res.data);
      } catch (err) {
       toast.error("Error: " + (err.response?.data || err.message), {
                    autoClose: 2000,
                  });
      }
    };

    fetchLibById();
  }, [id]);

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUsageChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      usage: {
        ...prev.usage,
        [field]: value,
      }
    }));
  };

  const handleSaveField = async (field) => {
    try {
      await axios.put(`/api/lib/updateLib/${id}`, form);
      setDocData(form);
      setEditingField(null);
    } catch (err) {
      console.error("❌ Error updating:", err.message);
     toast.error("Error: " + (err.response?.data || err.message), {
                  autoClose: 2000,
                });
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!docData) return null;

  const renderUsageField = (label, field, isCode = false, isSteps = false) => {
    const value = docData.usage?.[field];
    if (!value) return null;

    if (editingField === field) {
      return (
        <>
          <input
            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
            value={form.usage?.[field] || ''}
            onChange={(e) => handleUsageChange(field, e.target.value)}
          />
          <button
            onClick={() => handleSaveField(field)}
            className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            Save
          </button>
        </>
      );
    }

    if (isCode) {
      return (
        <div className="mb-4 relative">
          <h3 className="text-lg font-bold text-blue-500 pb-2">{label}</h3>
          <SyntaxHighlighter
            language="javascript"
            style={isDark ? okaidia : vs}
            wrapLines
            className="rounded overflow-x-auto"
          >
            {value}
          </SyntaxHighlighter>
          <button
            onClick={() => handleCopy(value)}
            className="absolute top-2 right-2 text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
          >
            {copied ? "Copied!" : <FaCopy />}
          </button>
        </div>
      );
    }

    if (isSteps) {
      const stepsArray = Array.isArray(value) ? value : value.split(',');
      return (
        <div className="mb-4">
          <h3 className="text-lg font-bold text-green-500 pb-2">{label}</h3>
          <ol className="list-decimal list-inside space-y-1 bg-gray-100 dark:bg-gray-700 p-3 rounded">
            {stepsArray.map((step, idx) => (
              <li key={idx}>{step.trim()}</li>
            ))}
          </ol>
        </div>
      );
    }

    return (
      <div className="mb-4">
        <h3 className="text-lg font-bold text-blue-500 pb-2">{label}</h3>
        <p className="bg-gray-100 dark:bg-gray-700 p-3 rounded">{value}</p>
      </div>
    );
  };

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
            <div
              className="cursor-pointer text-red-800 text-3xl font-bold"
              onClick={() => setShowModal(false)}
            >
              ×
            </div>
          </div>

          <div className="space-y-4">
            {[['API Name', 'name'], ['Description', 'description'], ['Category', 'category'], ['License', 'license']].map(([label, field]) => (
              <div key={field}>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-blue-500 pb-2">{label}:</h3>
                  <Pencil
                    size={18}
                    className="text-blue-500 cursor-pointer"
                    onClick={() => setEditingField(field)}
                  />
                </div>
                {editingField === field ? (
                  <>
                    <input
                      className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
                      value={form[field] || ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                    />
                    <button
                      onClick={() => handleSaveField(field)}
                      className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <p className="bg-gray-100 dark:bg-gray-700 p-3 rounded">{docData[field] || 'N/A'}</p>
                )}
              </div>
            ))}

            {/* Language */}
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-blue-500 pb-2">Languages:</h3>
                <Pencil
                  size={18}
                  className="text-blue-500 cursor-pointer"
                  onClick={() => setEditingField('language')}
                />
              </div>
              {editingField === 'language' ? (
                <>
                  <input
                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
                    value={(form.language || []).join(', ')}
                    onChange={(e) =>
                      handleChange('language', e.target.value.split(',').map(i => i.trim()))
                    }
                  />
                  <button
                    onClick={() => handleSaveField('language')}
                    className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                </>
              ) : (
                <p className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                  {docData.language?.join(', ') || 'N/A'}
                </p>
              )}
            </div>

            {/* Usage Fields with code/steps styling */}
            {renderUsageField("Github Repo", "repository")}
            {renderUsageField("Documentation URL", "documentationUrl")}
            {renderUsageField("Installation", "installation")}
            {renderUsageField("Usage Examples", "usageExamples", true)}
            {renderUsageField("Integration Steps", "integrationSteps", false, true)}

          </div>

          {/* Close button */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => setShowModal(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ViewDocLib;
