import React, { useState, useEffect, useRef } from "react";
import Nav from "../home/Nav";
import SideBar from "./SideBar";
import { FaPlug, FaHeart, FaRegHeart } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import ViewDocApi from "./APi/ViewDocApi";
import axios from "axios";
import SavedItemsPopup from "../popups/SavedItemsPopup";
import { toast } from "react-toastify";

const HomeApi = () => {
  const [sideBar, setSidebar] = useState(true);
  const [viewApiId, setViewApiId] = useState(null);
  const [api, setApi] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showSavedPopup, setShowSavedPopup] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Share modal states
  const [shareApi, setShareApi] = useState(null);
  const [groups, setGroups] = useState([]);
  const [shareGroupId, setShareGroupId] = useState("");
  const [shareTitle, setShareTitle] = useState("");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [sharing, setSharing] = useState(false);

  const dropdownRef = useRef(null);

  // ---------------- Fetch user and favorites ----------------
  useEffect(() => {
    const fetchUserAndFavorites = async () => {
      try {
        const userRes = await axios.get(`${BASE_URL}/user/user`, { withCredentials: true });
        setUserId(userRes.data._id);

        const favRes = await axios.get(`${BASE_URL}/store/${userRes.data._id}`);
        const apiFavorites = favRes.data?.apis?.map((item) => item._id) || [];
        setFavorites(apiFavorites);
      } catch {
        setFavorites([]);
      }
    };
    fetchUserAndFavorites();
  }, []);

  // ---------------- Fetch APIs ----------------
  useEffect(() => {
    const fetchApi = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/rApi/showApi`, { withCredentials: true });
        setApi(res.data);
      } catch {}
    };
    fetchApi();
  }, []);

  // ---------------- Fetch groups ----------------
  useEffect(() => {
    if (shareApi) fetchMyGroups();
  }, [shareApi]);

  const fetchMyGroups = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/groups/myGroups`, { withCredentials: true });
      setGroups(res.data);
    } catch {
      toast.error("Failed to fetch your groups");
    }
  };

  // ---------------- Close dropdown on outside click ----------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------------- Filter & Search ----------------
  const categories = ["Popular", "All", ...new Set(api.map((item) => item.category))];

  let filteredApis =
    selectedCategory === "Popular"
      ? api.filter((item) => item.popular)
      : selectedCategory === "All"
      ? api
      : api.filter((item) => item.category === selectedCategory);

  if (searchQuery.trim() !== "") {
    filteredApis = filteredApis.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // ---------------- Favorites ----------------
  const toggleFavorite = async (apiId) => {
    if (!userId) return;
    try {
      if (favorites.includes(apiId)) {
        await axios.delete(`${BASE_URL}/store/removeApi`, { data: { userId, apiId }, withCredentials: true });
        setFavorites((prev) => prev.filter((id) => id !== apiId));
      } else {
        await axios.post(`${BASE_URL}/store/addApi`, { userId, apiId }, { withCredentials: true });
        setFavorites((prev) => [...prev, apiId]);
      }
    } catch {}
  };

  // ---------------- Share ----------------
  const openShareModal = (apiItem) => {
    setShareApi(apiItem);
    setShareGroupId("");
    setShareTitle(`${apiItem.name} - ${apiItem.category}`.slice(0, 80));
  };

  const shareToGroup = async (e) => {
    e && e.preventDefault();
    if (!shareApi || !shareGroupId) return toast.error("Select group to share into");

    setSharing(true);
    try {
      const payload = {
        title: shareTitle,
        request: {
          apiId: shareApi._id,
          name: shareApi.name,
          category: "API",
          description: shareApi.description,
          language: shareApi.language,
          version: shareApi.version,
          license: shareApi.license,
        },
        response: null,
      };

      const res = await axios.post(
        `${BASE_URL}/sharedRequests/groups/${shareGroupId}/share`,
        payload,
        { withCredentials: true }
      );

      const shareId = res.data.shareId;
      if (shareId) {
        await navigator.clipboard.writeText(`${window.location.origin}/home?sharedId=${shareId}`);
      }

      toast.success("Shared to group! Link copied to clipboard");
      setShareApi(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to share API");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white overflow-hidden">
      <Nav sideBar={sideBar} setSidebar={setSidebar} />
      <SideBar sideBar={sideBar} />

      <div className={`pt-[70px] transition-all duration-300 ${sideBar ? "pl-[220px]" : "pl-[60px]"} min-h-screen overflow-y-auto p-6`}>
        <div className="pt-10 px-4 md:px-8 pb-10">
          <div className="flex text-2xl md:text-3xl font-bold text-blue-400 mb-6 items-center gap-2">
            <FaPlug /> API's Management
          </div>

          {/* Search & Category */}
          <div className="mt-6 flex flex-col md:flex-row justify-between gap-4 items-center bg-gray-100 dark:bg-gray-900 py-2">
            <div className="w-full md:w-64 relative" ref={dropdownRef}>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">Filter by Category:</label>
              <input
                type="text"
                placeholder="Select Category..."
                value={categorySearch}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onChange={(e) => { setCategorySearch(e.target.value); setDropdownOpen(true); }}
                className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {dropdownOpen && (
                <div className="absolute z-50 w-full max-h-48 overflow-auto mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <div
                        key={cat}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors"
                        onClick={() => { setSelectedCategory(cat); setCategorySearch(cat); setDropdownOpen(false); }}
                      >
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
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">Search API:</label>
              <input
                type="text"
                placeholder="Search in list..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* API Cards */}
          <div className="grid justify-center md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">
            {filteredApis.length > 0 ? (
              filteredApis.map((Api) => (
                <div key={Api._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-3 hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                  <div className="flex justify-between items-center border-b pb-3 border-blue-400">
                    <h3 className="font-bold text-blue-500 text-2xl">{Api.name}</h3>
                    <button onClick={() => toggleFavorite(Api._id)}>
                      {favorites.includes(Api._id) ? <FaHeart className="text-red-500 text-xl" /> : <FaRegHeart className="text-gray-400 text-xl hover:text-red-500" />}
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{Api.description}</p>
                  <div className="leading-8 text-gray-700 dark:text-gray-300">
                    <strong>Language:</strong> {Api.language} <br />
                    <strong>Category:</strong> {Api.category} <br />
                    <strong>Version:</strong> {Api.version} <br />
                    <strong>License:</strong> {Api.license}
                  </div>
                  <div className="flex justify-center items-center mt-4 gap-4">
                    <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700" onClick={() => setViewApiId(Api._id)}>View Docs</button>
                    <button className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600" onClick={() => openShareModal(Api)}>Share</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No APIs available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {viewApiId && <ViewDocApi setShowModal={() => setViewApiId(null)} id={viewApiId} />}
        {showSavedPopup && <SavedItemsPopup onClose={() => setShowSavedPopup(false)} favorites={favorites} setFavorites={setFavorites} />}

        {shareApi && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[600px] shadow-lg">
              <h3 className="text-lg font-bold text-purple-600 mb-4">Share API to Group</h3>
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
                  <button type="button" onClick={() => setShareApi(null)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
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

export default HomeApi;
