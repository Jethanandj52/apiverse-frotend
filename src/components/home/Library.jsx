import React, { useState, useEffect, useRef } from "react";
import Nav from "./Nav";
import SideBar from "./SideBar";
import ViewDocLibHome from "./Library/ViewDocLibHome";
import axios from "axios";
import { FaBox, FaHeart, FaRegHeart } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";

const Library = () => {
  const [sideBar, setSidebar] = useState(true);
  const [libraries, setLibraries] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Popular");
  const [categorySearch, setCategorySearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDocLib, setShowDocLib] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // User + favorites
  const [userId, setUserId] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // Share modal
  const [shareLib, setShareLib] = useState(null);
  const [groups, setGroups] = useState([]);
  const [shareGroupId, setShareGroupId] = useState("");
  const [shareTitle, setShareTitle] = useState("");
  const [sharing, setSharing] = useState(false);
const BASE_URL = import.meta.env.BASE_URL;
  const dropdownRef = useRef(null);

  // Fetch user + favorites
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/user`, { withCredentials: true });
        setUserId(res.data._id);

        const favRes = await axios.get(`${BASE_URL}/store/${res.data._id}`);
        setFavorites(favRes.data.libraries.map((item) => item._id));
      } catch (error) {
        console.error("User fetch error:", error.message);
      }
    };
    fetchUser();
  }, []);

  // Toggle favorite
  const toggleFavorite = async (libId) => {
    if (!userId) return;
    try {
      if (favorites.includes(libId)) {
        await axios.delete(`${BASE_URL}/store/removeLibrary`, { data: { userId, libraryId: libId }, withCredentials: true });
        setFavorites(favorites.filter((id) => id !== libId));
      } else {
        await axios.post(`${BASE_URL}/store/addLibrary`, { userId, libraryId: libId }, { withCredentials: true });
        setFavorites([...favorites, libId]);
      }
    } catch (err) {
      console.error("Favorite toggle error:", err.message);
    }
  };

  // Fetch libraries
  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/lib/getlibraries`);
        setLibraries(res.data);
      } catch (err) {
        console.error("Error fetching libraries:", err.message);
      }
    };
    fetchLibraries();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Categories
  const categories = ["Popular", "All", ...new Set(libraries.map((item) => item.category))];

  // Filter libraries
  let filteredLibraries = [];
  if (selectedCategory === "Popular") {
    filteredLibraries = libraries.filter((item) => item.popular).slice(0, 6);
  } else if (selectedCategory === "All") {
    filteredLibraries = libraries;
  } else {
    filteredLibraries = libraries.filter((item) => item.category === selectedCategory);
  }

  if (searchQuery.trim() !== "") {
    filteredLibraries = filteredLibraries.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Share modal functions
  const openShareModal = (lib) => {
    setShareLib(lib);
    setShareGroupId("");
    setShareTitle(`${lib.name} - ${lib.category}`.slice(0, 80));
    fetchMyGroups();
  };

  const fetchMyGroups = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/groups/myGroups`, { withCredentials: true });
      setGroups(res.data);
    } catch {
      toast.error("Failed to fetch your groups");
    }
  };

  const shareToGroup = async (e) => {
    e && e.preventDefault();
    if (!shareLib || !shareGroupId) return toast.error("Select group to share into");

    setSharing(true);
    try {
      const payload = {
        title: shareTitle,
        request: {
          apiId: shareLib._id,
          name: shareLib.name,
          category: "Library",
          description: shareLib.description,
          language: shareLib.language,
          version: shareLib.version,
          license: shareLib.license,
        },
        response: null,
      };

      const res = await axios.post(`${BASE_URL}/sharedRequests/groups/${shareGroupId}/share`, payload, { withCredentials: true });
      const shareId = res.data.shareId;
      if (shareId) {
        await navigator.clipboard.writeText(`${window.location.origin}/home?sharedId=${shareId}`);
      }

      toast.success("Shared to group! Link copied to clipboard");
      setShareLib(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to share Library");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      <SideBar sideBar={sideBar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Nav sideBar={sideBar} setSidebar={setSidebar} />

        <div className={`pt-[70px] transition-all duration-300 ease-in-out ${sideBar ? "pl-[220px]" : "pl-[60px]"} min-h-screen overflow-y-auto p-6`}>
          <div className="pt-4 px-4 md:px-8 pb-10">
            <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-6 flex items-center gap-2">
              <FaBox /> Library
            </div>

            <div className="mt-6 flex flex-col md:flex-row justify-between gap-4 items-center bg-gray-100 dark:bg-gray-900 py-2">
              <div className="w-full md:w-64 relative" ref={dropdownRef}>
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">Filter by Category:</label>
                <input
                  type="text"
                  placeholder="Select Category..."
                  value={categorySearch}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onChange={(e) => {
                    setCategorySearch(e.target.value);
                    setDropdownOpen(true);
                  }}
                  className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {dropdownOpen && (
                  <div className="absolute z-50 w-full max-h-48 overflow-auto mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat) => (
                        <div key={cat} className="px-4 py-2 cursor-pointer hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors" onClick={() => { setSelectedCategory(cat); setCategorySearch(cat); setDropdownOpen(false); }}>
                          {cat}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500 dark:text-gray-400">No categories found</div>
                    )}
                  </div>
                )}
              </div>

              <div className="w-full md:w-64">
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">Search Library:</label>
                <input
                  type="text"
                  placeholder="Search in list..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {filteredLibraries.length > 0 ? (
                filteredLibraries.map((lib) => (
                  <div key={lib._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-3 hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                    <div className="flex justify-between items-center border-b pb-3 border-blue-400">
                      <h3 className="font-bold text-blue-500 text-2xl">{lib.name}</h3>
                      <button onClick={() => toggleFavorite(lib._id)}>
                        {favorites.includes(lib._id) ? <FaHeart className="text-red-500 text-xl" /> : <FaRegHeart className="text-gray-400 text-xl hover:text-red-500" />}
                      </button>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300">{lib.description}</p>

                    <div className="leading-8 text-gray-700 dark:text-gray-300">
                      <strong>Language:</strong> {lib.language?.join(", ")} <br />
                      <strong>Category:</strong> {lib.category} <br />
                      <strong>Version:</strong> {lib.version} <br />
                      <strong>License:</strong> {lib.license}
                    </div>

                    <div className="flex justify-center items-center mt-4 gap-4">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 active:scale-95 transition-transform" onClick={() => { setSelectedId(lib._id); setShowDocLib(true); }}>
                        View Docs
                      </button>
                      <button className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600" onClick={() => openShareModal(lib)}>
                        Share
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No libraries available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Docs popup */}
      {showDocLib && selectedId && <ViewDocLibHome setShowModal={setShowDocLib} id={selectedId} />}

      {/* Share modal */}
      <AnimatePresence>
        {shareLib && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[600px] shadow-lg">
              <h3 className="text-lg font-bold text-purple-600 mb-4">Share Library to Group</h3>
              <form onSubmit={shareToGroup} className="space-y-3">
                <label className="block">
                  <div className="text-sm mb-1">Select Group</div>
                  <select value={shareGroupId} onChange={(e) => setShareGroupId(e.target.value)} className="w-full p-3 rounded border">
                    <option value="">-- choose group --</option>
                    {groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <div className="text-sm mb-1">Title (optional)</div>
                  <input value={shareTitle} onChange={(e) => setShareTitle(e.target.value)} className="w-full p-3 rounded border" />
                </label>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShareLib(null)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                  <button type="submit" disabled={sharing} className="px-4 py-2 bg-purple-600 text-white rounded">{sharing ? "Sharing..." : "Share"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Library;
