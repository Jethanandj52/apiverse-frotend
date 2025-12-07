import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from "react-toastify";

const AddLib = ({ setShowModal,onLibraryAdded }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [category, setCategory] = useState('');
  const [version, setVersion] = useState('');
  const [license, setLicense] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [installation, setInstallation] = useState('');
  const [usage, setUsage] = useState('');
  const [integration, setIntegration] = useState('');
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleSubmit = async (e) => {
  e.preventDefault()
  const libraryData = {
    name,
    description,
    language: language.split(",").map((lang) => lang.trim()),
    category,
    version,
    license,
    usage: {
      repository: repoUrl,
      documentationUrl: docUrl,
      installation,
      usageExamples: usage,
      integrationSteps: integration,
    },
    createdAt: new Date(),
  };

  try {
  await axios.post(`${BASE_URL}/lib/libraryAddDB`, libraryData, {
  withCredentials: true,
});

onLibraryAdded();
               toast.success("Library Added Successful!", { autoClose: 1000 });
    
    setShowModal(false);
  } catch (error) {
    console.error("Error:", error);
  toast.error("Error: " + (err.response?.data || err.message), {
               autoClose: 2000,
             });
  }
};


  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 w-[750px] rounded z-60 max-h-screen overflow-y-scroll h-150"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex justify-between border-b-2 border-blue-600 px-8 py-4">
            <h2 className="text-3xl text-gray-800 font-bold dark:text-blue-400">Add Library</h2>
            <div className="cursor-pointer text-red-800 text-3xl font-bold" onClick={() => setShowModal(false)}>×</div>
          </div>

          {/* Form Fields */}
          <div className="px-8 py-6 space-y-5 text-black dark:text-white">

            {/* Basic Info */}
            <h3 className="text-xl font-semibold text-blue-600">Library Information</h3>
            <div>Library Name</div>
            <input type="text" placeholder="Library Name" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={name} onChange={e => setName(e.target.value)} />
            <div>Description</div>
            <textarea placeholder="Description" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={description} onChange={e => setDescription(e.target.value)} />
            <div>Language</div>
            <input type="text" placeholder="Languages (comma separated)" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={language} onChange={e => setLanguage(e.target.value)} />
            <div>Category</div>
            <input type="text" placeholder="Category" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={category} onChange={e => setCategory(e.target.value)} />
            <div>Version</div>
            <input type="text" placeholder="Version" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={version} onChange={e => setVersion(e.target.value)} />
           <div>License</div>
            <input type="text" placeholder="License" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={license} onChange={e => setLicense(e.target.value)} />

            {/* Usage Info */}
            <h3 className="text-xl font-semibold text-blue-600 pt-6">Usage & Integration</h3>
            <div>Repository URL</div>
            <input type="text" placeholder="Repository URL" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={repoUrl} onChange={e => setRepoUrl(e.target.value)} />
            <div>Documentation URL</div>
            <input type="text" placeholder="Documentation URL" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={docUrl} onChange={e => setDocUrl(e.target.value)} />
            <div>Installation Command</div>
            <textarea placeholder="Installation Instructions" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={installation} onChange={e => setInstallation(e.target.value)} />
            <div>Code Usage Examples</div>
            <textarea placeholder="Usage Examples" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={usage} onChange={e => setUsage(e.target.value)} />
            <div>Integeration Steps</div>
            <textarea placeholder="Integration Steps" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={integration} onChange={e => setIntegration(e.target.value)} />

            {/* Save Button */}
            <button onClick={handleSubmit} className="mt-5 bg-blue-700 hover:bg-blue-600 text-white px-6 py-2 rounded font-bold">
              Save Library
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddLib;
