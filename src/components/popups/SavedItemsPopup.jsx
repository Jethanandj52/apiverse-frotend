import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaHeart, FaRegHeart } from "react-icons/fa";
import ViewDocLibHome from "../home/Library/ViewDocLibHome";
import { AnimatePresence } from "framer-motion";
import ViewDocApi from "../home/APi/ViewDocApi";

const SavedItemsPopup = ({ onClose }) => {
  const [savedData, setSavedData] = useState({ apis: [], libraries: [] });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showDocLib, setShowDocLib] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [viewApiId, setViewApiId] = useState(null);
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // ✅ get userId from localStorage
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    if (storedId) {
      setUserId(storedId);
    }
  }, []);

  // ✅ fetch saved APIs + Libraries
  useEffect(() => {
    const fetchSaved = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`${BASE_URL}/store/${userId}`);
        setSavedData(res.data);
        setFavorites([
          ...res.data.apis.map((a) => a._id),
          ...res.data.libraries.map((l) => l._id),
        ]);
      } catch (err) {
        console.error("Error fetching saved items:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [userId]);

  // ✅ toggle favorite (remove from saved)
  const toggleFavorite = async (id, type) => {
    try {
      if (favorites.includes(id)) {
        await axios.delete(
          type === "api" ? `${BASE_URL}/store/removeApi` : `${BASE_URL}/store/removeLibrary`,
          { data: type === "api" ? { userId, apiId: id } : { userId, libraryId: id } }
        );
        setFavorites(favorites.filter((f) => f !== id));
        setSavedData((prev) => ({
          apis: prev.apis.filter((a) => a._id !== id),
          libraries: prev.libraries.filter((l) => l._id !== id),
        }));
      }
    } catch (err) {
      console.error("Error removing item:", err.message);
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          Loading...
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-3">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl p-6 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-300 dark:border-gray-700 pb-3">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
            ❤️ Saved Items
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-2xl transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* APIs Section */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200 text-center">
            Saved APIs
          </h3>
          {savedData.apis.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 place-items-center">
              {savedData.apis.map((api) => (
                <div
                  key={api._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 w-full max-w-sm hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="flex justify-between items-center border-b pb-3 border-blue-400">
                    <h4 className="font-bold text-blue-500 text-lg">{api.name}</h4>
                    <button onClick={() => toggleFavorite(api._id, "api")}>
                      {favorites.includes(api._id) ? (
                        <FaHeart className="text-red-500 text-lg" />
                      ) : (
                        <FaRegHeart className="text-gray-400 text-lg hover:text-red-500" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm mt-2 text-gray-700 dark:text-gray-300 line-clamp-3">
                    {api.description}
                  </p>
                  <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <p><strong>Language:</strong> {api.language}</p>
                    <p><strong>Category:</strong> {api.category}</p>
                    <p><strong>Security:</strong> {api.security}</p>
                    <p><strong>License:</strong> {api.license}</p>
                  </div>
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => setViewApiId(api._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-transform active:scale-95"
                    >
                      View Docs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No APIs saved.</p>
          )}
        </section>

        {/* Libraries Section */}
        <section>
          <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200 text-center">
            Saved Libraries
          </h3>
          {savedData.libraries.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 place-items-center">
              {savedData.libraries.map((lib) => (
                <div
                  key={lib._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 w-full max-w-sm hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="flex justify-between items-center border-b pb-3 border-blue-400">
                    <h4 className="font-bold text-blue-500 text-lg">{lib.name}</h4>
                    <button onClick={() => toggleFavorite(lib._id, "library")}>
                      {favorites.includes(lib._id) ? (
                        <FaHeart className="text-red-500 text-lg" />
                      ) : (
                        <FaRegHeart className="text-gray-400 text-lg hover:text-red-500" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm mt-2 text-gray-700 dark:text-gray-300 line-clamp-3">
                    {lib.description}
                  </p>
                  <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <p><strong>Language:</strong> {lib.language?.join(", ")}</p>
                    <p><strong>Category:</strong> {lib.category}</p>
                    <p><strong>Version:</strong> {lib.version}</p>
                    <p><strong>License:</strong> {lib.license}</p>
                  </div>
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => {
                        setSelectedId(lib._id);
                        setShowDocLib(true);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-transform active:scale-95"
                    >
                      View Docs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No Libraries saved.</p>
          )}
        </section>

        {/* ✅ Doc Popups */}
        {showDocLib && selectedId && (
          <ViewDocLibHome setShowModal={setShowDocLib} id={selectedId} />
        )}
        <AnimatePresence>
          {viewApiId && (
            <ViewDocApi setShowModal={() => setViewApiId(null)} id={viewApiId} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SavedItemsPopup;
