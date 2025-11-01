import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from "react-toastify";


const ApiAdd = ({ setShowModal,onApiAdded }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [category, setCategory] = useState('');
  const [security, setSecurity] = useState('');
  const [license, setLicense] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [endpoints, setEndpoints] = useState('');
  const [parameters, setParameters] = useState('');
  const [docExamples, setDocExamples] = useState('');
  const [integrationTitle, setIntegrationTitle] = useState('');
  const [integrationDescription, setIntegrationDescription] = useState('');
  const [setupSteps, setSetupSteps] = useState('');
  const [codeExamples, setCodeExamples] = useState('');
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    const apiData = {
      name,
      description,
      language: language.split(',').map(lang => lang.trim()),
      category,
      security,
      license,
      createdAt: new Date(),

      documentation: {
        title: docTitle,
        description: docDescription,
        endpoints,
        parameters,
        example: docExamples,
        createdAt: new Date()
      },

      integration: {
        title: integrationTitle,
        description: integrationDescription,
        setupSteps,
        codeExamples,
        createdAt: new Date()
      }
    };

    // console.log("Submitted API Data:", apiData);
    try {
      await axios.post(`${BASE_URL}/rApi/addApiDB`, {
        withCredentials: true,
      }, apiData);
      onApiAdded();

      toast.success("Api Added Successful!", { autoClose: 1000 });

      setShowModal(false); // close after save
      
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error: " + (error.response?.data || error.message), {
        autoClose: 2000,
      });
    }
    // Optionally send this to a backend
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
            <h2 className="text-3xl text-gray-800 font-bold dark:text-blue-400">Add API</h2>
            <div className="cursor-pointer text-red-800 text-3xl font-bold" onClick={() => setShowModal(false)}>×</div>
          </div>

          {/* Form Fields */}
          <div className="px-8 py-6 space-y-5 text-black dark:text-white">

            {/* Basic Info */}
            <h3 className="text-xl font-semibold text-blue-600">Basic Information</h3>
            <input type="text" placeholder="API Name" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={name} onChange={e => setName(e.target.value)} />
            <textarea placeholder="Description" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={description} onChange={e => setDescription(e.target.value)}></textarea>
            <input type="text" placeholder="Languages (comma separated)" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={language} onChange={e => setLanguage(e.target.value)} />
            <input type="text" placeholder="Category" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={category} onChange={e => setCategory(e.target.value)} />
            <input type="text" placeholder="Security" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={security} onChange={e => setSecurity(e.target.value)} />
            <input type="text" placeholder="License" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={license} onChange={e => setLicense(e.target.value)} />

            {/* Documentation Info */}
            <h3 className="text-xl font-semibold text-blue-600 pt-6">Documentation</h3>
            <input type="text" placeholder="Doc Title" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={docTitle} onChange={e => setDocTitle(e.target.value)} />
            <textarea placeholder="Doc Description" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={docDescription} onChange={e => setDocDescription(e.target.value)}></textarea>
            <textarea type="text" placeholder="Endpoints" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={endpoints} onChange={e => setEndpoints(e.target.value)} />
            <textarea type="text" placeholder="Parameters" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={parameters} onChange={e => setParameters(e.target.value)} />
            <textarea placeholder="Examples" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={docExamples} onChange={e => setDocExamples(e.target.value)}></textarea>

            {/* Integration Info */}
            <h3 className="text-xl font-semibold text-blue-600 pt-6">Integration</h3>
            <input type="text" placeholder="Integration Title" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={integrationTitle} onChange={e => setIntegrationTitle(e.target.value)} />
            <textarea placeholder="Integration Description" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={integrationDescription} onChange={e => setIntegrationDescription(e.target.value)}></textarea>
            <textarea placeholder="Setup Steps" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={setupSteps} onChange={e => setSetupSteps(e.target.value)}></textarea>
            <textarea placeholder="Code Examples" className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700" value={codeExamples} onChange={e => setCodeExamples(e.target.value)}></textarea>

            {/* Save Button */}
           

            <button onClick={handleSubmit} className="mt-5 bg-blue-700 hover:bg-blue-600 text-white px-6 py-2 rounded font-bold">
              Save API
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ApiAdd;
