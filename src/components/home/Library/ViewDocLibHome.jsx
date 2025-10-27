import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTimes, FaCopy } from 'react-icons/fa';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ViewDocLibHome = ({ setShowModal, id }) => {
  const [docData, setDocData] = useState(null);
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

  // Fetch library data
  useEffect(() => {
    if (!id) return;

    const fetchLibById = async () => {
      try {
        const res = await axios.get(`/api/lib/getLibById/${id}`);
        setDocData(res.data);
      } catch (err) {
        toast.error("Error: " + (err.response?.data?.message || err.message), { autoClose: 2000 });
      }
    };

    fetchLibById();
  }, [id]);

  if (!docData) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const renderLinkOrText = (text) => {
    if (!text) return 'N/A';
    const isLink = /^https?:\/\//.test(text);
    return isLink ? (
      <a href={text} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
        {text}
      </a>
    ) : (
      <span>{text}</span>
    );
  };

  const renderField = (label, value, isCode = false, isSteps = false) => {
    if (!value) return null;

    if (isCode) {
      return (
        <div className="mb-4 relative" key={label}>
          <h3 className="text-lg font-bold text-blue-500 pb-2">{label}</h3>
          <SyntaxHighlighter language="javascript" style={isDark ? okaidia : vs} wrapLines className="rounded overflow-x-auto">
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
  // Split by comma for line breaks
  const stepsArray = Array.isArray(value) ? value : value.split(',');
  return (
    <div className="mb-4" key={label}>
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
      <div className="mb-4" key={label}>
        <h3 className="text-lg font-bold text-blue-500 pb-2">{label}</h3>
        <p className="bg-gray-100 dark:bg-gray-700 p-3 rounded whitespace-pre-wrap">{renderLinkOrText(value)}</p>
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] max-w-4xl overflow-y-auto max-h-[90vh] text-black dark:text-white shadow-lg">
          <div className="flex justify-between items-center border-b-2 border-blue-400 mb-5">
            <h2 className="text-2xl font-semibold mb-6 text-blue-600">{docData.name}</h2>
            <FaTimes onClick={() => setShowModal(false)} className="cursor-pointer text-red-400 text-3xl hover:text-red-500" />
          </div>

          {/* Basic Info */}
          {renderField("Library Name", docData.name)}
          {renderField("Description", docData.description)}
          {renderField("Category", docData.category)}
          {renderField("License", docData.license)}
          {renderField("Languages", Array.isArray(docData.language) ? docData.language.join(', ') : docData.language)}

          <hr className="my-6 border-gray-300" />
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">📄 Usage & Documentation</h2>
          {renderField("Github Repo", docData.usage?.repository)}
          {renderField("Documentation URL", docData.usage?.documentationUrl)}
          {renderField("Installation", docData.usage?.installation)}
          {renderField("Usage Examples", docData.usage?.usageExamples, true)}
          {renderField("Integration Steps", docData.usage?.integrationSteps, false, true)}

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-red-600 transition-all active:scale-90"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ViewDocLibHome;
