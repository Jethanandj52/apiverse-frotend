import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { FaTimes, FaCopy } from "react-icons/fa";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const ViewDocApi = ({ setShowModal, id }) => {
  const [docData, setDocData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const [selectedLang, setSelectedLang] = useState("JavaScript");

  const [docExample, setDocExample] = useState("");
  const [integrationCode, setIntegrationCode] = useState("");
  const [aiCode, setAiCode] = useState("");

  // ✅ New loader state
  const [loadingAi, setLoadingAi] = useState(false);

  // ✅ Detect dark mode
  useEffect(() => {
    const updateDarkMode = () =>
      setIsDark(document.body.classList.contains("dark"));
    updateDarkMode();

    const observer = new MutationObserver(updateDarkMode);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // ✅ Fetch API data by id
  useEffect(() => {
    if (!id) return;

    const fetchApiData = async () => {
      try {
        const res = await axios.get(`/api/rApi/getApiById/${id}`);
        setDocData(res.data);

        setDocExample(res.data?.documentation?.example || "");
        setIntegrationCode(res.data?.integration?.codeExamples || "");
      } catch (err) {
        console.error("Error loading API:", err.message);
      }
    };

    fetchApiData();
  }, [id]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const formatText = (text) => {
    if (!text) return null;
    const str = Array.isArray(text) ? text.join(", ") : text;
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return str.split(urlRegex).map((part, idx) =>
      urlRegex.test(part) ? (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  // ✅ Gemini AI call
  const getAiSnippet = async (jsCode, apiUrl, targetLang) => {
    if (!jsCode) return "";

    const prompt = `Convert the following JavaScript API request code into ${targetLang}.
Only return the final code without any explanation, notes, or formatting.
Use ${targetLang}'s standard HTTP client and point it to this API endpoint: ${apiUrl}.

Code:
${jsCode}`;

    try {
      setLoadingAi(true); // start loader
      const res = await axios.post("/api/ai/gemini", {
        prompt,
        language: targetLang,
      });

      let output = res.data.response || "";

      // ✅ Remove markdown fences if any
      output = output.replace(/```[\s\S]*?```/g, (match) =>
        match.replace(/```[a-zA-Z]*/g, "").replace(/```/g, "")
      );

      return output.trim();
    } catch (err) {
      console.error("AI Error:", err.message);
      return "// ❌ Failed to generate code";
    } finally {
      setLoadingAi(false); // stop loader
    }
  };

  // ✅ Run AI conversion when lang changes
  useEffect(() => {
    const fetchConverted = async () => {
      if (!docData || !integrationCode) return;

      if (selectedLang === "JavaScript") {
        setAiCode("");
        return;
      }

      const apiUrl = docData?.documentation?.endpoints || docData?.url || "";
      const converted = await getAiSnippet(
        integrationCode,
        apiUrl,
        selectedLang
      );
      setAiCode(converted);
    };

    fetchConverted();
  }, [selectedLang, docData, integrationCode]);

  if (!docData) return null;

  // ✅ Show loader text until AI response comes
  const codeToShow =
    selectedLang === "JavaScript"
      ? integrationCode
      : loadingAi
      ? "// ⏳ Generating code..."
      : aiCode || "// ❌ No code available";

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
            <h2 className="text-2xl font-semibold mb-6 text-blue-600">
              {docData.name}
            </h2>
            <FaTimes
              onClick={() => setShowModal(false)}
              className="cursor-pointer text-red-400 text-3xl hover:text-red-500"
            />
          </div>

          {/* API Info */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-blue-500 pb-2">API Name</h3>
            <p className="bg-gray-100 dark:bg-gray-900 p-3 rounded">
              {formatText(docData?.name)}
            </p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-blue-500 pb-2">Description</h3>
            <p className="bg-gray-100 dark:bg-gray-900 p-3 rounded">
              {formatText(docData?.description)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-blue-500 pb-2">
                Language(s)
              </h3>
              <p className="bg-gray-100 dark:bg-gray-900 p-3 rounded">
                {formatText(docData?.language)}
              </p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-blue-500 pb-2">Category</h3>
              <p className="bg-gray-100 dark:bg-gray-900 p-3 rounded">
                {formatText(docData?.category)}
              </p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-blue-500 pb-2">Version</h3>
              <p className="bg-gray-100 dark:bg-gray-900 p-3 rounded">
                {formatText(docData?.version)}
              </p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-blue-500 pb-2">License</h3>
              <p className="bg-gray-100 dark:bg-gray-900 p-3 rounded">
                {formatText(docData?.license)}
              </p>
            </div>
          </div>

          {/* Documentation */}
          <hr className="my-6 border-gray-300" />
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">
            📄 Documentation
          </h2>

          <div className="mb-4">
            <h3 className="text-lg font-bold text-blue-500 pb-2">Title</h3>
            <p className="bg-gray-100 dark:bg-gray-900 p-3 rounded">
              {formatText(docData?.documentation?.title)}
            </p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-blue-500 pb-2">Description</h3>
            <p className="bg-gray-100 dark:bg-gray-900 p-3 rounded">
              {formatText(docData?.documentation?.description)}
            </p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-blue-500 pb-2">Endpoints</h3>
            <p className="bg-gray-100 dark:bg-gray-900 p-3 rounded">
              {formatText(docData?.documentation?.endpoints)}
            </p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-blue-500 pb-2">Parameters</h3>
            <p className="bg-gray-100 dark:bg-gray-900 p-3 rounded">
              {formatText(docData?.documentation?.parameters)}
            </p>
          </div>
          <div className="mb-4 relative">
            <h3 className="text-lg font-bold text-blue-500">Examples</h3>
            <div className="relative">
              <SyntaxHighlighter
                language="javascript"
                style={isDark ? vscDarkPlus : vs}
                wrapLines
                className="rounded overflow-x-auto"
              >
                {docExample || "// ❌ Not available"}
              </SyntaxHighlighter>
              <button
                onClick={() => handleCopy(docExample)}
                className="absolute top-2 right-2 flex items-center gap-2 text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
              >
                <FaCopy />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Integration */}
          <hr className="my-6 border-gray-300" />
          <h2 className="text-2xl font-semibold mb-4 text-green-600">
            🔌 Integration Guide
          </h2>

          <div className="mb-4">
            <h3 className="text-lg font-bold text-blue-500 pb-2">Title</h3>
            <p className="bg-gray-100 dark:bg-gray-900 p-3 rounded">
              {formatText(docData?.integration?.title)}
            </p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-blue-500 pb-2">Description</h3>
            <p className="bg-gray-100 dark:bg-gray-900 p-3 rounded">
              {formatText(docData?.integration?.description)}
            </p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-blue-500 pb-2">Setup Steps</h3>
            <p className="bg-gray-100 dark:bg-gray-900 p-3 rounded whitespace-pre-wrap">
              {formatText(docData?.integration?.setupSteps)}
            </p>
          </div>

          {/* Integration Code Examples */}
          <div className="mb-4 relative">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-blue-500">Code Examples</h3>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="ml-2 px-2 py-1 rounded border dark:bg-gray-700 dark:text-white"
              >
                {Array.isArray(docData?.language)
                  ? docData.language.map((lang, idx) => (
                      <option key={idx} value={lang}>
                        {lang}
                      </option>
                    ))
                  : typeof docData?.language === "string"
                  ? docData.language.split(",").map((lang, idx) => (
                      <option key={idx} value={lang.trim()}>
                        {lang.trim()}
                      </option>
                    ))
                  : null}
              </select>
            </div>

            <div className="relative">
              <SyntaxHighlighter
                language={selectedLang.toLowerCase()}
                style={isDark ? vscDarkPlus : vs}
                wrapLines
                className="rounded overflow-x-auto"
              >
                {codeToShow}
              </SyntaxHighlighter>
              <button
                onClick={() => handleCopy(codeToShow)}
                className="absolute top-2 right-2 flex items-center gap-2 text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
              >
                {copied ? "Copied!" : <FaCopy />}
              </button>
            </div>
          </div>

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

export default ViewDocApi;
