import React, { useEffect, useState } from "react";
// import { getFirestore, doc, getDoc } from "../../Firebase/Firebase-config";

const Integeration = ({ setShowDoc, selectedId }) => {
  const [apiDoc, setApiDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  const db = getFirestore();

  // useEffect(() => {
  //   const fetchDoc = async () => {
  //     if (!selectedId) return;
  //     try {
  //       const docRef = doc(db, "apis", selectedId);
  //       const docSnap = await getDoc(docRef);
  //       if (docSnap.exists()) {
  //         setApiDoc(docSnap.data());
  //       }
  //     } catch (error) {
  //       console.error("Error fetching doc:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchDoc();
  // }, [selectedId]);

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-8 rounded-lg shadow-xl w-[60%] h-[90%] overflow-y-scroll relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-600 pb-3 text-2xl font-bold">
          <div className="text-blue-500">
            {apiDoc?.integration?.title || "Integration Details"}
          </div>
          <div
            className="text-red-500 hover:text-red-400 cursor-pointer"
            onClick={() => setShowDoc(false)}
          >
            <i className="fas fa-times"></i>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-blue-500 text-xl font-semibold">📘 Description</h3>
              <div className="bg-gray-200 dark:bg-gray-800 rounded p-4 mt-2 text-sm">
                {apiDoc?.integration?.description || "No description provided."}
              </div>
            </div>

            {/* Setup Steps */}
            <div>
              <h3 className="text-blue-500 text-xl font-semibold">⚙️ Setup Steps</h3>
              <div className="bg-gray-200 dark:bg-gray-800 rounded p-4 mt-2 text-sm space-y-1">
                {apiDoc?.integration?.setupSteps ? (
                  apiDoc.integration.setupSteps.split(",").map((step, index) => (
                    <div key={index}>🔹 {step.trim()}</div>
                  ))
                ) : (
                  "No setup steps provided."
                )}
              </div>
            </div>

            {/* Code Examples */}
            <div>
              <h3 className="text-blue-500 text-xl font-semibold">💻 Code Examples</h3>
              <div className="bg-gray-200 dark:bg-gray-800 rounded p-4 mt-2 text-sm font-mono whitespace-pre-wrap">
                {apiDoc?.integration?.codeExamples
                  ? apiDoc.integration.codeExamples.split("\n").map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))
                  : "No code examples available."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Integeration;
